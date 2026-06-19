export interface PostpartumFormData {
  visitDayWeek: string;
  birther: string;
  parent: string;
  gravida: string;
  para: string;
  deliveryDate: string;
  general: string;
  vitals: string;
  bp: string;
  breastfeeding: string;
  voiding: string;
  incision: string;
  lochia: string;
  breasts: string;
  nipples: string;
  milkSupply: string;
  medications: string;
  supplements: string;
  followUp: string;
  infantSex: string;
  infantName: string;
  infantDob: string;
  birthWeight: string;
  apgar: string;
  headCircumference: string;
  length: string;
  phn: string;
  complications: string;
  bw: string;
  previousWeight: string;
  tcbHours: string;
  tsbRisk: string;
  tsbDat: string;
  tcbSecondLine: string;
  feeding: string;
  feedingPlan: string;
  sleeping: string;
  stools: string;
  voids: string;
  examHips: string;
  colorSkin: string;
  redReflex: string;
  umbilicus: string;
  metabolicResult: string;
  vitaminD: boolean;
  healthPassport: boolean;
  purpleCrying: boolean;
  ongoing1: string;
  ongoing2: string;
  appointmentDays: string;
  appointmentLocation: string;
}

export function createEmptyPostpartumForm(): PostpartumFormData {
  return {
    visitDayWeek: '',
    birther: '',
    parent: '',
    gravida: '',
    para: '',
    deliveryDate: '',
    general: '',
    vitals: '',
    bp: '',
    breastfeeding: '',
    voiding: '',
    incision: '',
    lochia: '',
    breasts: '',
    nipples: '',
    milkSupply: '',
    medications: '',
    supplements: '',
    followUp: '',
    infantSex: '',
    infantName: '',
    infantDob: '',
    birthWeight: '',
    apgar: '',
    headCircumference: '',
    length: '',
    phn: '',
    complications: '',
    bw: '',
    previousWeight: '',
    tcbHours: '',
    tsbRisk: '',
    tsbDat: '',
    tcbSecondLine: '',
    feeding: '',
    feedingPlan: '',
    sleeping: '',
    stools: '',
    voids: '',
    examHips: '',
    colorSkin: '',
    redReflex: '',
    umbilicus: '',
    metabolicResult: '',
    vitaminD: false,
    healthPassport: false,
    purpleCrying: false,
    ongoing1: '',
    ongoing2: '',
    appointmentDays: '',
    appointmentLocation: 'home/clinic',
  };
}

export const TSB_RISK_OPTIONS = [
  'Low Risk',
  'Low Intermediate',
  'High Intermediate',
  'High Risk',
] as const;

export const INFANT_SEX_OPTIONS = ['Girl', 'Boy'] as const;
