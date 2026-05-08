import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-gradient-slow">
      {/* Header / Navbar */}
      <nav className="bg-white/90 backdrop-blur-xl shadow-2xl border-b border-indigo-100/50 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  HealthCare Pro
                </h1>
                <p className="text-xs text-gray-500 font-medium">Patient Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 px-5 py-2.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {(user?.name || user?.email)?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">{user?.name || 'Doctor'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-red-500 via-red-600 to-pink-600 hover:from-red-600 hover:via-red-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-red-300 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-full mx-auto py-8 px-6 lg:px-12">
        <div>
          {/* Welcome Section with Quick Actions */}
          <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                Welcome back, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{user?.name || 'Doctor'}!</span>
                <span className="text-4xl animate-wave inline-block">👋</span>
              </h2>
              <p className="text-gray-600 text-lg">Here's your practice overview for today - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex gap-3">
              <button className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                New Patient
              </button>
              <button className="px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-gray-200 transform hover:scale-105 active:scale-95 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {/* Total Patients Card */}
            <div className="group bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-7 border border-blue-400 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-black text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    +12%
                  </span>
                </div>
                <h3 className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform">0</h3>
                <p className="text-blue-100 font-bold text-lg">Total Patients</p>
              </div>
            </div>

            {/* Appointments Card */}
            <div className="group bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-3xl shadow-2xl p-7 border border-green-400 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-black text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">Today</span>
                </div>
                <h3 className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform">0</h3>
                <p className="text-green-100 font-bold text-lg">Appointments</p>
              </div>
            </div>

            {/* Consultations Card */}
            <div className="group bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-7 border border-purple-400 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-sm font-black text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg animate-pulse">Active</span>
                </div>
                <h3 className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform">0</h3>
                <p className="text-purple-100 font-bold text-lg">Consultations</p>
              </div>
            </div>

            {/* Waiting Room Card */}
            <div className="group bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-3xl shadow-2xl p-7 border border-orange-400 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-black text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">Pending</span>
                </div>
                <h3 className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform">0</h3>
                <p className="text-orange-100 font-bold text-lg">Waiting Room</p>
              </div>
            </div>
          </div>

          {/* Success Message with Animation */}
          <div className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 border-l-8 border-green-600 rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="flex items-start relative z-10">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl animate-bounce">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                  Authentication Successful! 
                  <span className="text-2xl">🎉</span>
                </h3>
                <p className="text-white/95 text-lg font-medium">
                  You are securely logged in. This dashboard is protected and only accessible to authenticated users.
                  All your patient data is encrypted and secure with end-to-end protection.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Today's Schedule */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Today's Schedule
                </h3>
                <button className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1">
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-black text-lg">09</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-bold text-gray-900">No appointments scheduled</p>
                    <p className="text-sm text-gray-600">Your calendar is clear for now</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">Available</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Stats
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <span className="font-bold">This Week</span>
                    <span className="text-2xl font-black">0</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <span className="font-bold">This Month</span>
                    <span className="text-2xl font-black">0</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <span className="font-bold">Total Revenue</span>
                    <span className="text-2xl font-black">$0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Available Modules
          </h3>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-10">
            <div className="group bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-100 hover:border-blue-300 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-4">Patient Management</h4>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">Comprehensive patient records, medical history, and treatment plans all in one secure place.</p>
                <span className="inline-flex items-center text-base font-black text-blue-600 group-hover:text-blue-700 bg-blue-50 px-5 py-2.5 rounded-full">
                  Coming Soon
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="group bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-100 hover:border-purple-300 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-4">Consultation Workflow</h4>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">Streamlined consultation process with digital prescriptions and treatment documentation.</p>
                <span className="inline-flex items-center text-base font-black text-purple-600 group-hover:text-purple-700 bg-purple-50 px-5 py-2.5 rounded-full">
                  Coming Soon
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="group bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-100 hover:border-green-300 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-4">Appointment Scheduling</h4>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">Smart scheduling system with automated reminders and calendar integration.</p>
                <span className="inline-flex items-center text-base font-black text-green-600 group-hover:text-green-700 bg-green-50 px-5 py-2.5 rounded-full">
                  Coming Soon
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
