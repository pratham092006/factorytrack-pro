import React, { useState } from 'react';

export default function Attendance({
  staff,
  attendance,
  searchQuery,
  onMarkAttendance,
  onDeleteAttendance,
  onBulkMarkPresent,
  fmtDate,
  today
}) {
  const [dateFilter, setDateFilter] = useState(today());
  const [tabFilter, setTabFilter] = useState('today'); // 'today', 'week', 'month'

  // Filter attendance records based on selected date & tabs
  let records = [...attendance];
  
  if (tabFilter === 'today') {
    records = records.filter(a => a.date === dateFilter);
  } else if (tabFilter === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);
    records = records.filter(a => a.date >= weekAgoStr);
  } else if (tabFilter === 'month') {
    const monthStr = dateFilter.slice(0, 7);
    records = records.filter(a => a.date.slice(0, 7) === monthStr);
  }

  // Filter by name search
  if (searchQuery) {
    const matchedStaffIds = staff
      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(s => s.id);
    records = records.filter(a => matchedStaffIds.includes(a.staffId));
  }

  // Sort by date newest first, then staff name
  records.sort((a, b) => b.date.localeCompare(a.date));

  // If looking at Today view, check for unmarked staff members
  let unmarkedStaff = [];
  if (tabFilter === 'today' && !searchQuery) {
    const markedStaffIds = records.map(r => r.staffId);
    unmarkedStaff = staff.filter(s => !markedStaffIds.includes(s.id));
  } else if (tabFilter === 'today' && searchQuery) {
    const markedStaffIds = records.map(r => r.staffId);
    unmarkedStaff = staff.filter(s => 
      !markedStaffIds.includes(s.id) && 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="page-container fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-title">Staff Attendance</div>
          <div className="page-header-subtitle">Update and monitor daily factory attendance and working shifts</div>
        </div>
        <div className="page-header-actions">
          <input 
            type="date" 
            className="form-control" 
            style={{ width: 'auto' }}
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          <button 
            className="btn btn-primary" 
            onClick={() => onBulkMarkPresent(dateFilter)}
          >
            <span className="material-symbols-outlined">done_all</span>
            Mark All Present
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Info */}
      <div className="filter-bar">
        <div className="toggle-pills">
          <button 
            className={`toggle-pill ${tabFilter === 'today' ? 'active' : ''}`}
            onClick={() => setTabFilter('today')}
          >
            Today
          </button>
          <button 
            className={`toggle-pill ${tabFilter === 'week' ? 'active' : ''}`}
            onClick={() => setTabFilter('week')}
          >
            This Week
          </button>
          <button 
            className={`toggle-pill ${tabFilter === 'month' ? 'active' : ''}`}
            onClick={() => setTabFilter('month')}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Attendance Sheet Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span className="material-symbols-outlined">assignment</span>
            Staff Attendance List
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Date</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Hours Worked</th>
                <th>Overtime</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Render Unmarked staff if in Today's view */}
              {tabFilter === 'today' && unmarkedStaff.map(s => (
                <tr key={`unmarked-${s.id}`} style={{ opacity: 0.85 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="user-avatar" style={{ background: 'var(--neutral)' }}>
                        {s.name[0].toUpperCase()}
                      </div>
                      <div>
                        <strong>{s.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.staffId}</div>
                      </div>
                    </div>
                  </td>
                  <td>{fmtDate(dateFilter)}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>
                    <span className="badge badge-gray">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                      Not Marked
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => onMarkAttendance(s.id)}
                    >
                      <span className="material-symbols-outlined">edit_square</span>
                      Mark
                    </button>
                  </td>
                </tr>
              ))}

              {/* Render Marked attendance records */}
              {records.length > 0 ? (
                records.map(a => {
                  const s = staff.find(x => x.id === a.staffId);
                  const statusBadge = {
                    present: 'badge-success', absent: 'badge-danger',
                    'half-day': 'badge-warning', leave: 'badge-info'
                  }[a.status] || 'badge-gray';
                  
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="user-avatar">
                            {s ? s.name[0].toUpperCase() : '?'}
                          </div>
                          <div>
                            <strong>{s ? s.name : 'Unknown Staff'}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s ? s.staffId : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>{fmtDate(a.date)}</td>
                      <td>{a.inTime || '-'}</td>
                      <td>{a.outTime || '-'}</td>
                      <td>{a.workedHours ? `${a.workedHours} hrs` : '-'}</td>
                      <td>
                        {a.overtimeHours ? (
                          <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                            +{a.overtimeHours} hrs
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <span className={`badge ${statusBadge}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            {a.status === 'present' ? 'check_circle' : a.status === 'absent' ? 'cancel' : 'warning'}
                          </span>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-sm btn-outline btn-icon-only"
                            onClick={() => onMarkAttendance(a.staffId, a.id)}
                            title="Edit Record"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger btn-icon-only"
                            onClick={() => onDeleteAttendance(a.id)}
                            title="Delete Record"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                tabFilter !== 'today' && (
                  <tr>
                    <td colSpan="8">
                      <div className="empty-state">
                        <span className="material-symbols-outlined empty-icon" style={{ fontSize: '48px' }}>assignment_turned_in</span>
                        <h3>No attendance records found</h3>
                        <p>Attendance will appear here once marked for this selection.</p>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {/* Catch-all empty state if nothing unmarked and nothing marked */}
              {tabFilter === 'today' && unmarkedStaff.length === 0 && records.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <span className="material-symbols-outlined empty-icon" style={{ fontSize: '48px' }}>check_circle</span>
                      <h3>All staff accounted for</h3>
                      <p>No unmarked staff members found for {fmtDate(dateFilter)}.</p>
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
