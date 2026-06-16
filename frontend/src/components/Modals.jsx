import React, { useState, useEffect } from 'react';

// Common Modal Wrapper
function ModalWrapper({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop open" onClick={(e) => e.target.className.includes('modal-backdrop') && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ==========================================
   1. STAFF MODAL (ADD / EDIT)
   ========================================== */
export function StaffModal({ isOpen, onClose, staffMember, onSave }) {
  const [staffId, setStaffId] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [salaryType, setSalaryType] = useState('monthly');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [monthlyHours, setMonthlyHours] = useState(8);
  const [dailyWage, setDailyWage] = useState('');
  const [dailyHours, setDailyHours] = useState(8);

  useEffect(() => {
    if (staffMember) {
      setStaffId(staffMember.staffId || '');
      setName(staffMember.name || '');
      setMobile(staffMember.mobile || '');
      setJoiningDate(staffMember.joiningDate || new Date().toISOString().slice(0, 10));
      setSalaryType(staffMember.salaryType || 'monthly');
      setMonthlySalary(staffMember.monthlySalary || '');
      setMonthlyHours(staffMember.monthlyHours || 8);
      setDailyWage(staffMember.dailyWage || '');
      setDailyHours(staffMember.dailyHours || 8);
    } else {
      setStaffId('');
      setName('');
      setMobile('');
      setJoiningDate(new Date().toISOString().slice(0, 10));
      setSalaryType('monthly');
      setMonthlySalary('');
      setMonthlyHours(8);
      setDailyWage('');
      setDailyHours(8);
    }
  }, [staffMember, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staffId || !name || !mobile || !joiningDate) {
      alert('Please fill all required fields');
      return;
    }

    const record = {
      ...(staffMember?.id && { id: staffMember.id }),
      staffId,
      name,
      mobile,
      joiningDate,
      salaryType,
      monthlySalary: salaryType === 'monthly' ? Number(monthlySalary) : 0,
      monthlyHours: salaryType === 'monthly' ? Number(monthlyHours) : 0,
      dailyWage: salaryType === 'daily' ? Number(dailyWage) : 0,
      dailyHours: salaryType === 'daily' ? Number(dailyHours) : 0,
      status: staffMember?.status || 'active'
    };

    if (salaryType === 'monthly' && !record.monthlySalary) {
      alert('Please enter a monthly salary');
      return;
    }
    if (salaryType === 'daily' && !record.dailyWage) {
      alert('Please enter a daily wage');
      return;
    }

    onSave(record);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={staffMember ? "Edit Staff Member" : "Add New Staff"}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Staff ID *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. STF-001"
                value={staffId}
                onChange={e => setStaffId(e.target.value)}
                disabled={!!staffMember}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. John Smith"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="e.g. 9876543210"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Joining Date *</label>
              <input 
                type="date" 
                className="form-control" 
                value={joiningDate}
                onChange={e => setJoiningDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Salary Type *</label>
              <select 
                className="form-control" 
                value={salaryType}
                onChange={e => setSalaryType(e.target.value)}
              >
                <option value="monthly">Monthly Salary</option>
                <option value="daily">Daily Wage</option>
              </select>
            </div>
            <div className="form-group">
              {salaryType === 'monthly' ? (
                <>
                  <label className="form-label">Monthly Salary (₹) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g. 25000"
                    value={monthlySalary}
                    onChange={e => setMonthlySalary(e.target.value)}
                    required
                  />
                </>
              ) : (
                <>
                  <label className="form-label">Daily Wage (₹) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g. 600"
                    value={dailyWage}
                    onChange={e => setDailyWage(e.target.value)}
                    required
                  />
                </>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Standard Daily Hours</label>
              <input 
                type="number" 
                className="form-control" 
                value={salaryType === 'monthly' ? monthlyHours : dailyHours}
                onChange={e => salaryType === 'monthly' ? setMonthlyHours(e.target.value) : setDailyHours(e.target.value)}
              />
            </div>
            <div className="form-group">
              {/* Empty group for 2-column layout alignment */}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            <span className="material-symbols-outlined">save</span>
            Save Staff
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

/* ==========================================
   2. ATTENDANCE MODAL
   ========================================== */
export function AttendanceModal({ isOpen, onClose, staff, record, onSave }) {
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('present');
  const [inTime, setInTime] = useState('09:00');
  const [outTime, setOutTime] = useState('17:00');

  useEffect(() => {
    if (record) {
      setStaffId(record.staffId || '');
      setDate(record.date || new Date().toISOString().slice(0, 10));
      setStatus(record.status || 'present');
      setInTime(record.inTime || '09:00');
      setOutTime(record.outTime || '17:00');
    } else {
      setStaffId('');
      setDate(new Date().toISOString().slice(0, 10));
      setStatus('present');
      setInTime('09:00');
      setOutTime('17:00');
    }
  }, [record, isOpen]);

  const calcHours = (inT, outT) => {
    if (!inT || !outT) return 0;
    const [ih, im] = inT.split(':').map(Number);
    const [oh, om] = outT.split(':').map(Number);
    const total = (oh * 60 + om) - (ih * 60 + im);
    return total <= 0 ? 0 : Number((total / 60).toFixed(2));
  };

  const getStdHours = (s) => {
    if (!s) return 8;
    return s.salaryType === 'monthly' ? (s.monthlyHours || 8) : (s.dailyHours || 8);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staffId || !date) {
      alert('Please fill all required fields');
      return;
    }

    const s = staff.find(x => x.id === staffId);
    const worked = (status === 'present' || status === 'half-day') ? calcHours(inTime, outTime) : 0;
    const std = getStdHours(s);
    const ot = (status === 'present' || status === 'half-day') && worked > std ? Number((worked - std).toFixed(2)) : 0;

    const data = {
      staffId,
      date,
      status,
      inTime: (status === 'present' || status === 'half-day') ? inTime : '',
      outTime: (status === 'present' || status === 'half-day') ? outTime : '',
      workedHours: worked,
      overtimeHours: ot
    };

    onSave(record?.id, data);
  };

  const selectedStaffObj = staff.find(x => x.id === staffId) || record?.staff;
  const staffName = selectedStaffObj ? selectedStaffObj.name : 'Unknown Staff';

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Mark Attendance">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Staff Member</label>
            {record ? (
              <input type="text" className="form-control" value={staffName} disabled />
            ) : (
              <select 
                className="form-control" 
                value={staffId} 
                onChange={e => setStaffId(e.target.value)}
                required
              >
                <option value="">Select Staff...</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.staffId})</option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input 
              type="date" 
              className="form-control" 
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select 
                className="form-control" 
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half-day">Half Day</option>
                <option value="leave">Leave</option>
              </select>
            </div>
            
            {(status === 'present' || status === 'half-day') && (
              <div className="form-group">
                <label className="form-label">In Time</label>
                <input 
                  type="time" 
                  className="form-control" 
                  value={inTime}
                  onChange={e => setInTime(e.target.value)}
                />
              </div>
            )}
          </div>

          {(status === 'present' || status === 'half-day') && (
            <div className="form-group">
              <label className="form-label">Out Time</label>
              <input 
                type="time" 
                className="form-control" 
                value={outTime}
                onChange={e => setOutTime(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            <span className="material-symbols-outlined">check_circle</span>
            Save Attendance
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

/* ==========================================
   3. ADVANCE MODAL
   ========================================== */
export function AdvanceModal({ isOpen, onClose, staff, record, defaultStaffId, onSave }) {
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [repaid, setRepaid] = useState(0);

  useEffect(() => {
    if (record) {
      setStaffId(record.staffId || '');
      setDate(record.date || new Date().toISOString().slice(0, 10));
      setAmount(record.amount || '');
      setReason(record.reason || '');
      setRepaid(record.repaid || 0);
    } else {
      setStaffId(defaultStaffId || '');
      setDate(new Date().toISOString().slice(0, 10));
      setAmount('');
      setReason('');
      setRepaid(0);
    }
  }, [record, defaultStaffId, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staffId || !date || !amount) {
      alert('Please fill all fields');
      return;
    }
    onSave(record?.id, {
      staffId,
      date,
      amount: Number(amount),
      reason,
      repaid: Number(repaid)
    });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={record ? "Edit Advance" : "Give Advance"}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Staff Member *</label>
            <select 
              className="form-control" 
              value={staffId} 
              onChange={e => setStaffId(e.target.value)}
              disabled={!!record}
              required
            >
              <option value="">Select Staff...</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.staffId})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Advance Date *</label>
              <input 
                type="date" 
                className="form-control" 
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 5000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Medical emergency, personal need..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Amount Repaid (₹)</label>
            <input 
              type="number" 
              className="form-control" 
              value={repaid}
              onChange={e => setRepaid(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            <span className="material-symbols-outlined">payments</span>
            Save Advance
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

/* ==========================================
   4. SAVINGS MODAL
   ========================================== */
export function SavingsModal({ isOpen, onClose, staff, type, defaultStaffId, onSave, getBalance }) {
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setStaffId(defaultStaffId || '');
    setDate(new Date().toISOString().slice(0, 10));
    setAmount('');
    setNotes('');
  }, [defaultStaffId, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staffId || !date || !amount) {
      alert('Please fill required fields');
      return;
    }

    if (type === 'withdraw') {
      const bal = getBalance(staffId);
      if (Number(amount) > bal) {
        alert(`Insufficient savings balance. Current balance is ₹${bal.toLocaleString('en-IN')}`);
        return;
      }
    }

    onSave(staffId, {
      type,
      date,
      amount: Number(amount),
      notes
    });
  };

  return (
    <ModalWrapper 
      isOpen={isOpen} 
      onClose={onClose} 
      title={type === 'deposit' ? "Deposit Savings" : "Withdraw Savings"}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Staff Member *</label>
            <select 
              className="form-control" 
              value={staffId} 
              onChange={e => setStaffId(e.target.value)}
              required
            >
              <option value="">Select Staff...</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.staffId})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input 
                type="date" 
                className="form-control" 
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 2000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Monthly contribution..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className={type === 'deposit' ? "btn btn-success" : "btn btn-warning"}>
            <span className="material-symbols-outlined">
              {type === 'deposit' ? 'savings' : 'output'}
            </span>
            Save Transactions
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

/* ==========================================
   5. PAYMENT MODAL
   ========================================== */
export function PaymentModal({ isOpen, onClose, staffMember, monthKey, monthLabel, metrics, onSave }) {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
    setAmount(metrics ? Math.max(0, Math.round(metrics.remainingPayable)).toString() : '');
    setNotes('');
  }, [staffMember, metrics, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) {
      alert('Please enter payment amount');
      return;
    }
    onSave(staffMember.id, {
      month: monthKey,
      amount: Number(amount),
      date,
      notes
    });
  };

  if (!staffMember || !metrics) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Process Salary Payment">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div style={{ background: 'var(--neutral-light)', borderRadius: '12px', padding: '16px', marginBottom: '18px', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>account_box</span>
              {staffMember.name} — {monthLabel}
            </div>
            <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px' }}>
              <span>Gross Salary</span>
              <strong>₹{metrics.grossSalary.toLocaleString('en-IN')}</strong>
            </div>
            <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px' }}>
              <span>Advance Deductions</span>
              <strong style={{ color: 'var(--danger)' }}>-₹{metrics.advances.toLocaleString('en-IN')}</strong>
            </div>
            <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px' }}>
              <span>Savings Balance</span>
              <strong style={{ color: 'var(--success)' }}>+₹{metrics.savings.toLocaleString('en-IN')}</strong>
            </div>
            <div className="payment-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px' }}>
              <span>Already Paid</span>
              <strong style={{ color: 'var(--text-muted)' }}>-₹{metrics.paid.toLocaleString('en-IN')}</strong>
            </div>
            <div className="payment-row total" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: '8px', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '15px' }}>
              <span>Remaining Payable</span>
              <span style={{ color: 'var(--primary)' }}>₹{Math.max(0, Math.round(metrics.remainingPayable)).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Payment Date *</label>
              <input 
                type="date" 
                className="form-control" 
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount Paid (₹) *</label>
              <input 
                type="number" 
                className="form-control" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Notes</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Bank transfer, Cash, Cheque..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-success">
            <span className="material-symbols-outlined">done_all</span>
            Mark as Paid
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

/* ==========================================
   6. STAFF PROFILE MODAL
   ========================================== */
export function ProfileModal({ isOpen, onClose, staffMember, attendance, advances, savings, payments, onNavigate }) {
  if (!isOpen || !staffMember) return null;

  // Filter records specifically for this employee
  const staffAdvances = advances.filter(a => a.staffId === staffMember.id);
  const staffSavings = savings.filter(s => s.staffId === staffMember.id);
  const staffPayments = payments.filter(p => p.staffId === staffMember.id);
  const staffAttendance = attendance.filter(a => a.staffId === staffMember.id);

  const totalAdv = staffAdvances.reduce((sum, a) => sum + a.amount, 0);
  const totalRepaid = staffAdvances.reduce((sum, a) => sum + (a.repaid || 0), 0);
  const totalSav = staffSavings.filter(s => s.type === 'deposit').reduce((sum, a) => sum + a.amount, 0) -
                   staffSavings.filter(s => s.type === 'withdraw').reduce((sum, a) => sum + a.amount, 0);
  const totalPaid = staffPayments.reduce((sum, p) => sum + p.amount, 0);

  const presentDays = staffAttendance.filter(a => a.status === 'present').length;
  const absentDays = staffAttendance.filter(a => a.status === 'absent').length;
  const halfDays = staffAttendance.filter(a => a.status === 'half-day' || a.status === 'halfday').length;
  const leaveDays = staffAttendance.filter(a => a.status === 'leave').length;
  const totalDaysMarked = staffAttendance.length;
  const attendanceRate = totalDaysMarked > 0 ? Math.round((presentDays / totalDaysMarked) * 100) : 0;

  const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fmtDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Employee Profile Details">
      <div className="modal-body" style={{ padding: '24px 28px' }}>
        {/* Profile Card Header (Matching Caleb White Student Details Header) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '24px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}>
            {staffMember.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.4px' }}>{staffMember.name || 'Unknown Staff'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px', marginTop: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: 700 }}>Staff ID</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{staffMember.staffId}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: 700 }}>Mobile Number</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{staffMember.mobile || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: 700 }}>Joining Date</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{fmtDate(staffMember.joiningDate)}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: 700 }}>Salary Rate</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {staffMember.salaryType === 'monthly' 
                    ? `${fmtCurrency(staffMember.monthlySalary)}/mo` 
                    : `${fmtCurrency(staffMember.dailyWage)}/day`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row of Mini Stat Cards (Matching Oakridge reference image) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {/* Total Attendance Card (Blue) */}
          <div style={{ padding: '16px', background: 'hsl(214, 100%, 97%)', borderRadius: '16px', border: '1px solid hsl(214, 100%, 93%)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'hsl(214, 100%, 92%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(214, 100%, 45%)', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'hsl(214, 100%, 35%)', lineHeight: '1.2' }}>{presentDays} Days</div>
              <div style={{ fontSize: '10px', color: 'hsl(214, 100%, 40%)', fontWeight: 600, marginTop: '2px' }}>Total Attendance</div>
            </div>
          </div>

          {/* Late Attendance Card (Green) */}
          <div style={{ padding: '16px', background: 'hsl(142, 72%, 97%)', borderRadius: '16px', border: '1px solid hsl(142, 72%, 93%)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'hsl(142, 72%, 92%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(142, 72%, 35%)', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>history</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'hsl(142, 72%, 30%)', lineHeight: '1.2' }}>{halfDays} Days</div>
              <div style={{ fontSize: '10px', color: 'hsl(142, 72%, 35%)', fontWeight: 600, marginTop: '2px' }}>Late Attendance</div>
            </div>
          </div>

          {/* Undertime Attendance Card (Orange) */}
          <div style={{ padding: '16px', background: 'hsl(38, 92%, 97%)', borderRadius: '16px', border: '1px solid hsl(38, 92%, 93%)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'hsl(38, 92%, 92%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(38, 92%, 40%)', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>schedule</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'hsl(38, 92%, 35%)', lineHeight: '1.2' }}>{leaveDays} Days</div>
              <div style={{ fontSize: '10px', color: 'hsl(38, 92%, 40%)', fontWeight: 600, marginTop: '2px' }}>Undertime Attendance</div>
            </div>
          </div>

          {/* Absent Card (Red) */}
          <div style={{ padding: '16px', background: 'hsl(350, 89%, 97%)', borderRadius: '16px', border: '1px solid hsl(350, 89%, 93%)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'hsl(350, 89%, 92%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(350, 89%, 48%)', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>cancel</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'hsl(350, 89%, 40%)', lineHeight: '1.2' }}>{absentDays} Days</div>
              <div style={{ fontSize: '10px', color: 'hsl(350, 89%, 45%)', fontWeight: 600, marginTop: '2px' }}>Total Absent</div>
            </div>
          </div>
        </div>

        {/* Dual Column Layout: Left Column (Class Days & Attendance Rate) + Right Column (Summary Vertical Pills) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          {/* Left Column: Class Days & Attendance Rate & Trend Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Class Days</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Class days for Monthly</div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{totalDaysMarked} Days</div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Attendance Rate</div>
                  <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, display: 'inline-block', marginTop: '4px' }}>This Year</div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{attendanceRate}%</div>
              </div>

              {/* Monthly Trend Graphic (SVG Curve representing trend) */}
              <div style={{ height: '70px', marginTop: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>January</span>
                  <span>February</span>
                  <span>March</span>
                </div>
                <div style={{ position: 'relative', height: '40px', width: '100%' }}>
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <path d="M 0 32 Q 25 15 50 25 T 100 10" fill="none" stroke="var(--primary)" strokeWidth="2.5" />
                    <path d="M 0 32 Q 25 15 50 25 T 100 10 L 100 40 L 0 40 Z" fill="url(#chartGrad)" />
                    <circle cx="0" cy="32" r="3" fill="var(--primary)" />
                    <circle cx="50" cy="25" r="3" fill="var(--primary)" />
                    <circle cx="100" cy="10" r="3" fill="var(--primary)" />
                  </svg>
                  {/* Floating percentages like in the reference image */}
                  <div style={{ position: 'absolute', left: '0%', bottom: '26px', transform: 'translateX(-50%)', background: '#3B82F6', color: '#FFFFFF', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: 700 }}>57%</div>
                  <div style={{ position: 'absolute', left: '50%', bottom: '32px', transform: 'translateX(-50%)', background: '#F59E0B', color: '#FFFFFF', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: 700 }}>55%</div>
                  <div style={{ position: 'absolute', left: '100%', bottom: '38px', transform: 'translateX(-100%)', background: '#10B981', color: '#FFFFFF', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: 700 }}>{attendanceRate}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary - Employee Name (Oakridge Vertical Pills) */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Summary - {(staffMember.name || 'Unknown').split(' ')[0]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', height: '170px', alignItems: 'end' }}>
              
              {/* Attendance vertical pill (Blue) */}
              <div className="vertical-pill blue">
                <div className="vertical-pill-value">{presentDays}</div>
                <div className="vertical-pill-bar" style={{ height: `${Math.min(100, Math.max(25, (presentDays / (totalDaysMarked || 1)) * 100))}%` }}>
                  <span className="material-symbols-outlined vertical-pill-icon">person</span>
                  <div className="vertical-pill-label">Att</div>
                </div>
              </div>

              {/* Late vertical pill (Green) */}
              <div className="vertical-pill green">
                <div className="vertical-pill-value">{halfDays}</div>
                <div className="vertical-pill-bar" style={{ height: `${Math.min(100, Math.max(25, (halfDays / (totalDaysMarked || 1)) * 100))}%` }}>
                  <span className="material-symbols-outlined vertical-pill-icon">history</span>
                  <div className="vertical-pill-label">Late</div>
                </div>
              </div>

              {/* Undertime vertical pill (Orange) */}
              <div className="vertical-pill orange">
                <div className="vertical-pill-value">{leaveDays}</div>
                <div className="vertical-pill-bar" style={{ height: `${Math.min(100, Math.max(25, (leaveDays / (totalDaysMarked || 1)) * 100))}%` }}>
                  <span className="material-symbols-outlined vertical-pill-icon">schedule</span>
                  <div className="vertical-pill-label">Under</div>
                </div>
              </div>

              {/* Absent vertical pill (Red) */}
              <div className="vertical-pill red">
                <div className="vertical-pill-value">{absentDays}</div>
                <div className="vertical-pill-bar" style={{ height: `${Math.min(100, Math.max(25, (absentDays / (totalDaysMarked || 1)) * 100))}%` }}>
                  <span className="material-symbols-outlined vertical-pill-icon">cancel</span>
                  <div className="vertical-pill-label">Abs</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Financial Summary Card Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px', background: 'var(--bg-input)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Advances Given</span>
            <strong style={{ color: 'var(--text-primary)' }}>{fmtCurrency(totalAdv)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Advance Balance</span>
            <strong style={{ color: totalAdv - totalRepaid > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{fmtCurrency(totalAdv - totalRepaid)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Savings Balance</span>
            <strong style={{ color: 'var(--success)' }}>{fmtCurrency(totalSav)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Salary Paid</span>
            <strong style={{ color: 'var(--text-primary)' }}>{fmtCurrency(totalPaid)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-sm btn-outline" 
            onClick={() => { onClose(); onNavigate('attendance'); }}
          >
            <span className="material-symbols-outlined">fact_check</span>
            Attendance
          </button>
          <button 
            className="btn btn-sm btn-outline" 
            onClick={() => { onClose(); onNavigate('advances', staffMember.id); }}
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Give Advance
          </button>
          <button 
            className="btn btn-sm btn-outline" 
            onClick={() => { onClose(); onNavigate('savings', staffMember.id); }}
          >
            <span className="material-symbols-outlined">savings</span>
            Savings Ledger
          </button>
          <button className="btn btn-sm btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </ModalWrapper>
  );
}
