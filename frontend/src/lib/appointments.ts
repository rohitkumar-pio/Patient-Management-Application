import apiClient from './api';
import type { Appointment } from '../types';

/**
 * Appointment helpers shared by the appointments page and the scheduling modal.
 * Dates are local-time YYYY-MM-DD strings, matching the API's ?date= filter.
 */

const pad = (n: number) => String(n).padStart(2, '0');

export const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateString = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isValidDateString = (value: string | null | undefined): value is string =>
  !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && toDateString(parseDateString(value)) === value;

export const shiftDate = (value: string, days: number): string => {
  const date = parseDateString(value);
  date.setDate(date.getDate() + days);
  return toDateString(date);
};

/** Local date + optional HH:mm to ISO. No time means local midnight (shown as date-only). */
export const toAppointmentIso = (date: string, time?: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];
  return new Date(year, month - 1, day, hours, minutes).toISOString();
};

export const formatLongDate = (date: string): string =>
  parseDateString(date).toLocaleDateString([], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const appointmentsByDateKey = (date: string) => ['appointments', date] as const;

export const fetchAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
  const response = await apiClient.get(`/appointments?date=${date}`);
  return response.data.data as Appointment[];
};
