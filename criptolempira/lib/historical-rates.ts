// Tipo de cambio HNL por USD a fin de año (referencia BCH, valores aproximados).
// Se usa solo para la calculadora de devaluación; el dato del día viene del API.
export const HISTORICAL_RATES: Record<number, number> = {
  2015: 22.37,
  2016: 23.5,
  2017: 23.59,
  2018: 24.34,
  2019: 24.63,
  2020: 24.11,
  2021: 24.36,
  2022: 24.65,
  2023: 24.69,
  2024: 25.43,
  2025: 26.35,
};

export const OLDEST_YEAR = Math.min(...Object.keys(HISTORICAL_RATES).map(Number));
export const NEWEST_YEAR = Math.max(...Object.keys(HISTORICAL_RATES).map(Number));

// Valor de respaldo si el API de tipo de cambio no responde.
export const FALLBACK_OFFICIAL_RATE = 26.5;
