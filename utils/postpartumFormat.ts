import {
  PostpartumFormData,
  TcbTrendRow,
  TSB_RISK_OPTIONS,
} from '@/store/postpartumTemplate';
import { formatDeliveryDateMdY } from '@/utils/formInputFilters';

const TSB_RISK_PLACEHOLDER = TSB_RISK_OPTIONS.join('/');

function inlineValue(label: string, value?: string): string {
  const trimmed = value?.trim();
  if (trimmed) {
    return `— ${label}: ${trimmed}`;
  }
  return `— ${label}:`;
}

function inlinePair(label: string, left: string, right: string): string {
  const leftTrim = left.trim();
  const rightTrim = right.trim();
  if (!leftTrim && !rightTrim) {
    return `— ${label}:`;
  }
  if (leftTrim && rightTrim) {
    return `— ${label}: ${leftTrim} | ${rightTrim}`;
  }
  return `— ${label}: ${leftTrim || rightTrim}`;
}

function inlineBmVoid(bm: string, voiding: string): string {
  const bmTrim = bm.trim();
  const voidTrim = voiding.trim();
  if (!bmTrim && !voidTrim) {
    return '— BM:| Void:';
  }
  if (bmTrim && voidTrim) {
    return `— BM: ${bmTrim} | Void: ${voidTrim}`;
  }
  if (bmTrim) {
    return `— BM: ${bmTrim} | Void:`;
  }
  return `— BM:| Void: ${voidTrim}`;
}

function inlineTriple(label: string, a: string, b: string, c: string): string {
  const combined = [a, b, c]
    .map((v) => v.trim())
    .filter(Boolean)
    .join(' | ');
  if (!combined) {
    return `— ${label}:`;
  }
  return `— ${label}: ${combined}`;
}

function formatTcbTrendRow(row: TcbTrendRow): string {
  const hours = row.hours.trim() || '__';
  const risk = row.risk.trim() || TSB_RISK_PLACEHOLDER;
  const dat = row.dat.trim();
  return `—  @ ${hours}hrs (${risk})${dat ? `, DAT ${dat}` : ', DAT'}`;
}

export function formatPostpartumNote(data: PostpartumFormData): string {
  const gp =
    data.gravida.trim() || data.para.trim()
      ? `${data.gravida.trim()}/${data.para.trim()}`.replace(/^\/|\/$/g, '')
      : '';

  const deliveryFormatted = formatDeliveryDateMdY(data.deliveryDate) || data.deliveryDate;
  const infantHeader =
    data.infantName.trim() || data.infantSex.trim()
      ? `INFANT- Baby ${data.infantSex.trim()} ${data.infantName.trim()}`.trim()
      : 'INFANT- Baby Girl/Boy NAME';
  const appointmentDays = data.appointmentDays.trim() || '___';
  const appointmentLocation = data.appointmentLocation.trim() || 'home/clinic';

  const birtherParent = [data.birther.trim(), data.parent.trim()].filter(Boolean).join(' | ');

  const tcbLines =
    data.tcbTrends.length > 0
      ? data.tcbTrends.map(formatTcbTrendRow)
      : [`—  @ __hrs (${TSB_RISK_PLACEHOLDER}), DAT`];

  const sections = [
    'BIRTHER | PARENT',
    birtherParent,
    gp ? `— HX: ${gp}` : '— HX: G/P',
    inlineValue('Date of Delivery', deliveryFormatted),
    inlineValue('General', data.general),
    inlinePair('Vitals | BP', data.vitals, data.bp),
    inlineBmVoid(data.bm, data.voiding),
    inlineValue('Incision/Perineum', data.incision),
    inlineValue('Lochia', data.lochia),
    inlineTriple('Breasts | Nipples | Milk Supply', data.breasts, data.nipples, data.milkSupply),
    inlinePair('Medications | Supplements', data.medications, data.supplements),
    inlineValue('Follow-up', data.followUp),
    '',
    infantHeader,
    inlineValue('DOB', data.infantDob),
    inlineValue('Birth Weight', data.birthWeight),
    inlineValue('Apgar', data.apgar),
    inlineValue('HC', data.headCircumference),
    inlineValue('Length', data.length),
    inlineValue('PHN', data.phn),
    inlineValue('Complications', data.complications),
    '',
    'NEWBORN WEIGHT TRENDS:',
    inlineValue('BW', data.bw),
    inlineValue('Previous wt', data.previousWeight),
    '',
    'NEWBORN TcB/TSB TRENDS:',
    ...tcbLines,
    '— ',
    inlinePair('Feeding | Feeding Plan', data.feeding, data.feedingPlan),
    inlineValue('Sleeping', data.sleeping),
    inlineValue('Stools', data.stools),
    inlineValue('Voids', data.voids),
    inlineValue('Exam | Vitals | Hips', data.examHips),
    inlineValue('Color | Skin', data.colorSkin),
    inlineValue('Red Reflex', data.redReflex),
    inlineValue('Umbilicus', data.umbilicus),
    inlineValue('Newborn Metabolic screen result', data.metabolicResult),
    '',
    'DISCUSSED THE FOLLOWING WITH THE PARENT(S):',
    '— Discussed Vitamin D drops 400 IU daily.',
    '— Has received Health Passport and immunization information from Public Health.',
    "— Aware of Period of 'PURPLE' Crying.",
    '',
    'Ongoing Concerns to Follow-Up On For Mom &/or Baby:',
    `1. ${data.ongoing1.trim()}`,
    `2. ${data.ongoing2.trim()}`,
    '',
    'Next Appointment:',
    `1. Will be seen in ${appointmentDays} days at ${appointmentLocation}.`,
  ].filter((section) => section !== '');

  return sections.join('\n');
}
