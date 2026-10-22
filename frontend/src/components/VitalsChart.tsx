import React, { useId, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { NORMAL_RANGES } from '../lib/vitals';
import type { Visit } from '../types';
import './VitalsChart.scss';

/**
 * Vitals trends as three small multiples sharing one time axis.
 * Temperature (~37), systolic BP (~120) and pulse (~70) live on very different
 * scales, so each gets its own y-axis instead of one shared or dual axis
 * (which would flatten temperature or imply false correlations).
 */

// Categorical slots 1-3 (validated all-pairs on the white card surface)
const SERIES = [
  {
    key: 'temperature',
    title: 'Temperature',
    unit: '°C',
    color: '#2a78d6',
    range: NORMAL_RANGES.temperature,
    step: 1,
    format: (v: number) => v.toFixed(1),
  },
  {
    key: 'systolic',
    title: 'Systolic blood pressure',
    unit: 'mmHg',
    color: '#eb6834',
    range: NORMAL_RANGES.systolic,
    step: 20,
    format: (v: number) => String(Math.round(v)),
  },
  {
    key: 'pulse',
    title: 'Pulse',
    unit: 'bpm',
    color: '#1baf7a',
    range: NORMAL_RANGES.pulse,
    step: 20,
    format: (v: number) => String(Math.round(v)),
  },
] as const;

type SeriesKey = (typeof SERIES)[number]['key'];

export interface VitalsPoint {
  id: string;
  time: number;
  temperature: number | null;
  systolic: number | null;
  bloodPressure: string | null;
  pulse: number | null;
}

/** Visits -> chronological points; unparseable/missing readings become null (gaps) */
export const toVitalsPoints = (visits: Visit[]): VitalsPoint[] =>
  visits
    .map((visit) => {
      const bpMatch = visit.bloodPressure?.match(/^(\d{2,3})\/(\d{2,3})$/);
      const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
      return {
        id: visit.id,
        time: new Date(visit.visitDate).getTime(),
        temperature: num(visit.temperature),
        systolic: bpMatch ? Number(bpMatch[1]) : null,
        bloodPressure: bpMatch ? visit.bloodPressure : null,
        pulse: num(visit.pulse),
      };
    })
    .sort((a, b) => a.time - b.time);

/** Y domain covering the data and the normal band, snapped to round tick steps */
const getScale = (values: number[], range: { min: number; max: number }, step: number) => {
  const lo = Math.floor((Math.min(range.min, ...values) - step * 0.25) / step) * step;
  const hi = Math.ceil((Math.max(range.max, ...values) + step * 0.25) / step) * step;
  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Math.round(t * 10) / 10);
  return { domain: [lo, hi] as [number, number], ticks };
};

const formatDate = (time: number) =>
  new Date(time).toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' });
const formatFullDate = (time: number) =>
  new Date(time).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });

const formatReading = (point: VitalsPoint, key: SeriesKey) => {
  if (key === 'systolic') return point.bloodPressure ? `${point.bloodPressure} mmHg` : '—';
  const value = point[key];
  const series = SERIES.find((s) => s.key === key)!;
  return value === null ? '—' : `${series.format(value)} ${series.unit}`;
};

const SERIES_LABEL: Record<SeriesKey, string> = { temperature: 'Temperature', systolic: 'Blood pressure', pulse: 'Pulse' };

/** One readout for the hovered visit, listing every vital; values lead, labels follow */
export const VitalsTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as VitalsPoint;
  return (
    <div className="vitals-tooltip">
      <div className="vitals-tooltip-date">{formatFullDate(point.time)}</div>
      {SERIES.map((series) => (
        <div key={series.key} className="vitals-tooltip-row">
          <span className="vitals-swatch" style={{ background: series.color }} aria-hidden="true" />
          <span className="vitals-tooltip-value">{formatReading(point, series.key)}</span>
          <span className="vitals-tooltip-label">{SERIES_LABEL[series.key]}</span>
        </div>
      ))}
    </div>
  );
};

interface VitalsChartProps {
  visits: Visit[];
}

