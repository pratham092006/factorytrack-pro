import React from 'react';

export default function Savings({
  staff,
  savings,
  onOpenSavingsModal,
  fmtCurrency,
  fmtDate,
  getSavingsBalance
}) {
  // Calculate deposits/withdrawals for each employee
  const getSavingsDetails = (staffId) => {
    const records = savings.filter(r => r.staffId === staffId);
    const deposits = records.filter(r => r.type === 'deposit').reduce((sum, r) => sum + r.amount, 0);
    const withdrawals = records.filter(r => r.type === 'withdraw').reduce((sum, r) => sum + r.amount, 0);
    const balance = deposits - withdrawals;
    return { deposits, withdrawals, balance };
  };

  // Sort savings history by date newest first
  const sortedSavings = [...savings].sort((a, b) => b.date.localeCompare(a.date));

  // Compute running balance at any point in time for a staff
  const getSavingsBalanceUpTo = (staffId, upToId) => {
    const records = savings.filter(s => s.staffId === staffId);
    let bal = 0;
    // Note: savings should be sorted ascending by date (or created_at) to calculate running balance correctly
    const ascendingRecords = [...records].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    for (const r of ascendingRecords) {
      bal += r.type === 'deposit' ? r.amount : -r.amount;
      if (r.id === upToId) return bal;
    }
    return bal;
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-title">Savings Management</div>
          <div className="page-header-subtitle">Manage worker cooperative savings deposits, contributions, and cash withdrawals</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-success" onClick={() => onOpenSavingsModal(null, 'deposit')}>
            <span className="material-symbols-outlined">savings</span>
            Deposit
          </button>
          <button className="btn btn-warning" onClick={() => onOpenSavingsModal(null, 'withdraw')}>
            <span className="material-symbols-outlined">payments</span>
            Withdraw
          </button>
        </div>
      </div>

      {/* Employee Savings Balance Grid */}
      <div className="grid-3">
        {staff.length > 0 ? (
          staff.map(s => {
            const { deposits, withdrawals, balance } = getSavingsDetails(s.id);
            return (
              <div key={s.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div className="user-avatar">
                      {s.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{s.name || 'Unknown Staff'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.staffId}</div>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', marginBottom: '8px' }}>
                    {fmtCurrency(balance)}
                  </div>
                  
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--success)' }}>arrow_downward</span>
                      Deposited: {fmtCurrency(deposits)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--danger)' }}>arrow_upward</span>
                      Withdrew: {fmtCurrency(withdrawals)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <button 
                      className="btn btn-sm btn-success" 
                      style={{ flex: 1 }}
                      onClick={() => onOpenSavingsModal(s, 'deposit')}
                    >
                      Deposit
                    </button>
                    <button 
                      className="btn btn-sm btn-warning" 
                      style={{ flex: 1 }}
                      onClick={() => onOpenSavingsModal(s, 'withdraw')}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-body">
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon" style={{ fontSize: '48px' }}>account_balance</span>
                <h3>No employees found</h3>
                <p>Register employees to track cooperative savings records.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Savings Ledger Logs */}
      <div className="card desktop-only" style={{ marginTop: '10px' }}>
        <div className="card-header">
          <div className="card-title">
            <span className="material-symbols-outlined">list_alt</span>
            Savings Transaction Ledger
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Transaction Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Running Balance</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sortedSavings.length > 0 ? (
                sortedSavings.map(r => {
                  const s = staff.find(x => x.id === r.staffId);
                  const balAfter = getSavingsBalanceUpTo(r.staffId, r.id);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                            {s?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <strong>{s?.name || 'Unknown Staff'}</strong>
                        </div>
                      </td>
                      <td>{fmtDate(r.date)}</td>
                      <td>
                        <span className={`badge ${r.type === 'deposit' ? 'badge-success' : 'badge-warning'}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            {r.type === 'deposit' ? 'savings' : 'output'}
                          </span>
                          {r.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: r.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>
                          {r.type === 'deposit' ? '+' : '-'}{fmtCurrency(r.amount)}
                        </strong>
                      </td>
                      <td><strong>{fmtCurrency(balAfter)}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.notes || '-'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <span className="material-symbols-outlined empty-icon" style={{ fontSize: '42px' }}>savings</span>
                      <h3>No savings transactions found</h3>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <div className="mobile-only" style={{ marginTop: '16px' }}>
        <div className="card-title" style={{ fontSize: '14px', marginBottom: '12px', paddingLeft: '4px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>list_alt</span>
          Savings Transaction Ledger
        </div>
        {sortedSavings.length > 0 ? (
          <div className="mobile-card-list">
            {sortedSavings.map(r => {
              const s = staff.find(x => x.id === r.staffId);
              const balAfter = getSavingsBalanceUpTo(r.staffId, r.id);
              
              return (
                <div key={r.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <div className="mobile-card-title">
                      <div className="user-avatar" style={{ width: '36px', height: '36px' }}>
                        {s?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="mobile-card-title-text">{s?.name || 'Unknown Staff'}</div>
                        <div className="mobile-card-subtitle-text" style={{ marginTop: '2px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {s?.staffId || ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-gray">
                      {fmtDate(r.date)}
                    </span>
                  </div>

                  <div className="mobile-card-body">
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Transaction Type</span>
                      <span className="mobile-card-value">
                        <span className={`badge ${r.type === 'deposit' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                            {r.type === 'deposit' ? 'savings' : 'output'}
                          </span>
                          {r.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                        </span>
                      </span>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Amount</span>
                      <span className="mobile-card-value" style={{ color: r.type === 'deposit' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                        {r.type === 'deposit' ? '+' : '-'}{fmtCurrency(r.amount)}
                      </span>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Notes</span>
                      <span className="mobile-card-value">{r.notes || '-'}</span>
                    </div>

                    <div className="mobile-card-row" style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
                      <span className="mobile-card-label" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        Running Balance
                      </span>
                      <span className="mobile-card-value" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '15px' }}>
                        {fmtCurrency(balAfter)}
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
                <span className="material-symbols-outlined empty-icon" style={{ fontSize: '42px' }}>savings</span>
                <h3>No savings transactions found</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
