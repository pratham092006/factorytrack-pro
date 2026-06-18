import React from 'react';

export default function Header({ 
  activePage, 
  darkMode, 
  toggleDarkMode, 
  searchQuery, 
  setSearchQuery,
  sidebarOpen,
  setSidebarOpen,
  onAddStaff
}) {
  const pageTitles = {
    dashboard: 'Dashboard',
    staff: 'Staff Management',
    attendance: 'Attendance Marking',
    salary: 'Salary Calculator',
    advances: 'Advances',
    savings: 'Savings',
    payments: 'Payments & Payroll',
    reports: 'Reports Export',
    analytics: 'Analytics Insights',
    settings: 'System Settings'
  };

  const pageIcons = {
    dashboard: 'dashboard',
    staff: 'group',
    attendance: 'fact_check',
    salary: 'payments',
    advances: 'account_balance_wallet',
    savings: 'savings',
    payments: 'paid',
    reports: 'assignment',
    analytics: 'monitoring',
    settings: 'settings'
  };

  const searchablePage = ['staff', 'attendance', 'advances', 'payments'].includes(activePage);

  const searchPlaceholders = {
    attendance: 'Search by staff name…',
    advances: 'Search staff advances…',
    payments: 'Search staff payroll…',
    staff: 'Search staff or records…',
  };

  return (
    <header className="header">
      <button 
        className="header-menu-btn" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Page title — hidden on small viewports when search is visible */}
      {!searchablePage && (
        <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span 
            className="material-symbols-outlined" 
            style={{ 
              fontSize: '20px', 
              color: 'var(--primary)',
              fontVariationSettings: "'FILL' 1"
            }}
          >
            {pageIcons[activePage] || 'dashboard'}
          </span>
          {pageTitles[activePage] || 'Dashboard'}
        </div>
      )}

      {/* Search bar for applicable pages */}
      {searchablePage && (
        <div className="search-box" style={{ flex: 1, maxWidth: '420px' }}>
          <span className="material-symbols-outlined">search</span>
          <input 
            type="text" 
            className="form-control" 
            placeholder={searchPlaceholders[activePage] || 'Search…'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          )}
        </div>
      )}

      {/* Spacer when no search bar but we need push-right */}
      {!searchablePage && <div style={{ flex: 1 }} />}

      <div className="header-actions">
        {/* Notification Bell with dot */}
        <div className="icon-btn-wrap" data-tooltip="Notifications">
          <button className="icon-btn" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <span className="notification-dot"></span>
        </div>

        {/* Theme Toggler */}
        <button 
          className="icon-btn" 
          onClick={toggleDarkMode} 
          aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          data-tooltip={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          <span className="material-symbols-outlined">
            {darkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Quick Add Staff */}
        {activePage === 'staff' && (
          <button className="btn btn-primary btn-sm" onClick={onAddStaff}>
            <span className="material-symbols-outlined">person_add</span>
            <span className="hide-xs">Add Staff</span>
          </button>
        )}
      </div>
    </header>
  );
}
