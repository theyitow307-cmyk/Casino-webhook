# CriptoLempira

El precio del dólar digital (USDT) en Honduras, en tiempo real.

Dashboard que compara el precio del USDT en lempiras del mercado P2P de
Binance contra el tipo de cambio oficial, con calculadora de devaluación,
alertas de precio por correo y guías para comprar cripto desde Honduras.

## Funcionalidades

- **Precio en vivo**: mediana de los mejores anuncios de compra y venta de
  USDT/HNL en Binance P2P, actualizado cada 5 minutos.
- **Spread vs. oficial**: cuánto más caro (o barato) está el dólar cripto
  frente al tipo de cambio bancario.
- **Calculadora de devaluación**: cuánto valdrían hoy tus lempiras si los
  hubieras guardado en dólares desde X año.
- **Alertas de precio**: captura de correos con precio meta (Supabase).
- **Guías**: cómo comprar USDT paso a paso y las 7 reglas anti-estafas P2P
  (motor de tráfico SEO).
- **Monetización**: enlaces de afiliado de Binance (`NEXT_PUBLIC_BINANCE_REF_URL`)
  y lista de espera del plan premium.

## Stack

- Next.js 15 (App Router) + Tailwind CSS 4
- Supabase (Postgres + RLS) — proyecto `nqtulxfwbnejuovambal`
  - `alert_subscribers`: correos y precios meta (insert público, lectura bloqueada)
  - `rate_snapshots`: histórico de precios para gráficas futuras

## Desarrollo

```bash
npm install
cp .env.example .env.local   # poné tu link de afiliado real
npm run dev
```

> Nota: las APIs externas (Binance P2P y tipo de cambio) pueden estar
> bloqueadas en entornos sandbox; la app muestra datos de referencia
> marcados como tales cuando no puede alcanzarlas.

## Deploy

Pensado para Vercel: importá el repo, fijá el **Root Directory** en
`criptolempira/` y definí las variables de `.env.example`.

## Próximos pasos

- Envío real de alertas por correo (cron + Resend) — base ya capturada.
- Gráfica del spread con el histórico de `rate_snapshots`.
- Ranking de comerciantes P2P confiables (feature premium).
- Cobro del plan premium (transferencia local o cripto).
