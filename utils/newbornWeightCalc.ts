import { parseDateMdY } from '@/utils/formInputFilters';

export interface WeightCalcInput {
  bw: string;
  lastVisitDate: string;
  previousWeight: string;
  visitDate: string;
  todaysWeight: string;
}

export interface WeightCalcResult {
  /** From birth weight (bw) vs today — not used for WG. */
  weightLossPercent: number | null;
  totalWeightLostGrams: number | null;
  /** Inter-visit only: (today - previousWeight) / days; never uses bw. */
  weightGainRate: number | null;
  /** Inter-visit only: today - previousWeight in grams. */
  totalWeightGainGrams: number | null;
  daysSinceLastVisit: number | null;
}

function parseGrams(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const num = Number(trimmed.replace(/[^\d.-]/g, ''));
  return Number.isFinite(num) ? num : null;
}

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

/** Build calc input from form fields — WG uses previousWeight only, never bw. */
export function toWeightCalcInput(fields: WeightCalcInput): WeightCalcInput {
  return {
    bw: fields.bw,
    lastVisitDate: fields.lastVisitDate,
    previousWeight: fields.previousWeight,
    visitDate: fields.visitDate,
    todaysWeight: fields.todaysWeight,
  };
}

export function computeNewbornWeightTrends(input: WeightCalcInput): WeightCalcResult {
  const calcInput = toWeightCalcInput(input);
  const bw = parseGrams(calcInput.bw);
  const todaysWeight = parseGrams(calcInput.todaysWeight);
  const previousWeight = parseGrams(calcInput.previousWeight);
  const visitDate = parseDateMdY(calcInput.visitDate);
  const lastVisitDate = parseDateMdY(calcInput.lastVisitDate);

  let weightLossPercent: number | null = null;
  let totalWeightLostGrams: number | null = null;

  if (bw != null && bw > 0 && todaysWeight != null) {
    totalWeightLostGrams = bw - todaysWeight;
    weightLossPercent = ((bw - todaysWeight) / bw) * 100;
  }

  let daysSinceLastVisit: number | null = null;
  let weightGainRate: number | null = null;
  let totalWeightGainGrams: number | null = null;

  if (
    visitDate &&
    lastVisitDate &&
    todaysWeight != null &&
    previousWeight != null &&
    calcInput.previousWeight.trim() !== ''
  ) {
    daysSinceLastVisit = daysBetween(lastVisitDate, visitDate);
    const divisor = Math.max(1, daysSinceLastVisit);
    totalWeightGainGrams = todaysWeight - previousWeight;
    weightGainRate = totalWeightGainGrams / divisor;
  }

  return {
    weightLossPercent,
    totalWeightLostGrams,
    weightGainRate,
    totalWeightGainGrams,
    daysSinceLastVisit,
  };
}

export function formatWeightCalcForForm(result: WeightCalcResult): {
  weightLossPercent: string;
  totalWeightLostGrams: string;
  weightGainRate: string;
  totalWeightGainGrams: string;
} {
  return {
    weightLossPercent:
      result.weightLossPercent != null ? result.weightLossPercent.toFixed(1) : '',
    totalWeightLostGrams:
      result.totalWeightLostGrams != null ? String(Math.round(result.totalWeightLostGrams)) : '',
    weightGainRate:
      result.weightGainRate != null ? result.weightGainRate.toFixed(1) : '',
    totalWeightGainGrams:
      result.totalWeightGainGrams != null ? String(Math.round(result.totalWeightGainGrams)) : '',
  };
}
