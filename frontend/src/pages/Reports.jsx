import React, { useState } from 'react';

export default function Reports({
  staff,
  attendance,
  advances,
  savings,
  payments,
  searchQuery,
  calcStaffSalary,
  getSavingsBalance,
  getAdvanceBalance,
  fmtCurrency,
  monthLabel,
  thisMonthKey,
  getMonthKeys
}) {
  const [selectedMonth, setSelectedMonth] = useState(thisMonthKey());
  const monthKeys = getMonthKeys(24);

  const filteredStaff = staff.filter(s =>
    !searchQuery ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.staffId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reportRows = filteredStaff.map(s => {
    const sal = calcStaffSalary(s.id, selectedMonth);
    const advBal = getAdvanceBalance(s.id);
    const savBal = getSavingsBalance(s.id);
    const gross = sal ? sal.grossSalary : 0;
    const net = gross - advBal + savBal;
    return {
      ...s,
      presentDays: sal ? sal.presentDays : 0,
      totalWorked: sal ? sal.totalWorked : 0,
      totalOT: sal ? sal.totalOT : 0,
      basicPay: sal ? sal.basicPay : 0,
      otPay: sal ? sal.otPay : 0,
      gross,
      advances: advBal,
      savings: savBal,
      net
    };
  });

  const totalGross = reportRows.reduce((a, r) => a + r.gross, 0);
  const totalNet = reportRows.reduce((a, r) => a + r.net, 0);
  const totalPayments = payments
    .filter(p => p.month === selectedMonth)
    .reduce((a, p) => a + p.amount, 0);

  const exportCSV = () => {
    const headers = ['Staff ID', 'Name', 'Salary Type', 'Present Days', 'Total Hours', 'OT Hours', 'Basic Pay', 'OT Pay', 'Gross Salary', 'Advance Deductions', 'Savings', 'Net Payable'];
    const rows = reportRows.map(r => [
      r.staffId, r.name, r.salaryType,
      r.presentDays, r.totalWorked, r.totalOT,
      r.basicPay, r.otPay, r.gross, r.advances, r.savings, r.net
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-report-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-title">Payroll Reports</div>
          <div className="page-header-subtitle">Monthly salary breakdown and payroll summary reports</div>
        </div>
        <div className="page-header-actions">
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {monthKeys.map(k => (
              <option key={k} value={k}>{monthLabel(k)}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={exportCSV}>
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>groups</span>
          </div>
          <div>
            <div className="stat-label">Total Staff</div>
            <div className="stat-value">{reportRows.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--success)' }}>account_balance_wallet</span>
          </div>
          <div>
            <div className="stat-label">Total Gross Payroll</div>
            <div className="stat-value">{fmtCurrency(totalGross)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(249,115,22,0.15)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--warning)' }}>payments</span>
          </div>
          <div>
            <div className="stat-label">Total Net Payable</div>
            <div className="stat-value">{fmtCurrency(totalNet)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--danger)' }}>paid</span>
          </div>
          <div>
            <div className="stat-label">Total Disbursed</div>
            <div className="stat-value">{fmtCurrency(totalPayments)}</div>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="card desktop-only">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th style={{ textAlign: 'center' }}>Present Days</th>
                <th style={{ textAlign: 'center' }}>Total Hrs</th>
                <th style={{ textAlign: 'center' }}>OT Hrs</th>
                <th style={{ textAlign: 'right' }}>Basic Pay</th>
                <th style={{ textAlign: 'right' }}>OT Pay</th>
                <th style={{ textAlign: 'right' }}>Gross</th>
                <th style={{ textAlign: 'right' }}>Advances</th>
                <th style={{ textAlign: 'right' }}>Net Payable</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.length > 0 ? reportRows.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                        {r.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{r.name || 'Unknown Staff'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.staffId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{r.presentDays}</td>
                  <td style={{ textAlign: 'center' }}>{r.totalWorked}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: r.totalOT > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                      {r.totalOT > 0 ? `+${r.totalOT}` : '-'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>{fmtCurrency(r.basicPay)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--warning)' }}>
                    {r.otPay > 0 ? `+${fmtCurrency(r.otPay)}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtCurrency(r.gross)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>
                    {r.advances > 0 ? `-${fmtCurrency(r.advances)}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                    {fmtCurrency(r.net)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>table_chart</span>
                    No payroll data for the selected period
                  </td>
                </tr>
              )}
            </tbody>
            {reportRows.length > 0 && (
              <tfoot>
                <tr style={{ background: 'var(--bg-secondary)', fontWeight: 700 }}>
                  <td colSpan={6} style={{ textAlign: 'right' }}>Totals</td>
                  <td style={{ textAlign: 'right' }}>{fmtCurrency(totalGross)}</td>
                  <td></td>
                  <td style={{ textAlign: 'right', color: 'var(--primary)' }}>{fmtCurrency(totalNet)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <div className="mobile-only">
        <div className="card-title" style={{ fontSize: '14px', marginBottom: '12px', paddingLeft: '4px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>table_chart</span>
          Payroll Report Summary
        </div>
        {reportRows.length > 0 ? (
          <div className="mobile-card-list">
            {reportRows.map(r => (
              <div key={r.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="mobile-card-title">
                    <div className="user-avatar" style={{ width: '36px', height: '36px' }}>
                      {r.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="mobile-card-title-text">{r.name || 'Unknown Staff'}</div>
                      <div className="mobile-card-subtitle-text" style={{ marginTop: '2px' }}>
                        <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {r.staffId}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-info">
                    {r.salaryType === 'monthly' ? 'Monthly' : 'Daily'}
                  </span>
                </div>

                <div className="mobile-card-body">
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Attendance</span>
                    <span className="mobile-card-value">
                      {r.presentDays} days ({r.totalWorked} hrs)
                    </span>
                  </div>

                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Overtime Hours</span>
                    <span className="mobile-card-value">
                      {r.totalOT > 0 ? (
                        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                          +{r.totalOT} hrs
                        </span>
                      ) : '-'}
                    </span>
                  </div>

                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Basic Pay</span>
                    <span className="mobile-card-value">{fmtCurrency(r.basicPay)}</span>
                  </div>

                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Overtime Pay</span>
                    <span className="mobile-card-value" style={{ color: 'var(--success)', fontWeight: 600 }}>
                      {r.otPay > 0 ? `+${fmtCurrency(r.otPay)}` : '-'}
                    </span>
                  </div>

                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Gross Salary</span>
                    <span className="mobile-card-value" style={{ fontWeight: 600 }}>
                      {fmtCurrency(r.gross)}
                    </span>
                  </div>

                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Advances Deducted</span>
                    <span className="mobile-card-value" style={{ color: 'var(--danger)', fontWeight: 600 }}>
                      {r.advances > 0 ? `-${fmtCurrency(r.advances)}` : '-'}
                    </span>
                  </div>

                  <div className="mobile-card-row" style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    <span className="mobile-card-label" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      Net Payable
                    </span>
                    <span className="mobile-card-value" style={{ fontSize: '16px', color: 'var(--primary)', fontWeight: 800 }}>
                      {fmtCurrency(r.net)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>table_chart</span>
                No payroll data for the selected period
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
