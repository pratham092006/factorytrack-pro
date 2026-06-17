import React, { useState } from 'react';

export default function Staff({ 
  staff, 
  searchQuery, 
  onAddStaff, 
  onEditStaff, 
  onDeleteStaff, 
  onViewProfile,
  fmtCurrency,
  fmtDate
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter staff by search query
  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mobile.includes(searchQuery)
  );

  // Pagination math
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-title">Staff Directory</div>
          <div className="page-header-subtitle">Manage, view, and update all registered factory employees</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={onAddStaff}>
            <span className="material-symbols-outlined">person_add</span>
            Add Staff Member
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Employee details</th>
                <th>Mobile</th>
                <th>Joining Date</th>
                <th>Salary Type</th>
                <th>Salary Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStaff.length > 0 ? (
                paginatedStaff.map(s => {
                  const rate = s.salaryType === 'monthly' 
                    ? `${fmtCurrency(s.monthlySalary)}/mo` 
                    : `${fmtCurrency(s.dailyWage)}/day`;
                  return (
                    <tr key={s.id}>
                      <td>
                        <span className="badge badge-primary">
                          {s.staffId}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="user-avatar">
                            {s.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.name || 'Unknown Staff'}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.mobile}</div>
                          </div>
                        </div>
                      </td>
                      <td>{s.mobile}</td>
                      <td>{fmtDate(s.joiningDate)}</td>
                      <td>
                        <span className="badge badge-info">
                          {s.salaryType === 'monthly' ? 'Monthly' : 'Daily Wage'}
                        </span>
                      </td>
                      <td><strong>{rate}</strong></td>
                      <td>
                        <span className="badge badge-success">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                          Active
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-sm btn-outline btn-icon-only" 
                            onClick={() => onViewProfile(s)} 
                            title="View Profile"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline btn-icon-only" 
                            onClick={() => onEditStaff(s)} 
                            title="Edit"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger btn-icon-only" 
                            onClick={() => onDeleteStaff(s.id)} 
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
                  <td colSpan="8">
                    <div className="empty-state">
                      <span className="material-symbols-outlined empty-icon" style={{ fontSize: '48px' }}>group</span>
                      <h3>No staff records found</h3>
                      <p>Try searching for a different name, or add a new staff member to start.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStaff.length)} of {filteredStaff.length} employees
            </div>
            <div className="pagination-buttons">
              <button 
                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={handlePrevPage}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}

              <button 
                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={handleNextPage}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
