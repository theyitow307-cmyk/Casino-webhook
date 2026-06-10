import { FALLBACK_OFFICIAL_RATE } from "./historical-rates";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase";

export interface Rates {
  /** Precio mediano al que se COMPRA USDT en Binance P2P (HNL por USDT) */
  p2pBuy: number | null;
  /** Precio mediano al que se VENDE USDT en Binance P2P (HNL por USDT) */
  p2pSell: number | null;
  /** Tipo de cambio bancario de referencia (HNL por USD) */
  official: number | null;
  /** % de sobreprecio del dólar cripto vs. el oficial */
  spreadPct: number | null;
  updatedAt: string;
  /** true cuando se usaron datos de respaldo porque algún API falló */
  stale: boolean;
}

const BINANCE_P2P_URL =
  "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
const OFFICIAL_RATE_URL = "https://open.er-api.com/v6/latest/USD";

const CACHE_TTL_MS = 5 * 60 * 1000;
const SNAPSHOT_INTERVAL_MS = 10 * 60 * 1000;

let cache: { rates: Rates; fetchedAt: number } | null = null;
let lastSnapshotAt = 0;

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

async function fetchP2PPrice(tradeType: "BUY" | "SELL"): Promise<number | null> {
  try {
    const res = await fetch(BINANCE_P2P_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fiat: "HNL",
        page: 1,
        rows: 10,
        asset: "USDT",
        tradeType,
        payTypes: [],
        countries: [],
        publisherType: null,
        proMerchantAds: false,
        shieldMerchantAds: false,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const prices: number[] = (json?.data ?? [])
      .map((ad: { adv?: { price?: string } }) => parseFloat(ad?.adv?.price ?? ""))
      .filter((p: number) => Number.isFinite(p) && p > 0);
    return median(prices);
  } catch {
    return null;
  }
}

async function fetchOfficialRate(): Promise<number | null> {
  try {
    const res = await fetch(OFFICIAL_RATE_URL, {
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const rate = json?.rates?.HNL;
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

async function saveSnapshot(rates: Rates): Promise<void> {
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;
  try {
    await fetch(`${url}/rest/v1/rate_snapshots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        p2p_buy: rates.p2pBuy,
        p2p_sell: rates.p2pSell,
        official: rates.official,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // El histórico es opcional: nunca debe tumbar la respuesta principal.
  }
}

export async function getRates(): Promise<Rates> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rates;
  }

  const [p2pBuy, p2pSell, official] = await Promise.all([
    fetchP2PPrice("BUY"),
    fetchP2PPrice("SELL"),
    fetchOfficialRate(),
  ]);

  const live = p2pBuy !== null && official !== null;
  const effectiveOfficial = official ?? FALLBACK_OFFICIAL_RATE;
  const rates: Rates = {
    p2pBuy,
    p2pSell,
    official: effectiveOfficial,
    spreadPct:
      p2pBuy !== null
        ? ((p2pBuy - effectiveOfficial) / effectiveOfficial) * 100
        : null,
    updatedAt: new Date().toISOString(),
    stale: !live,
  };

  cache = { rates, fetchedAt: now };

  if (live && now - lastSnapshotAt > SNAPSHOT_INTERVAL_MS) {
    lastSnapshotAt = now;
    void saveSnapshot(rates);
  }

  return rates;
}
