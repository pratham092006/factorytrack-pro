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

  return (
    <header className="header">
      <button 
        className="header-menu-btn" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      <div className="header-title">
        {pageTitles[activePage] || 'Dashboard'}
      </div>

      {/* Show search bar on search-applicable pages */}
      {['staff', 'attendance', 'advances', 'payments'].includes(activePage) && (
        <div className="search-box">
          <span className="material-symbols-outlined">search</span>
          <input 
            type="text" 
            className="form-control" 
            placeholder={
              activePage === 'attendance' 
                ? 'Search by staff name...' 
                : activePage === 'advances'
                ? 'Search staff advances...'
                : activePage === 'payments'
                ? 'Search staff payroll...'
                : 'Search staff or records...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div className="header-actions">
        {/* Notification Bell */}
        <button className="icon-btn" title="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Theme Toggler */}
        <button 
          className="icon-btn" 
          onClick={toggleDarkMode} 
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="material-symbols-outlined">
            {darkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Quick Add Button */}
        {activePage === 'staff' && (
          <button className="btn btn-primary btn-sm" onClick={onAddStaff}>
            <span className="material-symbols-outlined">person_add</span>
            Add Staff
          </button>
        )}
      </div>
    </header>
  );
}
