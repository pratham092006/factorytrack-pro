import React from 'react';

export default function Advances({
  staff,
  advances,
  searchQuery,
  onGiveAdvance,
  onEditAdvance,
  onDeleteAdvance,
  fmtCurrency,
  fmtDate
}) {
  // Filter staff by search for the summary cards
  const summaryStaff = staff.filter(s => {
    const sName = s.name.toLowerCase();
    const q = searchQuery.toLowerCase();
    
    // Check if staff has advances
    const hasAdv = advances.some(a => a.staffId === s.id);
    return (hasAdv && !q) || (sName.includes(q) || s.staffId.toLowerCase().includes(q));
  }).slice(0, 6);

  // Filter advances list by search query
  let advancesList = [...advances].sort((a, b) => b.date.localeCompare(a.date));
  if (searchQuery) {
    const matchedStaffIds = staff
      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(s => s.id);
    advancesList = advancesList.filter(a => matchedStaffIds.includes(a.staffId));
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-title">Advance Management</div>
          <div className="page-header-subtitle">Track employee advances, deductions, and outstanding repayment balances</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => onGiveAdvance()}>
            <span className="material-symbols-outlined">payments</span>
            Give Advance
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid-3">
        {summaryStaff.length > 0 ? (
          summaryStaff.map(s => {
            const staffAdvances = advances.filter(a => a.staffId === s.id);
            const totalGiven = staffAdvances.reduce((sum, a) => sum + a.amount, 0);
            const totalRepaid = staffAdvances.reduce((sum, a) => sum + (a.repaid || 0), 0);
            const balance = totalGiven - totalRepaid;
            const pct = totalGiven > 0 ? Math.min(100, (totalRepaid / totalGiven) * 100) : 0;

            return (
              <div key={s.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div className="user-avatar">
                      {s.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{s.name || 'Unknown Staff'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.staffId}</div>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline btn-icon-only" 
                      onClick={() => onGiveAdvance(s)}
                      title="Give Advance to this staff"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span>Total: <strong>{fmtCurrency(totalGiven)}</strong></span>
                    <span>Repaid: <strong style={{ color: 'var(--success)' }}>{fmtCurrency(totalRepaid)}</strong></span>
                    <span>Balance: <strong style={{ color: 'var(--danger)' }}>{fmtCurrency(balance)}</strong></span>
                  </div>

                  <div className="progress-wrap">
                    <div className="progress-bar green" style={{ width: `${pct}%` }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>{pct.toFixed(0)}% Repaid</span>
                    <span>Balance Outstanding</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-body">
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon" style={{ fontSize: '48px' }}>account_balance_wallet</span>
                <h3>No active cash advances found</h3>
                <p>Use the "Give Advance" button to create an advance record.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Ledger Table */}
      <div className="card desktop-only" style={{ marginTop: '10px' }}>
        <div className="card-header">
          <div className="card-title">
            <span className="material-symbols-outlined">history</span>
            Advances History Ledger
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Date</th>
                <th>Advance Amount</th>
                <th>Reason</th>
                <th>Amount Repaid</th>
                <th>Outstanding Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {advancesList.length > 0 ? (
                advancesList.map(a => {
                  const s = staff.find(x => x.id === a.staffId);
                  const balance = a.amount - (a.repaid || 0);
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                            {s?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <strong>{s?.name || 'Unknown Staff'}</strong>
                        </div>
                      </td>
                      <td>{fmtDate(a.date)}</td>
                      <td><strong>{fmtCurrency(a.amount)}</strong></td>
                      <td>{a.reason || '-'}</td>
                      <td>
                        <span style={{ color: 'var(--success)', fontWeight: 500 }}>
                          {fmtCurrency(a.repaid || 0)}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: balance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                          {fmtCurrency(balance)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-sm btn-outline btn-icon-only"
                            onClick={() => onEditAdvance(a)}
                            title="Edit"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger btn-icon-only"
                            onClick={() => onDeleteAdvance(a.id)}
                            title="Delete"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <span className="material-symbols-outlined empty-icon" style={{ fontSize: '42px' }}>history</span>
                      <h3>No advance transactions found</h3>
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
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>history</span>
          Advances History Ledger
        </div>
        {advancesList.length > 0 ? (
          <div className="mobile-card-list">
            {advancesList.map(a => {
              const s = staff.find(x => x.id === a.staffId);
              const balance = a.amount - (a.repaid || 0);
              
              return (
                <div key={a.id} className="mobile-card">
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
                      {fmtDate(a.date)}
                    </span>
                  </div>

                  <div className="mobile-card-body">
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Advance Amount</span>
                      <span className="mobile-card-value" style={{ fontWeight: 700 }}>
                        {fmtCurrency(a.amount)}
                      </span>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Reason</span>
                      <span className="mobile-card-value">{a.reason || '-'}</span>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Amount Repaid</span>
                      <span className="mobile-card-value" style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {fmtCurrency(a.repaid || 0)}
                      </span>
                    </div>

                    <div className="mobile-card-row" style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
                      <span className="mobile-card-label" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        Outstanding Balance
                      </span>
                      <span className="mobile-card-value" style={{ color: balance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 800, fontSize: '15px' }}>
                        {fmtCurrency(balance)}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-card-footer">
                    <button 
                      className="btn btn-sm btn-outline btn-icon-only"
                      onClick={() => onEditAdvance(a)}
                      title="Edit"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      className="btn btn-sm btn-danger btn-icon-only"
                      onClick={() => onDeleteAdvance(a.id)}
                      title="Delete"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon" style={{ fontSize: '42px' }}>history</span>
                <h3>No advance transactions found</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
