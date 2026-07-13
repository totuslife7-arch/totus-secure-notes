import {
  PostpartumFormData,
  TcbTrendRow,
  TSB_RISK_OPTIONS,
} from '@/store/postpartumTemplate';
import { formatDeliveryDateMdY } from '@/utils/formInputFilters';

const TSB_RISK_PLACEHOLDER = TSB_RISK_OPTIONS.join('/');

function joinPair(left: string, right: string, separator = ' | '): string {
  if (!left.trim() && !right.trim()) {
    return '';
  }
  return `${left.trim()}${separator}${right.trim()}`.replace(/^ \| | \| $/g, '').trim();
}

function dashSection(label: string, value?: string): string[] {
  if (!value?.trim()) {
    return [`— ${label}`];
  }
  return [`— ${label}`, value.trim()];
}

function dashPair(label: string, left: string, right: string): string[] {
  const combined = joinPair(left, right);
  if (!combined) {
    return [`— ${label}`];
  }
  return [`— ${label}`, combined];
}

function dashTriple(label: string, a: string, b: string, c: string): string[] {
  const combined = [a, b, c]
    .map((v) => v.trim())
    .filter(Boolean)
    .join(' | ');
  if (!combined) {
    return [`— ${label}`];
  }
  return [`— ${label}`, combined];
}

function educationLine(label: string, checked: boolean): string {
  return checked ? `${label} ✓` : label;
}

function formatTcbTrendRow(row: TcbTrendRow): string {
  const hours = row.hours.trim() || '__';
  const risk = row.risk.trim() || TSB_RISK_PLACEHOLDER;
  const dat = row.dat.trim();
  return `— @ ${hours}hrs (${risk})${dat ? `, DAT ${dat}` : ', DAT'}`;
}

export function formatPostpartumNote(data: PostpartumFormData): string {
  const gp =
    data.gravida.trim() || data.para.trim()
      ? `${data.gravida.trim()}/${data.para.trim()}`.replace(/^\/|\/$/g, '')
      : '';

  const birtherParent = joinPair(data.birther, data.parent);
  const deliveryFormatted = formatDeliveryDateMdY(data.deliveryDate) || data.deliveryDate;
  const infantHeader =
    data.infantName.trim() || data.infantSex.trim()
      ? `INFANT - Baby ${data.infantSex.trim()} ${data.infantName.trim()}`.trim()
      : 'INFANT - Baby Girl/Boy NAME';
  const appointmentLocation = data.appointmentLocation.trim() || 'home/clinic';
  const appointmentDays = data.appointmentDays.trim() || '___';

  const tcbLines =
    data.tcbTrends.length > 0
      ? data.tcbTrends.map(formatTcbTrendRow)
      : [`— @ __hrs (${TSB_RISK_PLACEHOLDER}), DAT`];

  const weightTrendLines: string[] = [
    ...dashSection('BW', data.bw),
    ...dashSection('Previous wt', data.previousWeight),
  ];
  if (data.lastVisitDate.trim()) {
    weightTrendLines.push(`— date of last visit: ${data.lastVisitDate.trim()}`);
  }
  if (data.visitDate.trim() || data.todaysWeight.trim()) {
    weightTrendLines.push(...dashSection('Date', data.visitDate));
    if (data.todaysWeight.trim()) {
      weightTrendLines.push(`— Today's Weight: ${data.todaysWeight.trim()}`);
    } else {
      weightTrendLines.push("— Today's Weight");
    }
  }

  const sections = [
    data.visitDayWeek.trim()
      ? `Postpartum Visit at Day/Week ${data.visitDayWeek.trim()}`
      : 'Postpartum Visit at Day/Week',
    '',
    'BIRTHER | PARENT',
    birtherParent,
    data.address.trim() ? `— address - ${data.address.trim()}` : '',
    '— HX: G/P',
    gp,
    ...dashSection('Date of Delivery', deliveryFormatted),
    ...dashSection('General', data.general),
    ...dashPair('Vitals | BP', data.vitals, data.bp),
    ...dashPair('BM | Void', data.bm, data.voiding),
    ...dashSection('Incision/Perineum', data.incision),
    ...dashSection('Lochia', data.lochia),
    ...dashTriple('Breasts | Nipples | Milk Supply', data.breasts, data.nipples, data.milkSupply),
    ...dashPair('Medications | Supplements', data.medications, data.supplements),
    ...dashSection('Follow-up', data.followUp),
    '',
    infantHeader,
    ...dashSection('DOB', data.infantDob),
    ...dashSection(
      'Birth Weight',
      data.birthWeight.trim() ? `${data.birthWeight.trim()} (grams)` : '',
    ),
    ...dashSection('Apgar', data.apgar),
    ...dashSection('HC', data.headCircumference),
    ...dashSection('Length', data.length),
    ...dashSection('PHN', data.phn),
    ...dashSection('Complications', data.complications),
    '',
    'NEWBORN WEIGHT TRENDS',
    ...weightTrendLines,
    '',
    'NEWBORN TcB/TSB TRENDS',
    ...tcbLines,
    '',
    ...dashPair('Feeding | Feeding Plan', data.feeding, data.feedingPlan),
    ...dashSection('Sleeping', data.sleeping),
    ...dashSection('Stools', data.stools),
    ...dashSection('Voids', data.voids),
    ...dashSection('Exam | Vitals | Hips', data.examHips),
    ...dashSection('Color | Skin', data.colorSkin),
    ...dashSection('Red Reflex', data.redReflex),
    ...dashSection('Umbilicus', data.umbilicus),
    ...dashSection('Newborn Metabolic screen result', data.metabolicResult),
    '',
    'DISCUSSED THE FOLLOWING WITH THE PARENT(S):',
    educationLine('— Vitamin D drops 400 IU daily', data.vitaminD),
    educationLine(
      '— Health Passport and immunization information from Public Health',
      data.healthPassport,
    ),
    educationLine("— Period of 'PURPLE' Crying", data.purpleCrying),
    '',
    'Ongoing Concerns to Follow-Up On For Mom &/or Baby:',
    `1. ${data.ongoing1.trim()}`,
    `2. ${data.ongoing2.trim()}`,
    '',
    'Next Appointment:',
    `Will be seen in ${appointmentDays} days at ${appointmentLocation}.`,
    data.mileageSummary?.trim() ? `\n${data.mileageSummary.trim()}` : '',
  ].filter((section) => section !== '');

  return sections.join('\n');
}
