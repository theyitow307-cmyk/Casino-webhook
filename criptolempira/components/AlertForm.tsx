"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = "idle" | "sending" | "ok" | "duplicate" | "error";

export default function AlertForm() {
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"below" | "above">("below");
  const [wantsPremium, setWantsPremium] = useState(true);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabase.from("alert_subscribers").insert({
      email: email.trim().toLowerCase(),
      target_price: targetPrice ? Number(targetPrice) : null,
      direction,
      wants_premium: wantsPremium,
    });
    if (!error) {
      setStatus("ok");
    } else if (error.code === "23505") {
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  }

  if (status === "ok" || status === "duplicate") {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-8 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-lg font-semibold text-emerald-300">
          {status === "ok"
            ? "¡Listo! Te avisaremos cuando el precio llegue a tu meta."
            : "Ya tenías esta alerta registrada — todo en orden."}
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Las alertas por correo se activan con el lanzamiento del plan
          premium. Sos de los primeros en la lista.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block sm:col-span-2">
          <span className="text-sm text-slate-400">Tu correo</span>
          <input
            type="email"
            required
            placeholder="vos@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Avisame cuando el USDT esté</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "below" | "above")}
            className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
          >
            <option value="below">por debajo de…</option>
            <option value="above">por encima de…</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Precio meta (L por USDT)</span>
          <input
            type="number"
            step="0.01"
            min="1"
            placeholder="ej. 26.50"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 tabular-nums focus:outline-none focus:border-emerald-500"
          />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={wantsPremium}
          onChange={(e) => setWantsPremium(e.target.checked)}
          className="mt-1 accent-emerald-500"
        />
        Quiero acceso anticipado al plan premium: alertas ilimitadas, histórico
        del spread y ranking de vendedores P2P confiables.
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold px-8 py-3 rounded-lg transition-colors"
      >
        {status === "sending" ? "Guardando…" : "Crear mi alerta gratis"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-400">
          No se pudo guardar. Revisá tu conexión e intentá de nuevo.
        </p>
      )}
      <p className="text-xs text-slate-500">
        Sin spam. Solo te escribimos cuando el precio llegue a tu meta o
        lancemos algo importante.
      </p>
    </form>
  );
}
