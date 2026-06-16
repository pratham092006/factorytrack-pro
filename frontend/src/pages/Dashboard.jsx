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
  getMonthKeys
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
    const textColor = isDark ? '#8b949e' : '#475569';
    const gridColor = isDark ? '#334155' : '#e2e8f0';

    // 1. Salary Expense Chart
    const salaryChartCtx = salaryChartRef.current?.getContext('2d');
    if (salaryChartCtx) {
      const salData = staff
        .map(s => ({ name: s.name, gross: calcStaffSalary(s.id, selectedMonth)?.grossSalary || 0 }))
        .filter(x => x.gross > 0);

      salaryChartInstance.current = new Chart(salaryChartCtx, {
        type: 'bar',
        data: {
          labels: salData.map(x => x.name.split(' ')[0]),
          datasets: [{
            label: 'Gross Salary',
            data: salData.map(x => x.gross),
            backgroundColor: '#3B82F6',
            borderRadius: 6,
            barThickness: 24
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `Gross Pay: ₹${context.raw.toLocaleString('en-IN')}`
              }
            }
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: { ticks: { color: textColor }, grid: { color: gridColor } }
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
            backgroundColor: ['#10B981', '#EF4444', '#94A3B8'],
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#1E293B' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, boxWidth: 12, font: { size: 11 } }
            }
          },
          cutout: '65%'
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
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-title">Factory Overview</div>
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
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{staff.length}</div>
            <div className="stat-label">Total Staff</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{presentTodayCount}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <span className="material-symbols-outlined">person_cancel</span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{absentTodayCount}</div>
            <div className="stat-label">Absent Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <span className="material-symbols-outlined">monetization_on</span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{fmtCurrency(totalSalary)}</div>
            <div className="stat-label">Salary Payable</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{fmtCurrency(totalAdv)}</div>
            <div className="stat-label">Total Advances</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper teal">
            <span className="material-symbols-outlined">savings</span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{fmtCurrency(totalSav)}</div>
            <div className="stat-label">Savings Held</div>
          </div>
        </div>
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
              earners
                .filter(e => e.gross > 0)
                .map((e, idx) => (
                  <div key={e.s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: idx < earners.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: '26px', height: '26px', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                      #{idx + 1}
                    </div>
                    <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '11px' }}>
                      {e.s.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{e.s.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{e.s.staffId}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {fmtCurrency(e.gross)}
                    </div>
                  </div>
                ))
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
              <>
                {todayAtt.slice(0, 5).map((a, idx) => {
                  const s = staff.find(x => x.id === a.staffId);
                  const statusBadge = {
                    present: 'badge-success', absent: 'badge-danger',
                    'half-day': 'badge-warning', leave: 'badge-info'
                  }[a.status] || 'badge-gray';
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: idx < Math.min(todayAtt.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '11px' }}>
                        {s ? s.name[0].toUpperCase() : '?'}
                      </div>
                      <div style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>
                        {s ? s.name : 'Unknown Staff'}
                      </div>
                      <span className={`badge ${statusBadge}`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
                {todayAtt.length > 5 && (
                  <div style={{ textAlign: 'center', padding: '10px 0 0', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                    + {todayAtt.length - 5} more staff members marked
                  </div>
                )}
              </>
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
              newStaff.map((s, idx) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: idx < newStaff.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '11px' }}>
                    {s.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Joined {fmtDate(s.joiningDate)}</div>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                    {s.staffId}
                  </span>
                </div>
              ))
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
              <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>credit_card</span>
                  Total Gross Payroll
                </span>
                <strong>{fmtCurrency(totalSalary)}</strong>
              </div>
              <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--danger)' }}>payments</span>
                  Outstanding Advances
                </span>
                <strong style={{ color: 'var(--danger)' }}>{fmtCurrency(totalAdv)}</strong>
              </div>
              <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--success)' }}>savings</span>
                  Worker Savings Held
                </span>
                <strong style={{ color: 'var(--success)' }}>{fmtCurrency(totalSav)}</strong>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
              <div className="payment-row total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px' }}>
                <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>paid</span>
                  Net Monthly Payable
                </span>
                <span style={{ color: 'var(--primary)' }}>{fmtCurrency(totalSalary - totalAdv)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
