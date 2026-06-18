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
    { id: 'dashboard',  label: 'Dashboard',   icon: 'dashboard',             section: 'Main' },
    { id: 'staff',      label: 'Staff List',   icon: 'group',                 section: 'Main' },
    { id: 'attendance', label: 'Attendance',   icon: 'fact_check',            section: 'Main' },
    
    { id: 'salary',     label: 'Salary',       icon: 'payments',              section: 'Finance' },
    { id: 'advances',   label: 'Advances',     icon: 'account_balance_wallet', section: 'Finance' },
    { id: 'savings',    label: 'Savings',      icon: 'savings',               section: 'Finance' },
    { id: 'payments',   label: 'Payments',     icon: 'paid',                  section: 'Finance' },
    
    { id: 'reports',    label: 'Reports',      icon: 'assignment',            section: 'Insights' },
    { id: 'analytics',  label: 'Analytics',    icon: 'monitoring',            section: 'Insights' },
    { id: 'settings',   label: 'Settings',     icon: 'settings',              section: 'Insights' },
  ];

  const sections = ['Main', 'Finance', 'Insights'];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />

      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Brand Header */}
        <div 
          className="sidebar-header" 
          onClick={() => { setActivePage('dashboard'); setSidebarOpen(false); }} 
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setActivePage('dashboard')}
          aria-label="Go to Dashboard"
        >
          <div className="sidebar-logo-container">
            <span className="material-symbols-outlined">precision_manufacturing</span>
          </div>
          <div>
            <div className="sidebar-title">{factoryName || 'FactoryTrack'}</div>
            <div className="sidebar-subtitle">Pro Edition</div>
          </div>
        </div>

        {/* Navigation */}
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
                      setSidebarOpen(false);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setActivePage(item.id)}
                    aria-current={activePage === item.id ? 'page' : undefined}
                    aria-label={item.label}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {activePage === item.id && (
                      <span 
                        className="material-symbols-outlined" 
                        style={{ 
                          fontSize: '16px', 
                          opacity: 0.7,
                          fontVariationSettings: "'wght' 300"
                        }}
                      >
                        chevron_right
                      </span>
                    )}
                  </div>
                ))}
            </React.Fragment>
          ))}
        </div>

        {/* User Card / Logout */}
        <div className="sidebar-footer">
          {/* Version tag */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <span style={{ 
              fontSize: '10px', 
              color: 'var(--text-muted)', 
              background: 'var(--neutral-light)',
              border: '1px solid var(--border)',
              padding: '3px 10px', 
              borderRadius: '20px',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}>
              FactoryTrack Pro v3.0
            </span>
          </div>

          <div 
            className="user-card" 
            onClick={onLogout}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onLogout()}
            aria-label="Sign out"
            title="Click to sign out"
          >
            <div className="user-avatar online">
              {currentUser?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser?.username || 'Admin'}</div>
              <div className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span 
                  className="material-symbols-outlined" 
                  style={{ fontSize: '11px', color: 'var(--success)' }}
                >
                  circle
                </span>
                Online · Sign out
              </div>
            </div>
            <span 
              className="material-symbols-outlined" 
              style={{ fontSize: '18px', color: 'var(--text-muted)' }}
            >
              logout
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}
