import React from 'react';

export default function Sidebar({ 
  factoryName, 
  currentUser, 
  activePage, 
  setActivePage, 
  sidebarOpen, 
  setSidebarOpen, 
  onLogout 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', section: 'Main' },
    { id: 'staff', label: 'Staff List', icon: 'group', section: 'Main' },
    { id: 'attendance', label: 'Attendance', icon: 'fact_check', section: 'Main' },
    
    { id: 'salary', label: 'Salary', icon: 'payments', section: 'Finance' },
    { id: 'advances', label: 'Advances', icon: 'account_balance_wallet', section: 'Finance' },
    { id: 'savings', label: 'Savings', icon: 'savings', section: 'Finance' },
    { id: 'payments', label: 'Payments', icon: 'paid', section: 'Finance' },
    
    { id: 'reports', label: 'Reports', icon: 'assignment', section: 'Insights' },
    { id: 'analytics', label: 'Analytics', icon: 'monitoring', section: 'Insights' },
    { id: 'settings', label: 'Settings', icon: 'settings', section: 'Insights' },
  ];

  // Group nav items by section
  const sections = ['Main', 'Finance', 'Insights'];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" onClick={() => { setActivePage('dashboard'); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo-container">
            <span className="material-symbols-outlined">precision_manufacturing</span>
          </div>
          <div>
            <div className="sidebar-title">{factoryName || 'FactoryTrack'}</div>
            <div className="sidebar-subtitle">Pro Edition</div>
          </div>
        </div>

        <div className="sidebar-nav">
          {sections.map(secName => (
            <React.Fragment key={secName}>
              <div className="nav-section-label">{secName}</div>
              {navItems
                .filter(item => item.section === secName)
                .map(item => (
                  <div
                    key={item.id}
                    className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                    onClick={() => {
                      setActivePage(item.id);
                      setSidebarOpen(false); // Close sidebar on mobile select
                    }}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
            </React.Fragment>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-card" onClick={onLogout}>
            <div className="user-avatar">
              {currentUser?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser?.username || 'Admin'}</div>
              <div className="user-role">Sign Out</div>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--text-muted)' }}>
              logout
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}
