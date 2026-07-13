/**
 * Manual assertions for newborn weight calc. Run: npx tsx utils/newbornWeightCalc.test.ts
 */
import {
  computeNewbornWeightTrends,
  formatWeightCalcForForm,
  type WeightCalcInput,
} from './newbornWeightCalc';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function approx(a: number, b: number, eps = 0.05): boolean {
  return Math.abs(a - b) <= eps;
}

const base: WeightCalcInput = {
  bw: '3500',
  lastVisitDate: '6/15/2026',
  previousWeight: '3200',
  visitDate: '6/18/2026',
  todaysWeight: '3250',
};

const caseA = computeNewbornWeightTrends(base);
assert(caseA.weightGainRate != null && approx(caseA.weightGainRate, 16.7), 'Case A: WG g/day');
assert(caseA.totalWeightGainGrams === 50, 'Case A: inter-visit gain grams');
assert(caseA.weightLossPercent != null && approx(caseA.weightLossPercent, 7.14, 0.1), 'Case A: WL%');

const caseB = computeNewbornWeightTrends({
  ...base,
  previousWeight: '',
  lastVisitDate: '',
});
assert(caseB.weightGainRate == null, 'Case B: no WG without previous weight');
assert(caseB.totalWeightGainGrams == null, 'Case B: no inter-visit gain without previous');

const caseC = computeNewbornWeightTrends({
  bw: '3500',
  lastVisitDate: '6/17/2026',
  previousWeight: '3500',
  visitDate: '6/18/2026',
  todaysWeight: '3400',
});
assert(caseC.weightGainRate != null && approx(caseC.weightGainRate, -100, 0.1), 'Case C: loss since last visit');
assert(caseC.totalWeightLostGrams === 100, 'Case C: WL from birth still uses bw');

const formatted = formatWeightCalcForForm(caseA);
assert(formatted.weightGainRate === '16.7', 'Format WG rate');
assert(formatted.totalWeightGainGrams === '50', 'Format inter-visit gain');

console.log('newbornWeightCalc: all tests passed');
