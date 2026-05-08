import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import './Dashboard.scss';
import { useState } from 'react';

export const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Sample appointments data
  const appointments = [
    {
      time: '2:00 PM',
      patient: 'Carol Williams',
      age: '—',
      gender: '',
      phone: '9876543212',
      reason: 'Regular checkup',
      status: 'Completed',
    },
    {
      time: '10:00 AM',
      patient: 'Alice Johnson',
      age: '—',
      gender: '',
      phone: '9876543210',
      reason: 'Follow-up checkup',
      status: 'Completed',
    },
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'patients', label: 'Patients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'appointments', label: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'consultations', label: 'Consultations', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'export', label: 'Export Data', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
    { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title">Patient Management System</div>
        <div className="header-right">
          <span className="welcome-text">Welcome, Dr. {user?.name || 'John Admin'}</span>
          <button onClick={handleLogout} className="header-logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="sidebar-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-number">2</div>
              <div className="stat-label">Total Appointments</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card stat-warning">
              <div className="stat-number">0</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card stat-danger">
              <div className="stat-number">0</div>
              <div className="stat-label">No-show</div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="appointments-section">
            <h2 className="section-title">Appointments</h2>
            <div className="table-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Age/Gender</th>
                    <th>Phone</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment, index) => (
                    <tr key={index}>
                      <td className="time-cell">{appointment.time}</td>
                      <td className="patient-cell">
                        <a href="#" className="patient-link">{appointment.patient}</a>
                      </td>
                      <td>{appointment.age}</td>
                      <td>{appointment.phone}</td>
                      <td>{appointment.reason}</td>
                      <td>
                        <span className="status-badge status-completed">{appointment.status}</span>
                      </td>
                      <td>
                        <a href="#" className="action-link">✓ Consultation Saved</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              <button className="quick-action-btn">Search Patient</button>
              <button className="quick-action-btn">Schedule Appointment</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
