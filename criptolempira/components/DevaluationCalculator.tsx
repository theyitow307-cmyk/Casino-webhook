"use client";

import { useEffect, useState } from "react";
import {
  HISTORICAL_RATES,
  FALLBACK_OFFICIAL_RATE,
} from "@/lib/historical-rates";

const YEARS = Object.keys(HISTORICAL_RATES)
  .map(Number)
  .sort((a, b) => a - b);

function formatLps(value: number): string {
  return `L ${value.toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DevaluationCalculator() {
  const [amount, setAmount] = useState(50_000);
  const [year, setYear] = useState(2020);
  const [todayRate, setTodayRate] = useState(FALLBACK_OFFICIAL_RATE);

  useEffect(() => {
    fetch("/api/rates")
      .then((res) => (res.ok ? res.json() : null))
      .then((rates) => {
        if (rates?.official) setTodayRate(rates.official);
      })
      .catch(() => {});
  }, []);

  const rateThen = HISTORICAL_RATES[year];
  const usdThen = amount / rateThen;
  const valueToday = usdThen * todayRate;
  const gain = valueToday - amount;
  const lossPct = ((todayRate - rateThen) / rateThen) * 100;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <label className="block">
          <span className="text-sm text-slate-400">
            ¿Cuántos lempiras tenías ahorrados?
          </span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-lg tabular-nums focus:outline-none focus:border-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">¿Desde qué año?</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-emerald-500"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {amount > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="text-slate-400">
              En {year} eso compraba (a L {rateThen.toFixed(2)}/$)
            </span>
            <span className="text-xl font-semibold tabular-nums">
              ${usdThen.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="text-slate-400">
              Esos dólares valdrían hoy (a L {todayRate.toFixed(2)}/$)
            </span>
            <span className="text-xl font-semibold text-emerald-400 tabular-nums">
              {formatLps(valueToday)}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-slate-400">
              Lo que perdiste por guardarlos en lempiras
            </span>
            <span className="text-2xl font-bold text-red-400 tabular-nums">
              {formatLps(gain)}
            </span>
          </div>
          <p className="text-sm text-slate-500 pt-2">
            El lempira se devaluó {lossPct.toFixed(1)}% frente al dólar desde{" "}
            {year}. Guardar en dólares digitales (USDT) no genera intereses,
            pero te protege de esta pérdida silenciosa. Tipo de cambio
            histórico aproximado (referencia BCH a fin de año).
          </p>
        </div>
      )}
    </div>
  );
}
