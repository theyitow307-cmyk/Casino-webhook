"use client";

import { useCallback, useEffect, useState } from "react";
import type { Rates } from "@/lib/rates";

const REFRESH_MS = 60_000;

function formatLps(value: number | null, decimals = 2): string {
  if (value === null) return "—";
  return `L ${value.toLocaleString("es-HN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export default function PriceDashboard() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/rates");
      if (!res.ok) throw new Error();
      setRates(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const spread = rates?.spreadPct ?? null;

  return (
    <section className="grid sm:grid-cols-3 gap-4">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:col-span-1">
        <p className="text-sm text-slate-400 mb-1">
          Dólar cripto (USDT) — comprar
        </p>
        <p className="text-4xl font-bold text-emerald-400 tabular-nums">
          {rates ? formatLps(rates.p2pBuy) : "…"}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Mediana de los mejores anuncios de Binance P2P
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <p className="text-sm text-slate-400 mb-1">
          Dólar cripto (USDT) — vender
        </p>
        <p className="text-4xl font-bold text-slate-100 tabular-nums">
          {rates ? formatLps(rates.p2pSell) : "…"}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Lo que recibís por cada USDT que vendés
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <p className="text-sm text-slate-400 mb-1">Dólar bancario (oficial)</p>
        <p className="text-4xl font-bold text-slate-100 tabular-nums">
          {rates ? formatLps(rates.official) : "…"}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Tipo de cambio de referencia
        </p>
      </div>

      <div className="sm:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-slate-300">
          {spread !== null ? (
            <>
              El dólar cripto está{" "}
              <span
                className={`font-bold ${
                  spread >= 0 ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {Math.abs(spread).toFixed(2)}% {spread >= 0 ? "más caro" : "más barato"}
              </span>{" "}
              que el oficial
            </>
          ) : (
            "Calculando el spread…"
          )}
        </p>
        <p className="text-xs text-slate-500">
          {error && "No se pudo actualizar — mostrando el último dato. "}
          {rates?.stale &&
            "Fuentes en vivo no disponibles ahora mismo; datos de referencia. "}
          {rates &&
            `Actualizado ${new Date(rates.updatedAt).toLocaleTimeString("es-HN", {
              hour: "2-digit",
              minute: "2-digit",
            })} · se refresca cada 5 min`}
        </p>
      </div>
    </section>
  );
}
