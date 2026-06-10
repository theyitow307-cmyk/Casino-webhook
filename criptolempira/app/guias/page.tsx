import type { Metadata } from "next";
import { BINANCE_REF_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "Cómo comprar USDT en Honduras (guía 2026) — CriptoLempira",
  description:
    "Guía paso a paso para comprar tu primer USDT con lempiras desde Honduras usando Binance P2P, y las 7 reglas de oro para no caer en estafas.",
};

const STEPS = [
  {
    title: "Abrí tu cuenta en Binance",
    body: "Registrate con tu correo y completá la verificación de identidad (KYC) con tu DNI hondureño. Sin verificación no podés usar el mercado P2P. Tarda entre minutos y un par de horas.",
  },
  {
    title: "Entrá al mercado P2P",
    body: "En la app: Trade → P2P. Elegí USDT como activo y HNL (lempira) como moneda. Vas a ver una lista de vendedores con su precio, límites y métodos de pago.",
  },
  {
    title: "Elegí bien al vendedor",
    body: "Filtrá por tu banco (BAC, Atlántida, Banpais, Tigo Money, etc.). Buscá vendedores con 95%+ de órdenes completadas, cientos de operaciones y el sello de comerciante verificado. El precio más barato de la lista casi nunca es el mejor trato.",
  },
  {
    title: "Abrí la orden y pagá",
    body: "Indicá cuántos lempiras querés cambiar. Binance congela los USDT del vendedor (escrow). Transferí desde tu banco EXACTAMENTE el monto indicado y marcá \"Pagado\" adjuntando el comprobante.",
  },
  {
    title: "Recibí tus USDT",
    body: "Cuando el vendedor confirma tu pago, Binance libera los USDT a tu cuenta. Si el vendedor no libera en el tiempo límite, abrí una apelación: el dinero está protegido por el escrow.",
  },
];

const RULES = [
  "Nunca pagués fuera de la plataforma. Si el vendedor te pide WhatsApp o \"hacerlo directo para ahorrar comisión\", es estafa. El escrow de Binance es tu única protección.",
  "No marqués \"Pagado\" sin haber pagado. Es la estafa inversa: te presionan para que marques primero. Pagá, guardá comprobante, después marcá.",
  "Verificá el nombre de la cuenta bancaria. Debe coincidir con el nombre verificado del vendedor en Binance. Cuenta a nombre de otra persona = cancelá la orden.",
  "Desconfiá de precios demasiado buenos. Un USDT 3% más barato que todos los demás es carnada, no oportunidad.",
  "Empezá con poco. Tu primera operación hacela de L 500–1,000 para aprender el flujo sin arriesgar tus ahorros.",
  "Nunca des tus claves ni códigos. Ni Binance ni ningún vendedor legítimo te va a pedir tu contraseña o código 2FA. Jamás.",
  "Guardá todos los comprobantes. Captura de la transferencia, número de orden y chat. Si hay apelación, gana el que tiene pruebas.",
];

export default function GuidesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Cómo comprar tu primer USDT desde Honduras
      </h1>
      <p className="text-slate-400 mt-3 text-lg">
        El método que usan miles de hondureños para proteger sus ahorros de la
        devaluación: comprar dólares digitales (USDT) con lempiras por Binance
        P2P. Paso a paso y sin letra pequeña.
      </p>

      <ol className="mt-10 space-y-6">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-4"
          >
            <span className="shrink-0 w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <div>
              <h2 className="font-bold text-lg">{step.title}</h2>
              <p className="text-slate-400 mt-1">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 text-center">
        <a
          href={BINANCE_REF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-lg transition-colors"
        >
          Abrir mi cuenta en Binance →
        </a>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mt-16 mb-2">
        Las 7 reglas de oro para no caer en estafas P2P
      </h2>
      <p className="text-slate-400 mb-6">
        El P2P es seguro si seguís las reglas. El 99% de las estafas pasan por
        saltarse alguna de estas.
      </p>
      <ul className="space-y-4">
        {RULES.map((rule, i) => (
          <li
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex gap-3"
          >
            <span className="text-emerald-400 font-bold shrink-0">
              {i + 1}.
            </span>
            <p className="text-slate-300">{rule}</p>
          </li>
        ))}
      </ul>

      <p className="text-sm text-slate-500 mt-10">
        Esta guía es informativa y no constituye asesoría financiera. Las
        criptomonedas no están reguladas como depósitos bancarios en Honduras;
        operá bajo tu propio criterio y riesgo.
      </p>
    </div>
  );
}
