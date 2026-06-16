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

      <div className="card">
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
                            {s.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.staffId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {s.salaryType === 'monthly' ? 'Monthly' : 'Daily'}
                        </span>
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
                      <td>{sal.totalWorked} hrs</td>
                      <td>
                        {sal.totalOT > 0 ? (
                          <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                            +{sal.totalOT} hrs
                          </span>
                        ) : '-'}
                      </td>
                      <td>{fmtCurrency(sal.baseSalary)}</td>
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
    </div>
  );
}
