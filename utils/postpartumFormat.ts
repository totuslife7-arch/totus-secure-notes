import { PostpartumFormData } from '@/store/postpartumTemplate';
import { formatDeliveryDateMdY } from '@/utils/formInputFilters';

function line(label: string, value: string): string {
  if (!value.trim()) {
    return label;
  }
  return `${label}\n${value.trim()}`;
}

function joinPair(left: string, right: string, separator = ' | '): string {
  if (!left.trim() && !right.trim()) {
    return '';
  }
  return `${left.trim()}${separator}${right.trim()}`.replace(/^ \| | \| $/g, '').trim();
}

function educationLine(label: string, checked: boolean): string {
  return checked ? `${label} ✓` : label;
}

export function formatPostpartumNote(data: PostpartumFormData): string {
  const gp =
    data.gravida.trim() || data.para.trim()
      ? `${data.gravida.trim()}/${data.para.trim()}`.replace(/^\/|\/$/g, '')
      : '';

  const birtherParent = joinPair(data.birther, data.parent);
  const vitalsBp = joinPair(data.vitals, data.bp);
  const bmVoid = joinPair(data.breastfeeding, data.voiding);
  const breastsLine = [data.breasts, data.nipples, data.milkSupply]
    .map((v) => v.trim())
    .filter(Boolean)
    .join(' | ');
  const medsLine = joinPair(data.medications, data.supplements);
  const infantHeader =
    data.infantName.trim() || data.infantSex.trim()
      ? `INFANT- Baby ${data.infantSex.trim()} ${data.infantName.trim()}`.trim()
      : 'INFANT- Baby Girl/Boy NAME';
  const feedingLine = joinPair(data.feeding, data.feedingPlan);

  const deliveryFormatted = formatDeliveryDateMdY(data.deliveryDate) || data.deliveryDate;

  const tcbLine =
    data.tcbHours.trim() || data.tsbRisk.trim() || data.tsbDat.trim()
      ? `—  @ ${data.tcbHours.trim() || '__'}hrs (${data.tsbRisk.trim() || 'Low Risk/Low Intermediate/High Intermediate/High Risk'}), DAT ${data.tsbDat.trim()}`
      : '—  @ __hrs (Low Risk/Low Intermediate/High Intermediate/High Risk), DAT ';

  const appointmentLocation = data.appointmentLocation.trim() || 'home/clinic';
  const appointmentDays = data.appointmentDays.trim() || '';

  const weightTrendLines = [
    line('— BW (birth day weight in grams):', data.bw),
    data.lastVisitDate.trim() || data.previousWeight.trim()
      ? `— date of last visit: ${data.lastVisitDate.trim()}             Previous weight from last visit: ${data.previousWeight.trim()}`
      : '— date of last visit:             Previous weight from last visit:',
    line('— Date:', data.visitDate),
    line('  Todays Weight:', data.todaysWeight),
  ];

  const sections = [
    `Postpartum Visit at Day/Week ${data.visitDayWeek.trim()}`.trimEnd(),
    '',
    'BIRTHER | PARENT',
    birtherParent,
    data.address.trim() ? `— address - ${data.address.trim()}` : '',
    '— HX: G/P',
    gp,
    line('— Date of Delivery:', deliveryFormatted),
    line('— General:', data.general),
    vitalsBp ? `— Vitals | BP:\n${vitalsBp}` : '— Vitals | BP:',
    bmVoid ? `— BM:| Void:\n${bmVoid}` : '— BM:| Void:',
    line('— Incision/Perineum:', data.incision),
    line('— Lochia:', data.lochia),
    breastsLine
      ? `— Breasts | Nipples | Milk Supply:\n${breastsLine}`
      : '— Breasts | Nipples | Milk Supply:',
    medsLine ? `— Medications | Supplements:\n${medsLine}` : '— Medications | Supplements:',
    line('— Follow-up:', data.followUp),
    '',
    infantHeader,
    line('— DOB:', data.infantDob),
    line('— Birth Weight:', data.birthWeight ? `${data.birthWeight.trim()} (grams)` : ''),
    line('— Apgar:', data.apgar),
    line('— HC:', data.headCircumference),
    line('— Length:', data.length),
    line('— PHN:', data.phn),
    line('— Complications:', data.complications),
    '',
    'NEWBORN WEIGHT TRENDS:',
    ...weightTrendLines,
    '',
    'NEWBORN TcB/TSB TRENDS:',
    tcbLine,
    data.tcbSecondLine.trim() ? `— ${data.tcbSecondLine.trim()}` : '—',
    '',
    feedingLine ? `— Feeding | Feeding Plan:\n${feedingLine}` : '— Feeding | Feeding Plan:',
    line('— Sleeping:', data.sleeping),
    line('— Stools:', data.stools),
    line('— Voids:', data.voids),
    line('— Exam | Vitals | Hips:', data.examHips),
    line('— Color | Skin:', data.colorSkin),
    line('— Red Reflex:', data.redReflex),
    line('— Umbilicus:', data.umbilicus),
    line('— Newborn Metabolic screen result:', data.metabolicResult),
    '',
    'DISCUSSED THE FOLLOWING WITH THE PARENT(S):',
    educationLine('— Discussed Vitamin D drops 400 IU daily.', data.vitaminD),
    educationLine(
      '— Has received Health Passport and immunization information from Public Health.',
      data.healthPassport,
    ),
    educationLine("— Aware of Period of 'PURPLE' Crying.", data.purpleCrying),
    '',
    'Ongoing Concerns to Follow-Up On For Mom &/or Baby:',
    `1. ${data.ongoing1.trim()}`,
    `2. ${data.ongoing2.trim()}`,
    '',
    'Next Appointment:',
    appointmentDays
      ? `1. Will be seen in ${appointmentDays} days at ${appointmentLocation}.`
      : `1. Will be seen in days at ${appointmentLocation}.`,
    data.mileageSummary?.trim() ? `\n${data.mileageSummary.trim()}` : '',
  ].filter((section) => section !== '');

  return sections.join('\n');
}
