import Link from "next/link";
import PriceDashboard from "@/components/PriceDashboard";
import DevaluationCalculator from "@/components/DevaluationCalculator";
import AlertForm from "@/components/AlertForm";
import { BINANCE_REF_URL } from "@/lib/links";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <section className="py-12 sm:py-16 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
          El precio real del{" "}
          <span className="text-emerald-400">dólar digital</span> en Honduras
        </h1>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
          Cuánto cuesta el USDT en lempiras ahora mismo, comparado con el
          dólar oficial. Para que compres barato, vendás caro y nadie te vea
          la cara en el P2P.
        </p>
      </section>

      <PriceDashboard />

      <section id="calculadora" className="pt-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          ¿Cuánto te ha costado ahorrar en lempiras?
        </h2>
        <p className="text-slate-400 mb-6">
          El lempira pierde valor frente al dólar todos los años. Mirá cuánto
          valdrían hoy tus ahorros si los hubieras guardado en dólares
          digitales.
        </p>
        <DevaluationCalculator />
      </section>

      <section className="pt-16">
        <div className="bg-gradient-to-r from-emerald-500/15 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              ¿Primera vez comprando USDT?
            </h2>
            <p className="text-slate-400 mt-1">
              Leé nuestra guía paso a paso para comprar tu primer dólar
              digital desde Honduras sin que te estafen, y abrí tu cuenta en
              el exchange más usado del país.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/guias"
              className="border border-slate-600 hover:border-slate-400 text-center font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Ver la guía
            </Link>
            <a
              href={BINANCE_REF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-center font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              Abrir cuenta en Binance
            </a>
          </div>
        </div>
      </section>

      <section id="alertas" className="pt-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Alertas de precio gratis
        </h2>
        <p className="text-slate-400 mb-6">
          Decinos a qué precio querés comprar (o vender) y te avisamos al
          correo cuando el mercado llegue ahí.
        </p>
        <AlertForm />
      </section>

      <section className="pt-16 grid sm:grid-cols-3 gap-4">
        {[
          {
            title: "Datos en vivo",
            body: "Precios del mercado P2P de Binance y tipo de cambio de referencia, actualizados cada 5 minutos.",
          },
          {
            title: "Sin custodia",
            body: "Nunca tocamos tu dinero. Te damos la información; vos decidís dónde y cuándo comprar.",
          },
          {
            title: "Hecho para Honduras",
            body: "Precios en lempiras, guías para bancos hondureños y el contexto que los sitios gringos no tienen.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <h3 className="font-bold text-emerald-400 mb-2">{f.title}</h3>
            <p className="text-sm text-slate-400">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
