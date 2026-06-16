import React, { useState } from 'react';

export default function Payments({
  staff,
  payments,
  searchQuery,
  onProcessPayment,
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

  const getTotalPaid = (staffId, mk) =>
    payments
      .filter(p => p.staffId === staffId && p.month === mk)
      .reduce((sum, p) => sum + p.amount, 0);

  const filteredStaff = staff.filter(s =>
    !searchQuery ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.staffId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-title">Payroll & Payments</div>
          <div className="page-header-subtitle">Process and track monthly salary payments for all staff members</div>
        </div>
        <div className="page-header-actions">
          <select
            className="form-control"
            style={{ width: 'auto', paddingRight: '36px' }}
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {monthKeys.map(k => (
              <option key={k} value={k}>{monthLabel(k)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-2">
        {filteredStaff.length > 0 ? (
          filteredStaff.map(s => {
            const sal = calcStaffSalary(s.id, selectedMonth);
            const gross = sal ? sal.grossSalary : 0;
            const advBal = getAdvanceBalance(s.id);
            const savBal = getSavingsBalance(s.id);
            const paid = getTotalPaid(s.id, selectedMonth);
            const finalPayable = gross - advBal + savBal;
            const remaining = finalPayable - paid;
            const pct = finalPayable > 0 ? Math.min(100, (paid / finalPayable) * 100) : 0;
            const isPaid = remaining <= 0;

            return (
              <div key={s.id} className="card">
                {/* Card Header */}
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="user-avatar">{s.name?.[0]?.toUpperCase() || '?'}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.name || 'Unknown Staff'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {s.staffId} · {s.salaryType === 'monthly' ? 'Monthly' : 'Daily Wage'}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      {isPaid ? 'done_all' : 'schedule'}
                    </span>
                    {isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>

                <div className="card-body">
                  {/* Payment Breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Present Days</span>
                      <span>{sal ? sal.presentDays : 0} days</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Hours Worked</span>
                      <span>{sal ? sal.totalWorked : 0} hrs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Overtime Hours</span>
                      <span style={{ color: 'var(--warning)', fontWeight: 500 }}>
                        {sal && sal.totalOT > 0 ? `+${sal.totalOT} hrs` : '-'}
                      </span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Gross Salary</span>
                      <strong>{fmtCurrency(gross)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Advance Deductions</span>
                      <strong style={{ color: 'var(--danger)' }}>-{fmtCurrency(advBal)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Savings Added</span>
                      <strong style={{ color: 'var(--success)' }}>+{fmtCurrency(savBal)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                      <span>Final Payable</span>
                      <span style={{ color: 'var(--primary)' }}>{fmtCurrency(finalPayable)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Paid: {fmtCurrency(paid)}</span>
                      <span style={{ fontWeight: 600, color: remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        Remaining: {fmtCurrency(Math.max(0, remaining))}
                      </span>
                    </div>
                    <div className="progress-wrap">
                      <div className="progress-bar green" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`btn ${isPaid ? 'btn-outline' : 'btn-primary'}`}
                    style={{ width: '100%' }}
                    onClick={() => onProcessPayment(s, selectedMonth, {
                      grossSalary: gross,
                      advances: advBal,
                      savings: savBal,
                      paid,
                      remainingPayable: remaining
                    })}
                  >
                    <span className="material-symbols-outlined">
                      {isPaid ? 'receipt_long' : 'paid'}
                    </span>
                    {isPaid ? 'View Payment History' : 'Process Payment'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-body">
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon" style={{ fontSize: '48px' }}>payments</span>
                <h3>No staff found</h3>
                <p>Add staff members to manage payroll and payments.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
