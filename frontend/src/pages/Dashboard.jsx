import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

export default function Dashboard({ 
  staff, 
  attendance, 
  advances, 
  savings, 
  payments, 
  settings, 
  onNavigate,
  calcStaffSalary,
  getSavingsBalance,
  getAdvanceBalance,
  fmtCurrency,
  fmtDate,
  today,
  thisMonthKey,
  monthLabel,
  getMonthKeys,
  currentUser
}) {
  const [selectedMonth, setSelectedMonth] = useState(thisMonthKey());
  const salaryChartRef = useRef(null);
  const attendanceChartRef = useRef(null);
  const salaryChartInstance = useRef(null);
  const attendanceChartInstance = useRef(null);

  const monthKeys = getMonthKeys(24);
  const t = today();
  const todayAtt = attendance.filter(a => a.date === t);
  const presentTodayCount = todayAtt.filter(a => a.status === 'present').length;
  const absentTodayCount = todayAtt.filter(a => a.status === 'absent').length;

  const totalSalary = staff.reduce((sum, s) => sum + (calcStaffSalary(s.id, selectedMonth)?.grossSalary || 0), 0);
  const totalAdv = advances.reduce((sum, a) => sum + a.amount - (a.repaid || 0), 0);
  const totalSav = staff.reduce((sum, s) => sum + getSavingsBalance(s.id), 0);

  // Top earners list
  const earners = staff
    .map(s => ({ s, gross: calcStaffSalary(s.id, selectedMonth)?.grossSalary || 0 }))
    .sort((a, b) => b.gross - a.gross)
    .slice(0, 5);

  // New staff this month
  const currentMonthStart = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const newStaff = staff.filter(s => s.joiningDate && s.joiningDate.slice(0, 7) === currentMonthStart);

  useEffect(() => {
    // Destroy existing charts
    if (salaryChartInstance.current) salaryChartInstance.current.destroy();
    if (attendanceChartInstance.current) attendanceChartInstance.current.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? 'hsl(215, 20%, 75%)' : 'hsl(215, 16%, 35%)';
    const gridColor = isDark ? 'hsl(222, 30%, 18%)' : 'hsl(214, 32%, 91%)';

    // 1. Salary Expense Chart
    const salaryChartCtx = salaryChartRef.current?.getContext('2d');
    if (salaryChartCtx) {
      const salData = staff
        .map(s => ({ name: s.name, gross: calcStaffSalary(s.id, selectedMonth)?.grossSalary || 0 }))
        .filter(x => x.gross > 0);

      // Create primary color gradient
      const gradient = salaryChartCtx.createLinearGradient(0, 0, 0, 240);
      if (isDark) {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
      } else {
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.85)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.05)');
      }

      salaryChartInstance.current = new Chart(salaryChartCtx, {
        type: 'bar',
        data: {
          labels: salData.map(x => (x.name || 'Unknown').split(' ')[0]),
          datasets: [{
            label: 'Gross Salary',
            data: salData.map(x => x.gross),
            backgroundColor: gradient,
            hoverBackgroundColor: isDark ? 'rgba(59, 130, 246, 1)' : 'rgba(37, 99, 235, 1)',
            borderColor: isDark ? '#3b82f6' : '#2563eb',
            borderWidth: 1.5,
            borderRadius: 8,
            barThickness: 20
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: {
              padding: 12,
              cornerRadius: 12,
              backgroundColor: isDark ? '#151e2e' : '#0f172a',
              titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
              bodyFont: { family: 'Inter' },
              callbacks: {
                label: (context) => `Gross Pay: ₹${context.raw.toLocaleString('en-IN')}`
              }
            }
          },
          scales: {
            x: { ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }, grid: { display: false } },
            y: { ticks: { color: textColor, font: { family: 'Inter', size: 11 } }, grid: { color: gridColor } }
          }
        }
      });
    }

    // 2. Attendance Doughnut Chart
    const attendanceChartCtx = attendanceChartRef.current?.getContext('2d');
    if (attendanceChartCtx) {
      const notMarkedCount = Math.max(0, staff.length - presentTodayCount - absentTodayCount);
      attendanceChartInstance.current = new Chart(attendanceChartCtx, {
        type: 'doughnut',
        data: {
          labels: ['Present', 'Absent', 'Not Marked'],
          datasets: [{
            data: [presentTodayCount, absentTodayCount, notMarkedCount],
            backgroundColor: [
              'rgba(16, 185, 129, 0.85)',
              'rgba(239, 68, 68, 0.85)',
              isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
            ],
            hoverBackgroundColor: [
              'rgba(16, 185, 129, 1)',
              'rgba(239, 68, 68, 1)',
              isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'
            ],
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#151E2E' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { 
                color: textColor, 
                boxWidth: 10, 
                boxHeight: 10,
                usePointStyle: true,
                padding: 16,
                font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } 
              }
            },
            tooltip: {
              padding: 12,
              cornerRadius: 12,
              backgroundColor: isDark ? '#151e2e' : '#0f172a',
              titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
              bodyFont: { family: 'Inter' }
            }
          },
          cutout: '70%'
        }
      });
    }

    return () => {
      if (salaryChartInstance.current) salaryChartInstance.current.destroy();
      if (attendanceChartInstance.current) attendanceChartInstance.current.destroy();
    };
  }, [selectedMonth, staff, attendance, isDarkMode()]);

  // Helper to detect dark mode for chart re-drawing
  function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  return (
    <div className="page-container fade-in">
      {/* Dashboard Welcome Hero Banner */}
      <div className="dashboard-banner">
        <div className="banner-glow-circle"></div>
        <div className="banner-content">
          <div className="banner-badge">
            <span className="material-symbols-outlined">verified</span>
            System Live & Syncing
          </div>
          <h1>Good day, {currentUser?.username ? (currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1)) : 'Factory Manager'}!</h1>
          <p>
            You have <strong>{staff.length} staff</strong> members active. Today's attendance is 
            <strong> {presentTodayCount} present</strong> and <strong>{absentTodayCount} absent</strong> (<strong>{Math.round(((presentTodayCount + absentTodayCount) / (staff.length || 1)) * 100)}%</strong> marked).
          </p>
        </div>
        <div className="banner-stats">
          <div className="banner-stat-item">
            <div className="val">{monthLabel(selectedMonth).split(' ')[0]}</div>
            <div className="lbl">Active Period</div>
          </div>
          <div className="banner-stat-divider"></div>
          <div className="banner-stat-item">
            <div className="val">{fmtCurrency(totalSalary)}</div>
            <div className="lbl">Salary Payable</div>
          </div>
        </div>
      </div>

      {/* Control Actions Row */}
      <div className="page-header" style={{ marginTop: '8px' }}>
        <div className="page-header-info">
          <div className="page-header-title" style={{ fontSize: '18px', fontWeight: 800 }}>Factory Overview</div>
          <div className="page-header-subtitle">Update and monitor daily factory attendance and payroll status</div>
        </div>
        <div className="page-header-actions">
          <select 
            className="form-control" 
            style={{ width: 'auto', paddingRight: '36px' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthKeys.map(k => (
              <option key={k} value={k}>{monthLabel(k)}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => onNavigate('attendance')}>
            <span className="material-symbols-outlined">fact_check</span>
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {[
          { icon: 'groups',          color: 'blue',   value: staff.length,            label: 'Total Staff' },
          { icon: 'how_to_reg',      color: 'green',  value: presentTodayCount,        label: 'Present Today' },
          { icon: 'person_cancel',   color: 'red',    value: absentTodayCount,         label: 'Absent Today' },
          { icon: 'monetization_on', color: 'purple', value: fmtCurrency(totalSalary), label: 'Salary Payable' },
          { icon: 'payments',        color: 'orange', value: fmtCurrency(totalAdv),    label: 'Total Advances' },
          { icon: 'savings',         color: 'teal',   value: fmtCurrency(totalSav),    label: 'Savings Held' },
        ].map(({ icon, color, value, label }) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon-wrapper ${color}`}>
              <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid-main-chart">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span className="material-symbols-outlined">leaderboard</span>
              Monthly Salary Expense
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {monthLabel(selectedMonth)}
            </div>
          </div>
          <div className="card-body" style={{ height: '280px' }}>
            <canvas ref={salaryChartRef} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span className="material-symbols-outlined">pie_chart</span>
              Today's Attendance
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {fmtDate(t)}
            </div>
          </div>
          <div className="card-body" style={{ height: '280px' }}>
            <canvas ref={attendanceChartRef} />
          </div>
        </div>
      </div>

      {/* Lower Cards Lists Row */}
      <div className="grid-2">
        {/* Top Earners */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span className="material-symbols-outlined">emoji_events</span>
              Top Earners This Month
            </div>
          </div>
          <div className="card-body" style={{ padding: '12px 24px' }}>
            {earners.length > 0 && earners.some(e => e.gross > 0) ? (
              <div className="list-group">
                {earners
                  .filter(e => e.gross > 0)
                  .map((e, idx) => (
                    <div key={e.s.id} className="list-item">
                      <div className="rank-badge">
                        #{idx + 1}
                      </div>
                      <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '11px' }}>
                        {e.s.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{e.s.name || 'Unknown Staff'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{e.s.staffId}</div>
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>
                        {fmtCurrency(e.gross)}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon">group</span>
                <h3>No salary data available</h3>
                <p>Salary will compute as attendance gets marked.</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Attendance Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span className="material-symbols-outlined">fact_check</span>
              Today's Attendance Details
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {fmtDate(t)}
            </span>
          </div>
          <div className="card-body" style={{ padding: '12px 24px' }}>
            {todayAtt.length > 0 ? (
              <div className="list-group">
                {todayAtt.slice(0, 5).map((a) => {
                  const s = staff.find(x => x.id === a.staffId);
                  const statusBadge = {
                    present: 'badge-success', absent: 'badge-danger',
                    'half-day': 'badge-warning', leave: 'badge-info'
                  }[a.status] || 'badge-gray';
                  return (
                    <div key={a.id} className="list-item">
                      <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '11px' }}>
                        {s ? s.name[0].toUpperCase() : '?'}
                      </div>
                      <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {s ? s.name : 'Unknown Staff'}
                      </div>
                      <span className={`badge ${statusBadge}`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
                {todayAtt.length > 5 && (
                  <div style={{ textAlign: 'center', padding: '12px 0 0', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                    + {todayAtt.length - 5} more staff members marked
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon">assignment_late</span>
                <h3>No attendance recorded today</h3>
                <p>Start recording attendance for today's shifts.</p>
              </div>
            )}
          </div>
        </div>

        {/* Newly Added Staff */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span className="material-symbols-outlined">person_add</span>
              Staff Added This Month
            </div>
          </div>
          <div className="card-body" style={{ padding: '12px 24px' }}>
            {newStaff.length > 0 ? (
              <div className="list-group">
                {newStaff.map((s) => (
                  <div key={s.id} className="list-item">
                    <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '11px' }}>
                      {s.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{s.name || 'Unknown Staff'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Joined {fmtDate(s.joiningDate)}</div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                      {s.staffId}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon">person_add</span>
                <h3>No new staff members</h3>
                <p>No new staff added during {monthLabel(selectedMonth).split(' ')[0]}.</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Financial Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span className="material-symbols-outlined">account_balance</span>
              Monthly Financial Summary
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>credit_card</span>
                  Total Gross Payroll
                </span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{fmtCurrency(totalSalary)}</strong>
              </div>
              <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--danger)' }}>payments</span>
                  Outstanding Advances
                </span>
                <strong style={{ color: 'var(--danger)', fontWeight: 700 }}>{fmtCurrency(totalAdv)}</strong>
              </div>
              <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--success)' }}>savings</span>
                  Worker Savings Held
                </span>
                <strong style={{ color: 'var(--success)', fontWeight: 700 }}>{fmtCurrency(totalSav)}</strong>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
              <div className="payment-row total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', padding: '8px 0 0' }}>
                <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>paid</span>
                  Net Monthly Payable
                </span>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{fmtCurrency(totalSalary - totalAdv)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
