import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CriptoLempira — El precio del dólar digital en Honduras",
  description:
    "Precio del USDT en lempiras en tiempo real, comparado con el tipo de cambio oficial. Calculadora de devaluación, alertas de precio y guías para comprar tu primer dólar digital en Honduras.",
  keywords: [
    "USDT Honduras",
    "dólar digital Honduras",
    "Binance P2P lempiras",
    "tipo de cambio lempira",
    "comprar USDT Honduras",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-HN">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        <header className="border-b border-slate-800 sticky top-0 z-10 bg-slate-950/90 backdrop-blur">
          <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-emerald-400">Cripto</span>Lempira
            </Link>
            <div className="flex items-center gap-5 text-sm">
              <Link
                href="/#calculadora"
                className="text-slate-300 hover:text-white transition-colors hidden sm:inline"
              >
                Calculadora
              </Link>
              <Link
                href="/guias"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Guías
              </Link>
              <Link
                href="/#alertas"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                Alertas gratis
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-8 text-sm text-slate-400 space-y-2">
            <p>
              <span className="font-semibold text-slate-300">
                CriptoLempira
              </span>{" "}
              es una herramienta informativa. No custodiamos fondos, no
              vendemos criptomonedas y nada de lo publicado aquí es asesoría
              financiera. Las criptomonedas son activos volátiles: investigá
              antes de invertir.
            </p>
            <p>
              Precios P2P obtenidos del mercado público de Binance. Tipo de
              cambio de referencia aproximado al publicado por el BCH.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
