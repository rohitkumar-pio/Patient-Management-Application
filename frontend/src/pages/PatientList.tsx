import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';
import PatientSearch from '../components/PatientSearch';
import { Patient, PaginatedResponse, ApiPaginatedResponse } from '../types';
import { useAuthStore } from '../stores/authStore';
import './PatientList.scss';

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState('patients');
  const limit = 20;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', route: '/dashboard' },
    { id: 'patients', label: 'Patients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', route: '/patients' },
    { id: 'appointments', label: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', route: '/appointments' },
    { id: 'consultations', label: 'Consultations', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/consultations' },
    { id: 'export', label: 'Export Data', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', route: '/export' },
    { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/reports' },
  ];

  // Fetch patients with React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patients', currentPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await apiClient.get<ApiPaginatedResponse<Patient>>(
        `/patients?${params.toString()}`
      );
      
      // Transform API response to match PaginatedResponse interface
      return {
        data: response.data.data,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      } as PaginatedResponse<Patient>;
    },
  });

  // Handle search change
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Handle pagination
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (data && currentPage < data.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Handle patient row click
  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  // Handle add new patient
  const handleAddPatient = () => {
    navigate('/patients/new');
  };

  // Handle edit patient
  const handleEditPatient = (patientId: string) => {
    navigate(`/patients/${patientId}/edit`);
  };

  // Handle delete patient
  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!window.confirm(`Are you sure you want to delete patient "${patientName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.delete(`/patients/${patientId}`);
      
      // Show success toast
      const event = new CustomEvent('toast', { 
        detail: { message: 'Patient deleted successfully', type: 'success' } 
      });
      window.dispatchEvent(event);

      // Refetch the patient list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to delete patient. Please try again.';
      const event = new CustomEvent('toast', { 
        detail: { message: errorMessage, type: 'error' } 
      });
      window.dispatchEvent(event);
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="loading-skeleton">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="skeleton-row">
          <div className="skeleton-item name"></div>
          <div className="skeleton-item age"></div>
          <div className="skeleton-item gender"></div>
          <div className="skeleton-item phone"></div>
          <div className="skeleton-item visits"></div>
          <div className="skeleton-item action"></div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="empty-state">
      <svg
        className="empty-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h3 className="empty-title">No patients found</h3>
      <p className="empty-description">
        {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new patient'}
      </p>
      {!searchTerm && (
        <button onClick={handleAddPatient} className="empty-action">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Patient
        </button>
      )}
    </div>
  );

  // Pagination component
  const Pagination = () => {
    if (!data || data.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(data.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Showing <span className="pagination-highlight">{(currentPage - 1) * limit + 1}</span> to{' '}
          <span className="pagination-highlight">
            {Math.min(currentPage * limit, data.total)}
          </span>{' '}
          of <span className="pagination-highlight">{data.total}</span> results
        </div>
        <div className="pagination-controls">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="pagination-btn"
            aria-label="Previous page"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {startPage > 1 && (
            <>
              <button onClick={() => handlePageClick(1)} className="pagination-btn">
                1
              </button>
              {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          {endPage < data.totalPages && (
            <>
              {endPage < data.totalPages - 1 && <span className="pagination-ellipsis">...</span>}
              <button onClick={() => handlePageClick(data.totalPages)} className="pagination-btn">
                {data.totalPages}
              </button>
            </>
          )}
          <button
            onClick={handleNextPage}
            disabled={currentPage === data.totalPages}
            className="pagination-btn"
            aria-label="Next page"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="patient-list-layout">
      {/* Header */}
      <header className="patient-list-header">
        <div className="header-title">Patient Management System</div>
        <div className="header-right">
          <span className="welcome-text">Welcome, Dr. {user?.name || 'John Admin'}</span>
          <button onClick={handleLogout} className="header-logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="patient-list-main">
        {/* Sidebar */}
        <aside className="patient-list-sidebar">
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu(item.id);
                  if (item.route) navigate(item.route);
                }}
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
        <main className="patient-list-content">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Patients</h1>
            <p className="page-description">Manage and view all patient records</p>
          </div>

          {/* Search and Add Button */}
          <div className="search-actions-bar">
            <PatientSearch onSearchChange={handleSearchChange} />
            <button onClick={handleAddPatient} className="add-patient-btn">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Patient
            </button>
          </div>

          {/* Error State */}
          {isError && (
            <div className="error-alert">
              <svg
                className="error-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="error-content">
                <h3 className="error-title">Error loading patients</h3>
                <p className="error-message">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="table-card">
            {isLoading ? (
              <LoadingSkeleton />
            ) : data && data.data.length > 0 ? (
              <>
                <div className="table-container">
                  <table className="patients-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Phone</th>
                        <th>Visits</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((patient) => (
                        <tr
                          key={patient.id}
                        >
                          <td className="patient-name" onClick={() => handlePatientClick(patient.id)} style={{ cursor: 'pointer' }}>
                            {patient.name}
                          </td>
                          <td>{patient.age || 'N/A'}</td>
                          <td>
                            <span className={`gender-badge ${patient.gender.toLowerCase()}`}>
                              {patient.gender}
                            </span>
                          </td>
                          <td>{patient.phone}</td>
                          <td className="patient-visits">{patient._count?.visits || 0}</td>
                          <td className="table-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePatientClick(patient.id);
                              }}
                              className="action-btn view-btn"
                              title="View patient details"
                            >
                              <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPatient(patient.id);
                              }}
                              className="action-btn edit-btn"
                              title="Edit patient"
                            >
                              <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePatient(patient.id, patient.name);
                              }}
                              className="action-btn delete-btn"
                              title="Delete patient"
                            >
                              <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientList;
