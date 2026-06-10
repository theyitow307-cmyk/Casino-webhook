import { NextResponse } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Devuelve los snapshots de los últimos 7 días para la gráfica del spread.
export async function GET() {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/rate_snapshots?select=p2p_buy,official,created_at&created_at=gte.${since}&order=created_at.asc&limit=1000`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!res.ok) throw new Error(`Supabase respondió ${res.status}`);
    const snapshots = await res.json();
    return NextResponse.json(
      { snapshots },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch {
    return NextResponse.json({ snapshots: [] });
  }
}