export const VitalsChart: React.FC<VitalsChartProps> = ({ visits }) => {
  const syncId = useId();
  const [hoveredPanel, setHoveredPanel] = useState<SeriesKey | null>(null);
  const points = useMemo(() => toVitalsPoints(visits), [visits]);

  if (points.length === 0) {
    return <p className="vitals-chart-empty">No visits to chart in this date range.</p>;
  }

  const timeDomain: [number, number] =
    points.length === 1
      ? [points[0].time - 86_400_000, points[0].time + 86_400_000]
      : [points[0].time, points[points.length - 1].time];
  // Markers on every visit while sparse; on hover only when dense
  const showDots = points.length <= 40;

  return (
    <div className="vitals-chart">
      {SERIES.map((series, index) => {
        const values = points.map((p) => p[series.key]).filter((v): v is number => v !== null);
        const latest = [...points].reverse().find((p) => p[series.key] !== null);
        const isLast = index === SERIES.length - 1;
        const yScale = values.length ? getScale(values, series.range, series.step) : null;
        const summary =
          values.length === 0
            ? `${series.title}: not recorded`
            : `${series.title} over ${values.length} visits, from ${series.format(Math.min(...values))} to ${series.format(
                Math.max(...values)
              )} ${series.unit}; latest ${latest ? formatReading(latest, series.key) : ''}; normal range ${series.range.min}–${
                series.range.max
              } ${series.unit}`;

        return (
          <section
            key={series.key}
            className="vitals-panel"
            onMouseEnter={() => setHoveredPanel(series.key)}
            onMouseLeave={() => setHoveredPanel(null)}
          >
            <header className="vitals-panel-header">
              <h4>
                <span className="vitals-swatch" style={{ background: series.color }} aria-hidden="true" />
                {series.title} <span className="vitals-panel-unit">({series.unit})</span>
              </h4>
              {latest && (
                <span className="vitals-panel-latest">
                  Latest <strong>{formatReading(latest, series.key)}</strong>
                </span>
              )}
            </header>

            {values.length === 0 ? (
              <p className="vitals-chart-empty">Not recorded in these visits.</p>
            ) : (
              <div role="img" aria-label={summary} className="vitals-panel-plot">
                <ResponsiveContainer width="100%" height={isLast ? 168 : 140} initialDimension={{ width: 640, height: 140 }}>
                  <LineChart data={points} syncId={syncId} margin={{ top: 8, right: 36, bottom: isLast ? 0 : 8, left: 0 }}>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" strokeWidth={1} />
                    <ReferenceArea
                      y1={series.range.min}
                      y2={series.range.max}
                      fill="#e5e7eb"
                      fillOpacity={0.5}
                      stroke="none"
                      ifOverflow="extendDomain"
                    />
                    <XAxis
                      dataKey="time"
                      type="number"
                      scale="time"
                      domain={timeDomain}
                      tickFormatter={formatDate}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#d1d5db' }}
                      minTickGap={24}
                      // Dates only under the bottom panel; the panels share the axis
                      hide={!isLast}
                    />
                    <YAxis
                      domain={yScale!.domain}
                      ticks={yScale!.ticks}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip
                      content={(props) => (hoveredPanel === series.key ? <VitalsTooltip {...props} /> : null)}
                      cursor={{ stroke: '#9ca3af', strokeWidth: 1 }}
                      isAnimationActive={false}
                    />
                    <Line
                      // Straight segments: readings are discrete visits, not a continuous signal
                      type="linear"
                      dataKey={series.key}
                      name={series.title}
                      stroke={series.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dot={showDots ? { r: 4, fill: series.color, stroke: '#ffffff', strokeWidth: 2 } : false}
                      activeDot={{ r: 5, fill: series.color, stroke: '#ffffff', strokeWidth: 2 }}
                      connectNulls={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        );
      })}

      <p className="vitals-chart-legend-note">
        <span className="vitals-band-key" aria-hidden="true" /> Shaded band: normal range
      </p>

      {/* Every plotted value is reachable without hovering */}
      <details className="vitals-table-details">
        <summary>Show data table</summary>
        <div className="vitals-table-wrap">
          <table className="vitals-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Temperature</th>
                <th scope="col">Blood pressure</th>
                <th scope="col">Pulse</th>
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((point) => (
                <tr key={point.id}>
                  <td>{formatFullDate(point.time)}</td>
                  <td>{formatReading(point, 'temperature')}</td>
                  <td>{formatReading(point, 'systolic')}</td>
                  <td>{formatReading(point, 'pulse')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

export default VitalsChart;
