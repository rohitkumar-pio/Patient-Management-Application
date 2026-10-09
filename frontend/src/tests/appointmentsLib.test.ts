import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  toDateString,
  parseDateString,
  isValidDateString,
  shiftDate,
  toAppointmentIso,
  formatLongDate,
  fetchAppointmentsByDate,
  fetchTodayAppointments,
} from '../lib/appointments';
import { formatAppointmentTime } from '../components/AppointmentCard';
import apiClient from '../lib/api';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

// A timezone with daylight saving and a non-zero UTC offset, so UTC-vs-local
// and DST mistakes fail here regardless of the machine's own timezone.
beforeAll(() => {
  vi.stubEnv('TZ', 'America/New_York');
});
afterAll(() => {
  vi.unstubAllEnvs();
});

describe('appointment date helpers', () => {
  describe('toDateString / parseDateString', () => {
    it('formats a local date as YYYY-MM-DD with zero padding', () => {
      expect(toDateString(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    });

    it('parses to local midnight, not UTC midnight', () => {
      const parsed = parseDateString('2026-10-09');
      expect([parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), parsed.getHours()]).toEqual([2026, 9, 9, 0]);
    });

    it('round-trips', () => {
      expect(toDateString(parseDateString('2028-02-29'))).toBe('2028-02-29');
    });
  });

  describe('isValidDateString', () => {
    it.each(['2026-10-09', '2028-02-29', '2026-12-31'])('accepts %s', (value) => {
      expect(isValidDateString(value)).toBe(true);
    });

    it.each(['2027-02-29', '2026-13-01', '2026-04-31', '2026-1-9', '09-10-2026', 'today', '', null, undefined])(
      'rejects %s',
      (value) => {
        expect(isValidDateString(value as string | null | undefined)).toBe(false);
      }
    );
  });

  describe('shiftDate', () => {
    it('moves across month and year boundaries', () => {
      expect(shiftDate('2026-10-31', 1)).toBe('2026-11-01');
      expect(shiftDate('2026-12-31', 1)).toBe('2027-01-01');
      expect(shiftDate('2026-03-01', -1)).toBe('2026-02-28');
      expect(shiftDate('2028-03-01', -1)).toBe('2028-02-29');
    });

    it('moves exactly one calendar day across DST changes', () => {
      // US DST starts 2026-03-08 and ends 2026-11-01
      expect(shiftDate('2026-03-07', 1)).toBe('2026-03-08');
      expect(shiftDate('2026-03-08', 1)).toBe('2026-03-09');
      expect(shiftDate('2026-11-01', 1)).toBe('2026-11-02');
      expect(shiftDate('2026-11-02', -1)).toBe('2026-11-01');
    });
  });

  describe('toAppointmentIso', () => {
    it('uses the local time on the given day', () => {
      const iso = toAppointmentIso('2026-10-09', '14:30');
      const date = new Date(iso);
      expect([date.getDate(), date.getHours(), date.getMinutes()]).toEqual([9, 14, 30]);
      expect(iso).toBe('2026-10-09T18:30:00.000Z'); // EDT is UTC-4
    });

    it('uses local midnight when no time is given', () => {
      expect(toAppointmentIso('2026-10-09')).toBe('2026-10-09T04:00:00.000Z');
      expect(toAppointmentIso('2026-10-09', '')).toBe('2026-10-09T04:00:00.000Z');
    });
  });

  describe('formatAppointmentTime', () => {
    it('shows the time for timed appointments', () => {
      expect(formatAppointmentTime(toAppointmentIso('2026-10-09', '09:05'))).toMatch(/9:05/);
    });

    it('shows only the date for appointments at local midnight', () => {
      const text = formatAppointmentTime(toAppointmentIso('2026-10-09'));
      expect(text).toMatch(/2026/);
      expect(text).toMatch(/Oct/);
      expect(text).not.toMatch(/12:00|00:00/);
    });
  });

  it('formatLongDate includes the weekday', () => {
    expect(formatLongDate('2026-10-09')).toMatch(/Friday/);
  });

  describe('fetchers', () => {
    it('fetchAppointmentsByDate requests the date filter and unwraps data', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { success: true, data: [{ id: 'a1' }] } });

      await expect(fetchAppointmentsByDate('2026-10-09')).resolves.toEqual([{ id: 'a1' }]);
      expect(apiClient.get).toHaveBeenCalledWith('/appointments?date=2026-10-09');
    });

    it("fetchTodayAppointments requests today's queue and unwraps data", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { success: true, data: [{ id: 'a2' }], grouped: {} } });

      await expect(fetchTodayAppointments()).resolves.toEqual([{ id: 'a2' }]);
      expect(apiClient.get).toHaveBeenCalledWith('/appointments/today');
    });
  });
});
