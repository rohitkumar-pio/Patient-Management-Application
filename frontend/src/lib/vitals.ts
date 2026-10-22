/**
 * Vital sign ranges used to color-code readings (new visit form, history).
 * 'normal' | 'warning' | 'danger', or '' when the value is missing/unparseable.
 */
export type VitalStatus = 'normal' | 'warning' | 'danger' | '';
export type VitalType = 'temperature' | 'pulse' | 'bp';

/** Normal ranges (inclusive), shared by the status colors and the trend chart's bands */
export const NORMAL_RANGES = {
  temperature: { min: 36.1, max: 37.2 },
  pulse: { min: 60, max: 100 },
  systolic: { min: 90, max: 120 },
  diastolic: { min: 60, max: 80 },
} as const;

export const getVitalStatus = (type: VitalType, value: string | number | null | undefined): VitalStatus => {
  if (value === null || value === undefined || value === '') return '';
  const text = String(value);

  if (type === 'temperature') {
    const temp = parseFloat(text);
    if (isNaN(temp)) return '';
    if (temp >= NORMAL_RANGES.temperature.min && temp <= NORMAL_RANGES.temperature.max) return 'normal';
    if ((temp >= 35 && temp < 36.1) || (temp > 37.2 && temp <= 38)) return 'warning';
    return 'danger';
  }

  if (type === 'pulse') {
    const pulseVal = parseInt(text, 10);
    if (isNaN(pulseVal)) return '';
    if (pulseVal >= NORMAL_RANGES.pulse.min && pulseVal <= NORMAL_RANGES.pulse.max) return 'normal';
    if ((pulseVal >= 50 && pulseVal < 60) || (pulseVal > 100 && pulseVal <= 120)) return 'warning';
    return 'danger';
  }

  if (type === 'bp') {
    const match = text.match(/^(\d{2,3})\/(\d{2,3})$/);
    if (!match) return '';
    const systolic = parseInt(match[1], 10);
    const diastolic = parseInt(match[2], 10);
    if (
      systolic >= NORMAL_RANGES.systolic.min && systolic <= NORMAL_RANGES.systolic.max &&
      diastolic >= NORMAL_RANGES.diastolic.min && diastolic <= NORMAL_RANGES.diastolic.max
    ) {
      return 'normal';
    }
    if ((systolic >= 120 && systolic <= 140) || (diastolic >= 80 && diastolic <= 90)) return 'warning';
    return 'danger';
  }

  return '';
};

export const VITAL_STATUS_LABELS: Record<Exclude<VitalStatus, ''>, string> = {
  normal: 'Normal',
  warning: 'Borderline',
  danger: 'Abnormal',
};
