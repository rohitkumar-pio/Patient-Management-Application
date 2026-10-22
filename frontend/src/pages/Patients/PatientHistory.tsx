import React, { Suspense, lazy, useCallback, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { List, type RowComponentProps } from 'react-window';
import apiClient from '../../lib/api';
import { isValidDateString, shiftDate, toDateString } from '../../lib/appointments';
import { useAuthStore } from '../../stores/authStore';
import { VisitCard, VISIT_CARD_HEIGHT } from '../../components/VisitCard';
import { VisitDetailModal } from '../../components/VisitDetailModal';
import { PrescriptionPreview } from '../../components/PrescriptionPreview';
import type { Patient, Visit, VisitHistoryResponse } from '../../types';
import './PatientProfile.scss';
import './PatientHistory.scss';

// recharts is large and only used by the optional chart view: load it on demand
const VitalsChart = lazy(() => import('../../components/VitalsChart').then((m) => ({ default: m.VitalsChart })));

export const HISTORY_PAGE_SIZE = 20;
/** The chart plots every visit in range: fetched in API-max pages, capped */
export const CHART_PAGE_SIZE = 100;
export const CHART_MAX_VISITS = 1000;
/** Above this many loaded visits, only the rows on screen are rendered */
export const VIRTUALIZE_THRESHOLD = 50;

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/patients', icon: '👥', label: 'Patients', active: true },
  { to: '/appointments', icon: '📅', label: 'Appointments' },
  { to: '/consultations', icon: '🩺', label: 'Consultations' },
  { to: '/export', icon: '📤', label: 'Export Data' },
  { to: '/reports', icon: '📈', label: 'Reports' },
];

type Preset = { id: string; label: string; range: () => { startDate?: string; endDate?: string } };

const PRESETS: Preset[] = [
  { id: 'all', label: 'All Time', range: () => ({}) },
  { id: '30d', label: 'Last 30 days', range: () => ({ startDate: shiftDate(toDateString(new Date()), -29) }) },
  {
    id: '6m',
    label: 'Last 6 months',
    range: () => {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      return { startDate: toDateString(d) };
    },
  },
  {
    id: '1y',
    label: 'Last year',
    range: () => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      return { startDate: toDateString(d) };
    },
  },
];

interface HistoryRowProps {
  visits: Visit[];
  onViewDetails: (visit: Visit) => void;
}

const HistoryRow = ({ index, style, ariaAttributes, visits, onViewDetails }: RowComponentProps<HistoryRowProps>) => (
  <div style={style} className="history-row" {...ariaAttributes}>
    <VisitCard visit={visits[index]} onViewDetails={onViewDetails} />
  </div>
);

