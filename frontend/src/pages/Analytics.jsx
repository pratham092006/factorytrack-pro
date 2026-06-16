import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

export default function Analytics({
  staff,
  attendance,
  advances,
  savings,
  payments,
  getMonthKeys,
  thisMonthKey,
  fmtCurrency,
  calcStaffSalary,
  getSavingsBalance,
  getAdvanceBalance
}) {
  const [selectedMonth, setSelectedMonth] = useState(thisMonthKey());
  const monthKeys = getMonthKeys(24);

  // Chart refs & instances
  const attDistributionRef = useRef(null);
  const attDistributionInstance = useRef(null);

  const advanceRecoveryRef = useRef(null);
  const advanceRecoveryInstance = useRef(null);

  const savingsFlowRef = useRef(null);
  const savingsFlowInstance = useRef(null);

  // Month-specific calculations
  const monthAtt = attendance.filter(a => a.date.slice(0, 7) === selectedMonth);
  const totalAttRecords = monthAtt.length;
  const presentCount = monthAtt.filter(a => a.status === 'present').length;
  const absentCount = monthAtt.filter(a => a.status === 'absent').length;
  const halfDayCount = monthAtt.filter(a => a.status === 'halfday').length;
  const leaveCount = monthAtt.filter(a => a.status === 'leave').length;

  const attendanceRate = totalAttRecords > 0 
    ? (((presentCount + halfDayCount * 0.5) / totalAttRecords) * 100).toFixed(1) 
    : '0';

  // Advances data
  const monthAdvances = advances.filter(a => a.date.slice(0, 7) === selectedMonth);
  const totalAdvancesGiven = monthAdvances.reduce((sum, a) => sum + a.amount, 0);
  const totalAdvancesRepaid = monthAdvances.reduce((sum, a) => sum + (a.repaid || 0), 0);

  // Savings data
  const monthSavings = savings.filter(s => s.date.slice(0, 7) === selectedMonth);
  const totalDeposits = monthSavings.filter(s => s.type === 'deposit').reduce((sum, s) => sum + s.amount, 0);
  const totalWithdrawals = monthSavings.filter(s => s.type === 'withdraw').reduce((sum, s) => sum + s.amount, 0);
  const netSavingsFlow = totalDeposits - totalWithdrawals;

  // Active staff count
  const activeStaffCount = staff.filter(s => s.status === 'active').length;

  // Total monthly salary budget
  const totalSalaryBudget = staff.reduce((sum, s) => sum + (calcStaffSalary(s.id, selectedMonth)?.grossSalary || 0), 0);

  useEffect(() => {
    // Destroy existing charts to prevent canvas re-use errors
    if (attDistributionInstance.current) attDistributionInstance.current.destroy();
    if (advanceRecoveryInstance.current) advanceRecoveryInstance.current.destroy();
    if (savingsFlowInstance.current) savingsFlowInstance.current.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? 'hsl(215, 20%, 75%)' : 'hsl(215, 16%, 35%)';
    const gridColor = isDark ? 'hsl(222, 30%, 18%)' : 'hsl(214, 32%, 91%)';

    const chartConfig = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            font: { family: 'Plus Jakarta Sans', size: 11 }
          }
        },
        tooltip: {
          padding: 12,
          cornerRadius: 12,
          backgroundColor: isDark ? '#151e2e' : '#0f172a',
          titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
          bodyFont: { family: 'Inter' }
        }
      }
    };

    // 1. Attendance Distribution Pie Chart
    const attCtx = attDistributionRef.current?.getContext('2d');
    if (attCtx && totalAttRecords > 0) {
      attDistributionInstance.current = new Chart(attCtx, {
        type: 'pie',
        data: {
          labels: ['Present', 'Absent', 'Half Day', 'Leave'],
          datasets: [{
            data: [presentCount, absentCount, halfDayCount, leaveCount],
            backgroundColor: [
              '#10b981', // green
              '#ef4444', // red
              '#f59e0b', // amber
              '#3b82f6'  // blue
            ],
            borderWidth: isDark ? 2 : 0,
            borderColor: isDark ? '#0f172a' : '#fff'
          }]
        },
        options: chartConfig
      });
    }

    // 2. Advance Recovery Bar Chart (Given vs Repaid per Employee)
    const advCtx = advanceRecoveryRef.current?.getContext('2d');
    if (advCtx) {
      const staffAdvancesData = staff.map(s => {
        const staffMonthAdv = monthAdvances.filter(a => a.staffId === s.id);
        const given = staffMonthAdv.reduce((sum, a) => sum + a.amount, 0);
        const repaid = staffMonthAdv.reduce((sum, a) => sum + (a.repaid || 0), 0);
        return { name: s.name.split(' ')[0], given, repaid };
      }).filter(x => x.given > 0 || x.repaid > 0);

      advanceRecoveryInstance.current = new Chart(advCtx, {
        type: 'bar',
        data: {
          labels: staffAdvancesData.map(x => x.name),
          datasets: [
            {
              label: 'Advances Taken',
              data: staffAdvancesData.map(x => x.given),
              backgroundColor: '#ef4444',
              borderRadius: 6,
              barThickness: 15
            },
            {
              label: 'Amount Repaid',
              data: staffAdvancesData.map(x => x.repaid),
              backgroundColor: '#10b981',
              borderRadius: 6,
              barThickness: 15
            }
          ]
        },
        options: {
          ...chartConfig,
          plugins: {
            ...chartConfig.plugins,
            legend: {
              position: 'top',
              labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
            }
          },
          scales: {
            x: {
              ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 } },
              grid: { display: false }
            },
            y: {
              ticks: { color: textColor, font: { family: 'Inter', size: 10 } },
              grid: { color: gridColor }
            }
          }
        }
      });
    }

    // 3. Savings Flow Doughnut Chart (Deposits vs Withdrawals)
    const savCtx = savingsFlowRef.current?.getContext('2d');
    if (savCtx && (totalDeposits > 0 || totalWithdrawals > 0)) {
      savingsFlowInstance.current = new Chart(savCtx, {
        type: 'doughnut',
        data: {
          labels: ['Deposits', 'Withdrawals'],
          datasets: [{
            data: [totalDeposits, totalWithdrawals],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: isDark ? 2 : 0,
            borderColor: isDark ? '#0f172a' : '#fff'
          }]
        },
        options: {
          ...chartConfig,
          cutout: '65%'
        }
      });
    }

  }, [selectedMonth, staff, attendance, advances, savings, payments]);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-title">Analytics Insights</div>
          <div className="page-header-subtitle">Performance breakdown, financial metrics, and resource distribution</div>
        </div>
        <div className="page-header-actions">
          <select 
            className="form-control" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ width: 'auto' }}
          >
            {monthKeys.map(key => (
              <option key={key} value={key}>{monthLabel(key)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid-4 stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{attendanceRate}%</div>
            <div className="stat-label">Attendance Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{fmtCurrency(totalSalaryBudget)}</div>
            <div className="stat-label">Salary Budget</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{fmtCurrency(totalAdvancesGiven)}</div>
            <div className="stat-label">Monthly Advances Given</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
            <span className="material-symbols-outlined">savings</span>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: netSavingsFlow >= 0 ? 'inherit' : 'var(--danger)' }}>
              {netSavingsFlow >= 0 ? '+' : ''}{fmtCurrency(netSavingsFlow)}
            </div>
            <div className="stat-label">Net Savings Growth</div>
          </div>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid-main-chart" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        {/* Left Card: Advance Recovery Graph */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>handshake</span>
              Advance & Recovery Breakdown
            </div>
          </div>
          <div className="card-body" style={{ height: '320px', position: 'relative' }}>
            {monthAdvances.length > 0 ? (
              <canvas ref={advanceRecoveryRef}></canvas>
            ) : (
              <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--text-muted)' }}>handshake</span>
                <p style={{ fontSize: '13px', marginTop: '10px' }}>No advances logged for this month.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Attendance status distribution */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--success)' }}>donut_large</span>
              Attendance Distribution
            </div>
          </div>
          <div className="card-body" style={{ height: '320px', position: 'relative' }}>
            {totalAttRecords > 0 ? (
              <canvas ref={attDistributionRef}></canvas>
            ) : (
              <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--text-muted)' }}>calendar_today</span>
                <p style={{ fontSize: '13px', marginTop: '10px' }}>No attendance records logged for this month.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Savings flow */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--info)' }}>account_balance</span>
              Savings Flow (Deposits vs Withdrawals)
            </div>
          </div>
          <div className="card-body" style={{ height: '280px', position: 'relative' }}>
            {(totalDeposits > 0 || totalWithdrawals > 0) ? (
              <canvas ref={savingsFlowRef}></canvas>
            ) : (
              <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--text-muted)' }}>savings</span>
                <p style={{ fontSize: '13px', marginTop: '10px' }}>No savings operations logged for this month.</p>
              </div>
            )}
          </div>
        </div>

        {/* Operational workforce details */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--success)' }}>engineering</span>
              Factory Workforce Profile
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Registered Employees</span>
              <strong style={{ fontSize: '16px' }}>{staff.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active Employees</span>
              <strong style={{ fontSize: '16px', color: 'var(--success)' }}>{activeStaffCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Inactive Employees</span>
              <strong style={{ fontSize: '16px', color: 'var(--text-muted)' }}>{staff.length - activeStaffCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Daily Wage vs Monthly Ratio</span>
              <strong style={{ fontSize: '13px' }}>
                {staff.filter(s => s.salaryType === 'daily').length} Daily / {staff.filter(s => s.salaryType === 'monthly').length} Monthly
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
