// CriptoLempira — demo pública en vivo (versión Edge Function).
// La app completa (Next.js) vive en el repo, carpeta criptolempira/.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = "https://nqtulxfwbnejuovambal.supabase.co";
const ANON_KEY = "sb_publishable_kJ7O0jjrAp4lex3XfufOiw_SMOxcAwC";
const BASE = "/functions/v1/criptolempira";
const BINANCE_REF_URL = "https://accounts.binance.com/register";

const HISTORICAL_RATES: Record<number, number> = {
  2015: 22.37, 2016: 23.5, 2017: 23.59, 2018: 24.34, 2019: 24.63,
  2020: 24.11, 2021: 24.36, 2022: 24.65, 2023: 24.69, 2024: 25.43, 2025: 26.35,
};
const FALLBACK_OFFICIAL = 26.5;
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { rates: Rates; fetchedAt: number } | null = null;

interface Rates {
  p2pBuy: number | null;
  p2pSell: number | null;
  official: number;
  spreadPct: number | null;
  updatedAt: string;
  stale: boolean;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

async function fetchP2P(tradeType: "BUY" | "SELL"): Promise<number | null> {
  try {
    const res = await fetch(
      "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fiat: "HNL", page: 1, rows: 10, asset: "USDT", tradeType,
          payTypes: [], countries: [], publisherType: null,
          proMerchantAds: false, shieldMerchantAds: false,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
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

async function fetchOfficial(): Promise<number | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const rate = json?.rates?.HNL;
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

async function getRates(): Promise<Rates> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) return cache.rates;
  const [p2pBuy, p2pSell, official] = await Promise.all([
    fetchP2P("BUY"), fetchP2P("SELL"), fetchOfficial(),
  ]);
  const effOfficial = official ?? FALLBACK_OFFICIAL;
  const rates: Rates = {
    p2pBuy, p2pSell, official: effOfficial,
    spreadPct: p2pBuy !== null ? ((p2pBuy - effOfficial) / effOfficial) * 100 : null,
    updatedAt: new Date().toISOString(),
    stale: !(p2pBuy !== null && official !== null),
  };
  cache = { rates, fetchedAt: now };
  return rates;
}

const STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #020617; color: #f1f5f9; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
  a { color: inherit; }
  header { border-bottom: 1px solid #1e293b; position: sticky; top: 0; background: rgba(2,6,23,.92); backdrop-filter: blur(6px); z-index: 10; }
  nav { max-width: 960px; margin: 0 auto; padding: 16px; display: flex; align-items: center; justify-content: space-between; }
  .logo { font-size: 20px; font-weight: 700; text-decoration: none; }
  .logo span { color: #34d399; }
  .nav-links { display: flex; gap: 18px; align-items: center; font-size: 14px; }
  .nav-links a { color: #cbd5e1; text-decoration: none; }
  .btn { background: #10b981; color: #020617; font-weight: 700; padding: 9px 18px; border-radius: 10px; text-decoration: none; border: none; font-size: 15px; cursor: pointer; display: inline-block; }
  .btn:hover { background: #34d399; }
  .btn-outline { background: transparent; border: 1px solid #475569; color: #f1f5f9; }
  main { flex: 1; max-width: 960px; margin: 0 auto; padding: 0 16px; width: 100%; }
  .hero { text-align: center; padding: 48px 0 36px; }
  .hero h1 { font-size: clamp(28px, 5vw, 44px); line-height: 1.15; letter-spacing: -.5px; }
  .hero h1 span { color: #34d399; }
  .hero p { color: #94a3b8; margin: 16px auto 0; max-width: 620px; font-size: 17px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
  .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 22px; }
  .card.hl { border-color: rgba(52,211,153,.4); }
  .card .label { font-size: 13px; color: #94a3b8; margin-bottom: 6px; }
  .card .price { font-size: 34px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .card.hl .price { color: #34d399; }
  .card .note { font-size: 12px; color: #64748b; margin-top: 8px; }
  .spreadbar { margin-top: 14px; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 14px 22px; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; align-items: center; }
  .spreadbar .meta { font-size: 12px; color: #64748b; }
  .amber { color: #fbbf24; font-weight: 700; } .green { color: #34d399; font-weight: 700; } .red { color: #f87171; font-weight: 700; }
  section { padding-top: 52px; }
  section h2 { font-size: clamp(22px, 3.5vw, 30px); margin-bottom: 6px; }
  section .sub { color: #94a3b8; margin-bottom: 20px; }
  .panel { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 26px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media (max-width: 600px) { .grid2 { grid-template-columns: 1fr; } }
  label { display: block; font-size: 13px; color: #94a3b8; }
  input, select { width: 100%; margin-top: 5px; background: #020617; border: 1px solid #334155; border-radius: 10px; padding: 12px 14px; color: #f1f5f9; font-size: 16px; }
  input:focus, select:focus { outline: none; border-color: #10b981; }
  .row { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; align-items: baseline; padding: 10px 0; border-bottom: 1px solid #1e293b; }
  .row:last-child { border-bottom: none; }
  .row .k { color: #94a3b8; font-size: 14px; } .row .v { font-size: 19px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .smallnote { font-size: 12.5px; color: #64748b; margin-top: 12px; line-height: 1.5; }
  .cta { background: linear-gradient(90deg, rgba(16,185,129,.14), #0f172a); border: 1px solid rgba(52,211,153,.35); border-radius: 16px; padding: 26px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; }
  .cta h2 { font-size: 21px; } .cta p { color: #94a3b8; margin-top: 4px; max-width: 520px; font-size: 14.5px; }
  .cta .actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .checkbox { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; color: #cbd5e1; margin: 14px 0; }
  .checkbox input { width: auto; margin-top: 3px; accent-color: #10b981; }
  .success { background: rgba(16,185,129,.1); border: 1px solid rgba(52,211,153,.4); border-radius: 16px; padding: 30px; text-align: center; }
  .success h3 { color: #6ee7b7; font-size: 19px; }
  .success p { color: #94a3b8; font-size: 14px; margin-top: 8px; }
  footer { border-top: 1px solid #1e293b; margin-top: 64px; }
  footer .inner { max-width: 960px; margin: 0 auto; padding: 28px 16px; font-size: 13px; color: #94a3b8; line-height: 1.6; }
  ol.steps { list-style: none; display: flex; flex-direction: column; gap: 14px; margin-top: 28px; }
  ol.steps li { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 22px; display: flex; gap: 14px; }
  ol.steps .num { flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%; background: #10b981; color: #020617; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  ol.steps h3 { font-size: 17px; } ol.steps p { color: #94a3b8; font-size: 14.5px; margin-top: 4px; line-height: 1.55; }
  ul.rules { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  ul.rules li { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; display: flex; gap: 10px; font-size: 14.5px; color: #cbd5e1; line-height: 1.55; }
  ul.rules .num { color: #34d399; font-weight: 700; flex-shrink: 0; }
  .center { text-align: center; margin-top: 26px; }
`;

function page(title: string, body: string): Response {
  const html = `<!doctype html>
<html lang="es-HN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${STYLES}</style>
</head>
<body>
<header><nav>
  <a class="logo" href="${BASE}"><span>Cripto</span>Lempira</a>
  <div class="nav-links">
    <a href="${BASE}#calculadora">Calculadora</a>
    <a href="${BASE}/guias">Guías</a>
    <a class="btn" href="${BASE}#alertas" style="padding:7px 13px;font-size:13.5px">Alertas gratis</a>
  </div>
</nav></header>
<main>${body}</main>
<footer><div class="inner">
  <p><strong style="color:#cbd5e1">CriptoLempira</strong> es una herramienta informativa. No custodiamos fondos, no vendemos criptomonedas y nada de lo publicado aquí es asesoría financiera. Las criptomonedas son activos volátiles: investigá antes de invertir.</p>
  <p style="margin-top:6px">Precios P2P del mercado público de Binance. Tipo de cambio de referencia aproximado al publicado por el BCH. · Versión demo en vivo.</p>
</div></footer>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function homePage(): Response {
  const years = Object.keys(HISTORICAL_RATES)
    .map(Number).sort((a, b) => a - b)
    .map((y) => `<option value="${y}" ${y === 2020 ? "selected" : ""}>${y}</option>`)
    .join("");
  const body = `
<div class="hero">
  <h1>El precio real del <span>dólar digital</span> en Honduras</h1>
  <p>Cuánto cuesta el USDT en lempiras ahora mismo, comparado con el dólar oficial. Para que compres barato, vendás caro y nadie te vea la cara en el P2P.</p>
</div>
<div class="cards">
  <div class="card hl"><div class="label">Dólar cripto (USDT) — comprar</div><div class="price" id="pBuy">…</div><div class="note">Mediana de los mejores anuncios de Binance P2P</div></div>
  <div class="card"><div class="label">Dólar cripto (USDT) — vender</div><div class="price" id="pSell">…</div><div class="note">Lo que recibís por cada USDT que vendés</div></div>
  <div class="card"><div class="label">Dólar bancario (oficial)</div><div class="price" id="pOff">…</div><div class="note">Tipo de cambio de referencia</div></div>
</div>
<div class="spreadbar"><div id="spread">Calculando el spread…</div><div class="meta" id="updated"></div></div>

<section id="calculadora">
  <h2>¿Cuánto te ha costado ahorrar en lempiras?</h2>
  <p class="sub">El lempira pierde valor frente al dólar todos los años. Mirá cuánto valdrían hoy tus ahorros si los hubieras guardado en dólares digitales.</p>
  <div class="panel">
    <div class="grid2">
      <label>¿Cuántos lempiras tenías ahorrados?<input type="number" id="calcAmount" value="50000" min="1"></label>
      <label>¿Desde qué año?<select id="calcYear">${years}</select></label>
    </div>
    <div id="calcResult" style="margin-top:18px"></div>
  </div>
</section>

<section>
  <div class="cta">
    <div><h2>¿Primera vez comprando USDT?</h2><p>Leé nuestra guía paso a paso para comprar tu primer dólar digital desde Honduras sin que te estafen.</p></div>
    <div class="actions"><a class="btn btn-outline" href="${BASE}/guias">Ver la guía</a><a class="btn" href="${BINANCE_REF_URL}" target="_blank" rel="noopener noreferrer">Abrir cuenta en Binance</a></div>
  </div>
</section>

<section id="alertas">
  <h2>Alertas de precio gratis</h2>
  <p class="sub">Decinos a qué precio querés comprar (o vender) y te avisamos al correo cuando el mercado llegue ahí.</p>
  <form class="panel" id="alertForm">
    <div class="grid2" style="margin-bottom:14px">
      <label style="grid-column:1/-1">Tu correo<input type="email" id="fEmail" required placeholder="vos@correo.com"></label>
      <label>Avisame cuando el USDT esté<select id="fDir"><option value="below">por debajo de…</option><option value="above">por encima de…</option></select></label>
      <label>Precio meta (L por USDT)<input type="number" id="fPrice" step="0.01" min="1" placeholder="ej. 26.50"></label>
    </div>
    <div class="checkbox"><input type="checkbox" id="fPremium" checked><span>Quiero acceso anticipado al plan premium: alertas ilimitadas, histórico del spread y ranking de vendedores P2P confiables.</span></div>
    <button class="btn" type="submit" id="fBtn">Crear mi alerta gratis</button>
    <p class="smallnote" id="fMsg">Sin spam. Solo te escribimos cuando el precio llegue a tu meta o lancemos algo importante.</p>
  </form>
</section>

<script>
var RATES_HIST = ${JSON.stringify(HISTORICAL_RATES)};
var officialToday = ${FALLBACK_OFFICIAL};
function lps(v, d) { d = d === undefined ? 2 : d; return 'L ' + v.toLocaleString('es-HN', { minimumFractionDigits: d, maximumFractionDigits: d }); }
function usd(v) { return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 }); }

function loadRates() {
  fetch('${BASE}/api/rates').then(function (r) { return r.json(); }).then(function (j) {
    document.getElementById('pBuy').textContent = j.p2pBuy ? lps(j.p2pBuy) : '—';
    document.getElementById('pSell').textContent = j.p2pSell ? lps(j.p2pSell) : '—';
    document.getElementById('pOff').textContent = j.official ? lps(j.official) : '—';
    if (j.official) { officialToday = j.official; calc(); }
    var s = document.getElementById('spread');
    if (j.spreadPct !== null) {
      var up = j.spreadPct >= 0;
      s.innerHTML = 'El dólar cripto está <span class="' + (up ? 'amber' : 'green') + '">' + Math.abs(j.spreadPct).toFixed(2) + '% ' + (up ? 'más caro' : 'más barato') + '</span> que el oficial';
    } else { s.textContent = 'Mercado P2P sin datos en este momento.'; }
    var when = new Date(j.updatedAt).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('updated').textContent = (j.stale ? 'Fuentes en vivo parciales · ' : '') + 'Actualizado ' + when + ' · se refresca cada 5 min';
  }).catch(function () {});
}
loadRates();
setInterval(loadRates, 60000);

function calc() {
  var amount = Number(document.getElementById('calcAmount').value) || 0;
  var year = Number(document.getElementById('calcYear').value);
  var box = document.getElementById('calcResult');
  if (amount <= 0) { box.innerHTML = ''; return; }
  var rateThen = RATES_HIST[year];
  var usdThen = amount / rateThen;
  var valueToday = usdThen * officialToday;
  var loss = valueToday - amount;
  var pct = ((officialToday - rateThen) / rateThen) * 100;
  box.innerHTML =
    '<div class="row"><span class="k">En ' + year + ' eso compraba (a L ' + rateThen.toFixed(2) + '/$)</span><span class="v">' + usd(usdThen) + '</span></div>' +
    '<div class="row"><span class="k">Esos dólares valdrían hoy (a L ' + officialToday.toFixed(2) + '/$)</span><span class="v green">' + lps(valueToday) + '</span></div>' +
    '<div class="row"><span class="k">Lo que perdiste por guardarlos en lempiras</span><span class="v red">' + lps(loss) + '</span></div>' +
    '<p class="smallnote">El lempira se devaluó ' + pct.toFixed(1) + '% frente al dólar desde ' + year + '. Guardar en dólares digitales (USDT) no genera intereses, pero te protege de esta pérdida silenciosa. Tipo de cambio histórico aproximado (referencia BCH a fin de año).</p>';
}
document.getElementById('calcAmount').addEventListener('input', calc);
document.getElementById('calcYear').addEventListener('change', calc);
calc();

document.getElementById('alertForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var btn = document.getElementById('fBtn');
  btn.disabled = true; btn.textContent = 'Guardando…';
  var price = document.getElementById('fPrice').value;
  fetch('${SUPABASE_URL}/rest/v1/alert_subscribers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: '${ANON_KEY}', Authorization: 'Bearer ${ANON_KEY}', Prefer: 'return=minimal' },
    body: JSON.stringify({
      email: document.getElementById('fEmail').value.trim().toLowerCase(),
      target_price: price ? Number(price) : null,
      direction: document.getElementById('fDir').value,
      wants_premium: document.getElementById('fPremium').checked,
    }),
  }).then(function (r) {
    if (r.ok || r.status === 409) {
      document.getElementById('alertForm').outerHTML = '<div class="success"><h3>' + (r.status === 409 ? 'Ya tenías esta alerta registrada — todo en orden.' : '¡Listo! Te avisaremos cuando el precio llegue a tu meta.') + '</h3><p>Las alertas por correo se activan con el lanzamiento del plan premium. Sos de los primeros en la lista.</p></div>';
    } else { throw new Error(); }
  }).catch(function () {
    btn.disabled = false; btn.textContent = 'Crear mi alerta gratis';
    document.getElementById('fMsg').innerHTML = '<span class="red">No se pudo guardar. Revisá tu conexión e intentá de nuevo.</span>';
  });
});
</script>`;
  return page("CriptoLempira — El precio del dólar digital en Honduras", body);
}

function guidesPage(): Response {
  const steps = [
    ["Abrí tu cuenta en Binance", "Registrate con tu correo y completá la verificación de identidad (KYC) con tu DNI hondureño. Sin verificación no podés usar el mercado P2P. Tarda entre minutos y un par de horas."],
    ["Entrá al mercado P2P", "En la app: Trade → P2P. Elegí USDT como activo y HNL (lempira) como moneda. Vas a ver una lista de vendedores con su precio, límites y métodos de pago."],
    ["Elegí bien al vendedor", "Filtrá por tu banco (BAC, Atlántida, Banpais, Tigo Money, etc.). Buscá vendedores con 95%+ de órdenes completadas, cientos de operaciones y el sello de comerciante verificado. El precio más barato de la lista casi nunca es el mejor trato."],
    ["Abrí la orden y pagá", "Indicá cuántos lempiras querés cambiar. Binance congela los USDT del vendedor (escrow). Transferí desde tu banco EXACTAMENTE el monto indicado y marcá 'Pagado' adjuntando el comprobante."],
    ["Recibí tus USDT", "Cuando el vendedor confirma tu pago, Binance libera los USDT a tu cuenta. Si el vendedor no libera en el tiempo límite, abrí una apelación: el dinero está protegido por el escrow."],
  ].map((s, i) => `<li><span class="num">${i + 1}</span><div><h3>${s[0]}</h3><p>${s[1]}</p></div></li>`).join("");

  const rules = [
    "Nunca pagués fuera de la plataforma. Si el vendedor te pide WhatsApp o 'hacerlo directo para ahorrar comisión', es estafa. El escrow de Binance es tu única protección.",
    "No marqués 'Pagado' sin haber pagado. Es la estafa inversa: te presionan para que marques primero. Pagá, guardá comprobante, después marcá.",
    "Verificá el nombre de la cuenta bancaria. Debe coincidir con el nombre verificado del vendedor en Binance. Cuenta a nombre de otra persona = cancelá la orden.",
    "Desconfiá de precios demasiado buenos. Un USDT 3% más barato que todos los demás es carnada, no oportunidad.",
    "Empezá con poco. Tu primera operación hacela de L 500–1,000 para aprender el flujo sin arriesgar tus ahorros.",
    "Nunca des tus claves ni códigos. Ni Binance ni ningún vendedor legítimo te va a pedir tu contraseña o código 2FA. Jamás.",
    "Guardá todos los comprobantes. Captura de la transferencia, número de orden y chat. Si hay apelación, gana el que tiene pruebas.",
  ].map((r, i) => `<li><span class="num">${i + 1}.</span><span>${r}</span></li>`).join("");

  const body = `
<div style="max-width:720px;margin:0 auto;padding-top:40px">
  <h1 style="font-size:clamp(26px,4.5vw,38px);line-height:1.2">Cómo comprar tu primer USDT desde Honduras</h1>
  <p style="color:#94a3b8;margin-top:12px;font-size:17px">El método que usan miles de hondureños para proteger sus ahorros de la devaluación: comprar dólares digitales (USDT) con lempiras por Binance P2P. Paso a paso y sin letra pequeña.</p>
  <ol class="steps">${steps}</ol>
  <div class="center"><a class="btn" href="${BINANCE_REF_URL}" target="_blank" rel="noopener noreferrer">Abrir mi cuenta en Binance →</a></div>
  <h2 style="margin-top:56px">Las 7 reglas de oro para no caer en estafas P2P</h2>
  <p class="sub" style="margin-bottom:18px">El P2P es seguro si seguís las reglas. El 99% de las estafas pasan por saltarse alguna de estas.</p>
  <ul class="rules">${rules}</ul>
  <p class="smallnote" style="margin-top:28px">Esta guía es informativa y no constituye asesoría financiera. Las criptomonedas no están reguladas como depósitos bancarios en Honduras; operá bajo tu propio criterio y riesgo.</p>
</div>`;
  return page("Cómo comprar USDT en Honduras (guía) — CriptoLempira", body);
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  // El gateway puede entregar la ruta con o sin el prefijo /functions/v1.
  let path = url.pathname;
  for (const prefix of [BASE, "/criptolempira"]) {
    if (path === prefix || path.startsWith(prefix + "/")) {
      path = path.slice(prefix.length);
      break;
    }
  }
  if (path === "" || path === "/") return homePage();
  if (path === "/api/rates") {
    const rates = await getRates();
    return new Response(JSON.stringify(rates), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
  if (path === "/guias" || path === "/guias/") return guidesPage();
  return new Response("No encontrado", { status: 404 });
});
