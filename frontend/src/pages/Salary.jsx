import React, { useState } from 'react';

export default function Salary({
  staff,
  calcStaffSalary,
  fmtCurrency,
  monthLabel,
  thisMonthKey,
  getMonthKeys
}) {
  const [selectedMonth, setSelectedMonth] = useState(thisMonthKey());
  const monthKeys = getMonthKeys(24);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-title">Salary Computation</div>
          <div className="page-header-subtitle">Automatic salary and daily wages computation based on attendance records</div>
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
        </div>
      </div>

      {/* Desktop view */}
      <div className="card desktop-only">
        <div className="card-header">
          <div className="card-title">
            <span className="material-symbols-outlined">payments</span>
            Payroll Sheet for {monthLabel(selectedMonth)}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Type</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Total Hours</th>
                <th>OT Hours</th>
                <th>Base Salary</th>
                <th>OT Pay</th>
                <th>Gross Salary</th>
              </tr>
            </thead>
            <tbody>
              {staff.length > 0 ? (
                staff.map(s => {
                  const sal = calcStaffSalary(s.id, selectedMonth);
                  if (!sal) return null;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="user-avatar">
                            {s.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.name || 'Unknown Staff'}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.staffId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {s.salaryType === 'monthly' ? 'Monthly' : 'Daily'}
                        </span>
                        {s.salaryType === 'daily' && (
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                            {fmtCurrency(s.dailyWage)}/day · {s.workingHours || 8} hrs
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                          {sal.presentDays}
                        </span>
                        {sal.halfDays > 0 && (
                          <span style={{ fontSize: '11px', color: 'var(--warning)', marginLeft: '3px' }}>
                            (+{sal.halfDays} half)
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                          {sal.absentDays}
                        </span>
                      </td>
                      <td>
                        {sal.totalWorked} hrs
                        {s.salaryType === 'daily' && (
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            req: {(sal.presentDays + sal.halfDays) * (sal.stdHours || s.workingHours || 8)} hrs
                          </div>
                        )}
                      </td>
                      <td>
                        {sal.totalOT > 0 ? (
                          <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                            +{sal.totalOT} hrs
                          </span>
                        ) : '-'}
                      </td>
                      <td>{fmtCurrency(sal.basicPay)}</td>
                      <td>
                        {sal.otPay > 0 ? (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                            +{fmtCurrency(sal.otPay)}
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>
                          {fmtCurrency(sal.grossSalary)}
                        </strong>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">
                    <div className="empty-state">
                      <span className="material-symbols-outlined empty-icon" style={{ fontSize: '48px' }}>paid</span>
                      <h3>No staff data available</h3>
                      <p>Add employees to computed payroll sheets.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <div className="mobile-only">
        <div className="card-title" style={{ fontSize: '14px', marginBottom: '12px', paddingLeft: '4px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>payments</span>
          Payroll Sheet for {monthLabel(selectedMonth)}
        </div>
        {staff.length > 0 ? (
          <div className="mobile-card-list">
            {staff.map(s => {
              const sal = calcStaffSalary(s.id, selectedMonth);
              if (!sal) return null;
              const rate = s.salaryType === 'monthly' 
                ? `${fmtCurrency(s.monthlySalary)}/mo` 
                : `${fmtCurrency(s.dailyWage)}/day`;
              
              return (
                <div key={s.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <div className="mobile-card-title">
                      <div className="user-avatar" style={{ width: '36px', height: '36px' }}>
                        {s.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="mobile-card-title-text">{s.name || 'Unknown Staff'}</div>
                        <div className="mobile-card-subtitle-text" style={{ marginTop: '2px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {s.staffId}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-info">
                      {s.salaryType === 'monthly' ? 'Monthly' : 'Daily'}
                    </span>
                  </div>

                  <div className="mobile-card-body">
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Rate</span>
                      <span className="mobile-card-value">
                        {rate}
                        {s.salaryType === 'daily' && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                            ({s.workingHours || 8} hrs/day req)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Attendance</span>
                      <span className="mobile-card-value">
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>{sal.presentDays} Present</span>
                        {sal.halfDays > 0 && (
                          <span style={{ fontSize: '11px', color: 'var(--warning)', marginLeft: '3px' }}>
                            (+{sal.halfDays} half)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Absent Days</span>
                      <span className="mobile-card-value" style={{ color: sal.absentDays > 0 ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>
                        {sal.absentDays} days
                      </span>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Hours Worked</span>
                      <span className="mobile-card-value">
                        {sal.totalWorked} hrs
                        {s.salaryType === 'daily' && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                            / {(sal.presentDays + sal.halfDays) * (sal.stdHours || s.workingHours || 8)} req
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Overtime Hours</span>
                      <span className="mobile-card-value">{sal.totalOT > 0 ? `+${sal.totalOT} hrs` : '-'}</span>
                    </div>

                    <div className="mobile-card-row" style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
                      <span className="mobile-card-label">{s.salaryType === 'daily' ? 'Earned (Base)' : 'Base Salary'}</span>
                      <span className="mobile-card-value">{fmtCurrency(sal.basicPay)}</span>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Overtime Pay</span>
                      <span className="mobile-card-value" style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {sal.otPay > 0 ? `+${fmtCurrency(sal.otPay)}` : '-'}
                      </span>
                    </div>

                    <div className="mobile-card-row" style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                      <span className="mobile-card-label" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                        Gross Salary
                      </span>
                      <span className="mobile-card-value" style={{ fontSize: '16px', color: 'var(--primary)', fontWeight: 800 }}>
                        {fmtCurrency(sal.grossSalary)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon" style={{ fontSize: '48px' }}>paid</span>
                <h3>No staff data available</h3>
                <p>Add employees to computed payroll sheets.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