export const PatientHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [printVisitId, setPrintVisitId] = useState<string | null>(null);

  const startParam = searchParams.get('startDate');
  const endParam = searchParams.get('endDate');
  const startDate = isValidDateString(startParam) ? startParam : '';
  const endDate = isValidDateString(endParam) ? endParam : '';
  const rangeError = startDate && endDate && startDate > endDate ? 'Start date must be on or before end date' : null;
  const view = searchParams.get('view') === 'chart' ? 'chart' : 'timeline';

  // URL holds the range and the view; changing one keeps the other
  const updateParams = (next: { startDate?: string; endDate?: string; view?: 'timeline' | 'chart' }) => {
    const params = new URLSearchParams();
    const merged = { startDate, endDate, view, ...next };
    if (merged.startDate) params.set('startDate', merged.startDate);
    if (merged.endDate) params.set('endDate', merged.endDate);
    if (merged.view === 'chart') params.set('view', 'chart');
    setSearchParams(params, { replace: true });
  };
  const setRange = (range: { startDate?: string; endDate?: string }) =>
    updateParams({ startDate: range.startDate ?? '', endDate: range.endDate ?? '' });

  const activePreset = PRESETS.find((p) => {
    const r = p.range();
    return (r.startDate ?? '') === startDate && (r.endDate ?? '') === endDate;
  })?.id;

  const { data: patient, isError: patientError } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: async () => (await apiClient.get(`/patients/${id}`)).data.data,
    enabled: !!id,
  });

  const history = useInfiniteQuery({
    queryKey: ['patient-history', id, startDate, endDate],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(HISTORY_PAGE_SIZE), offset: String(pageParam) });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const response = await apiClient.get<VisitHistoryResponse>(`/patients/${id}/visits?${params.toString()}`);
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.offset + last.data.length : undefined,
    enabled: !!id && !rangeError && view === 'timeline',
  });

  // Chart view: every visit in the range (not just the loaded timeline pages)
  const chartData = useQuery({
    queryKey: ['patient-history-chart', id, startDate, endDate],
    queryFn: async () => {
      const all: Visit[] = [];
      let total = 0;
      for (let offset = 0; offset < CHART_MAX_VISITS; offset += CHART_PAGE_SIZE) {
        const params = new URLSearchParams({ limit: String(CHART_PAGE_SIZE), offset: String(offset) });
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        const response = await apiClient.get<VisitHistoryResponse>(`/patients/${id}/visits?${params.toString()}`);
        all.push(...response.data.data);
        total = response.data.pagination.total;
        if (!response.data.pagination.hasMore) break;
      }
      return { visits: all, total };
    },
    enabled: !!id && !rangeError && view === 'chart',
  });

  const visits = history.data?.pages.flatMap((page) => page.data) ?? [];
  const total = history.data?.pages[0]?.pagination.total ?? 0;
  const isFiltered = !!(startDate || endDate);

  const handleViewDetails = useCallback((visit: Visit) => setSelectedVisit(visit), []);
  const handleCloseDetails = useCallback(() => setSelectedVisit(null), []);
  const handlePrint = useCallback((visitId: string) => {
    setSelectedVisit(null);
    setPrintVisitId(visitId);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderChart = () => {
    if (chartData.isLoading) {
      return <div className="history-skeleton history-chart-skeleton" aria-label="Loading vitals chart" />;
    }
    if (chartData.isError || !chartData.data) {
      return (
        <div className="history-error" role="alert">
          Couldn't load vitals. Please try again.
        </div>
      );
    }
    const { visits: chartVisits, total: chartTotal } = chartData.data;
    return (
      <>
        <p className="history-count history-chart-count">
          {chartVisits.length < chartTotal
            ? `Plotting the latest ${chartVisits.length} of ${chartTotal} visits`
            : `${chartTotal} ${chartTotal === 1 ? 'visit' : 'visits'} plotted`}
        </p>
        <Suspense fallback={<div className="history-skeleton history-chart-skeleton" aria-label="Loading vitals chart" />}>
          <VitalsChart visits={chartVisits} />
        </Suspense>
      </>
    );
  };

  const renderVisits = () => {
    if (history.isLoading) {
      return (
        <div className="history-loading" aria-label="Loading visit history">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="history-skeleton" />
          ))}
        </div>
      );
    }

    if (history.isError) {
      return (
        <div className="history-error" role="alert">
          Couldn't load visit history. Please try again.
        </div>
      );
    }

    if (visits.length === 0) {
      return (
        <div className="history-empty">
          <h3>{isFiltered ? 'No visits in this date range' : 'No visits recorded yet'}</h3>
          {isFiltered ? (
            <button type="button" className="history-link-btn" onClick={() => setRange({})}>
              Show all time
            </button>
          ) : (
            <button type="button" className="history-link-btn" onClick={() => navigate(`/visits/new?patientId=${id}`)}>
              Record a visit
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        {visits.length > VIRTUALIZE_THRESHOLD ? (
          <List
            className="history-timeline history-virtual-list"
            rowComponent={HistoryRow}
            rowCount={visits.length}
            rowHeight={VISIT_CARD_HEIGHT}
            rowProps={{ visits, onViewDetails: handleViewDetails }}
            defaultHeight={VISIT_CARD_HEIGHT * 5}
            overscanCount={4}
            aria-label="Visit history"
          />
        ) : (
          <ol className="history-timeline" aria-label="Visit history">
            {visits.map((visit) => (
              <li key={visit.id} className="history-row" style={{ height: VISIT_CARD_HEIGHT }}>
                <VisitCard visit={visit} onViewDetails={handleViewDetails} />
              </li>
            ))}
          </ol>
        )}

        <div className="history-footer">
          <span className="history-count">
            Showing {visits.length} of {total} {total === 1 ? 'visit' : 'visits'}
          </span>
          {history.hasNextPage && (
            <button
              type="button"
              className="history-load-more"
              onClick={() => history.fetchNextPage()}
              disabled={history.isFetchingNextPage}
            >
              {history.isFetchingNextPage ? 'Loading...' : 'Load more'}
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="patient-profile-layout">
      <header className="patient-profile-header">
        <div className="header-content">
          <h1>Patient Management System</h1>
          <div className="header-user">
            <span>Welcome, {user?.name || 'Doctor'}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <aside className="patient-profile-sidebar">
        <nav>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={`nav-item ${item.active ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="patient-profile-content">
        <div className="profile-container history-container">
          <div className="profile-navigation">
            <button onClick={() => navigate(`/patients/${id}`)} className="back-btn">
              ← Back to Profile
            </button>
          </div>

          {/* Patient header */}
          <div className="patient-details-card history-patient-card">
            {patientError ? (
              <p className="history-error" role="alert">
                Patient not found.
              </p>
            ) : (
              <div className="history-patient">
                <div>
                  <h2>{patient ? `${patient.name} — Visit History` : 'Visit History'}</h2>
                  {patient && (
                    <div className="patient-meta">
                      {patient.age != null && <span className="meta-item">{patient.age} years</span>}
                      {patient.gender && <span className="meta-item">{patient.gender}</span>}
                      <span className="meta-item">📞 {patient.phone}</span>
                      {patient.address && <span className="meta-item">📍 {patient.address}</span>}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="history-new-visit"
                  onClick={() => navigate(`/visits/new?patientId=${id}`)}
                >
                  🩺 New Visit
                </button>
              </div>
            )}
          </div>

          {/* Date range filter */}
          <div className="history-filters" role="group" aria-label="Filter by date">
            <div className="history-date-inputs">
              <label>
                From
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setRange({ startDate: e.target.value, endDate })}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setRange({ startDate, endDate: e.target.value })}
                />
              </label>
            </div>
            <div className="history-presets">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`history-preset ${activePreset === preset.id ? 'active' : ''}`}
                  aria-pressed={activePreset === preset.id}
                  onClick={() => setRange(preset.range())}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          {rangeError && (
            <p className="history-range-error" role="alert">
              {rangeError}
            </p>
          )}

          <div className="history-view-toggle" role="group" aria-label="View">
            {(['timeline', 'chart'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={view === option ? 'active' : ''}
                aria-pressed={view === option}
                onClick={() => updateParams({ view: option })}
              >
                {option === 'timeline' ? 'Timeline' : 'Chart'}
              </button>
            ))}
          </div>

          {!rangeError && (view === 'chart' ? renderChart() : renderVisits())}
        </div>
      </main>

      <VisitDetailModal
        visit={selectedVisit}
        patientName={patient?.name}
        onClose={handleCloseDetails}
        onPrintPrescription={handlePrint}
      />

      {printVisitId && <PrescriptionPreview visitId={printVisitId} onClose={() => setPrintVisitId(null)} />}
    </div>
  );
};

export default PatientHistory;
