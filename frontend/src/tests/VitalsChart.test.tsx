import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { VitalsChart, VitalsTooltip, toVitalsPoints } from '../components/VitalsChart';
import type { Visit } from '../types';

const visit = (id: string, date: [number, number, number], vitals: Partial<Visit> = {}): Visit =>
  ({
    id,
    patientId: 'p1',
    visitDate: new Date(date[0], date[1] - 1, date[2], 10, 0).toISOString(),
    complaints: 'c',
    temperature: 37.0,
    bloodPressure: '120/80',
    pulse: 72,
    createdAt: '',
    updatedAt: '',
    medications: [],
    ...vitals,
  }) as Visit;

// Newest first, as the API returns them
const visits = [
  visit('v3', [2026, 5, 20], { temperature: 38.4, bloodPressure: '135/88', pulse: 96 }),
  visit('v2', [2026, 3, 2], { temperature: 37.1, bloodPressure: '124/82', pulse: 80 }),
  visit('v1', [2026, 1, 15], { temperature: 36.6, bloodPressure: '118/76', pulse: 70 }),
];

describe('toVitalsPoints', () => {
  it('orders visits chronologically and extracts systolic BP', () => {
    const points = toVitalsPoints(visits);
    expect(points.map((p) => p.id)).toEqual(['v1', 'v2', 'v3']);
    expect(points[0]).toMatchObject({ temperature: 36.6, systolic: 118, bloodPressure: '118/76', pulse: 70 });
  });

  it('turns missing or malformed readings into gaps (null)', () => {
    const [point] = toVitalsPoints([
      visit('x', [2026, 1, 1], { temperature: null as unknown as number, bloodPressure: 'n/a', pulse: undefined as unknown as number }),
    ]);
    expect(point).toMatchObject({ temperature: null, systolic: null, bloodPressure: null, pulse: null });
  });
});

describe('VitalsChart', () => {
  it('renders one panel per vital with its latest reading', () => {
    render(<VitalsChart visits={visits} />);

    const panels = screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent);
    expect(panels).toEqual(['Temperature (°C)', 'Systolic blood pressure (mmHg)', 'Pulse (bpm)']);

    const latest = Array.from(document.querySelectorAll('.vitals-panel-latest')).map((el) => el.textContent);
    expect(latest).toEqual(['Latest 38.4 °C', 'Latest 135/88 mmHg', 'Latest 96 bpm']);
  });

  it('describes each panel for screen readers (range, latest, normal band)', () => {
    render(<VitalsChart visits={visits} />);

    expect(
      screen.getByRole('img', {
        name: 'Temperature over 3 visits, from 36.6 to 38.4 °C; latest 38.4 °C; normal range 36.1–37.2 °C',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /^Systolic blood pressure over 3 visits, from 118 to 135 mmHg/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /^Pulse over 3 visits, from 70 to 96 bpm; latest 96 bpm; normal range 60–100 bpm$/ })).toBeInTheDocument();
  });

  it('draws one line per panel', () => {
    const { container } = render(<VitalsChart visits={visits} />);
    expect(container.querySelectorAll('.recharts-line')).toHaveLength(3);
  });

  it('includes a data table with every plotted value, newest first', () => {
    render(<VitalsChart visits={visits} />);

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getAllByRole('cell').map((c) => c.textContent)).toEqual([
      expect.stringMatching(/20 May 2026|May 20, 2026/),
      '38.4 °C',
      '135/88 mmHg',
      '96 bpm',
    ]);
  });

  it('shows "not recorded" for a vital missing from every visit', () => {
    render(<VitalsChart visits={[visit('a', [2026, 1, 1], { pulse: null as unknown as number })]} />);

    expect(screen.getByText('Not recorded in these visits.')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('shows a message when there is nothing to chart', () => {
    render(<VitalsChart visits={[]} />);
    expect(screen.getByText('No visits to chart in this date range.')).toBeInTheDocument();
  });
});

describe('VitalsTooltip', () => {
  it('lists every vital for the hovered visit', () => {
    const [, point] = toVitalsPoints(visits);
    const props = { active: true, payload: [{ payload: point }] } as unknown as Parameters<typeof VitalsTooltip>[0];
    render(<VitalsTooltip {...props} />);

    expect(screen.getByText(/2 March 2026|March 2, 2026/)).toBeInTheDocument();
    expect(screen.getByText('37.1 °C')).toBeInTheDocument();
    expect(screen.getByText('124/82 mmHg')).toBeInTheDocument();
    expect(screen.getByText('80 bpm')).toBeInTheDocument();
  });

  it('renders nothing when inactive', () => {
    const props = { active: false, payload: [] } as unknown as Parameters<typeof VitalsTooltip>[0];
    const { container } = render(<VitalsTooltip {...props} />);
    expect(container).toBeEmptyDOMElement();
  });
});
