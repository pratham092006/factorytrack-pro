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
      setName(staffMember.name || '');
      setMobile(staffMember.mobile || '');
      setJoiningDate(staffMember.joiningDate || new Date().toISOString().slice(0, 10));
      setSalaryType(staffMember.salaryType || 'monthly');
      setMonthlySalary(staffMember.monthlySalary || '');
      setMonthlyHours(staffMember.monthlyHours || 8);
      setDailyWage(staffMember.dailyWage || '');
      setDailyHours(staffMember.dailyHours || 8);
    } else {
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
    if (!name || !mobile || !joiningDate) {
      alert('Please fill all required fields');
      return;
    }

    const record = {
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

    onSave(staffMember?.id, record);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={staffMember ? "Edit Staff Member" : "Add New Staff"}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-row">
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
          </div>
          
          <div className="form-row">
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
          </div>

          {salaryType === 'monthly' ? (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Monthly Salary (₹) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 25000"
                  value={monthlySalary}
                  onChange={e => setMonthlySalary(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label class="form-label">Standard Daily Hours</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={monthlyHours}
                  onChange={e => setMonthlyHours(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Daily Wage (₹) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 600"
                  value={dailyWage}
                  onChange={e => setDailyWage(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Standard Daily Hours</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={dailyHours}
                  onChange={e => setDailyHours(e.target.value)}
                />
              </div>
            </div>
          )}
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

  const totalAdv = advances.reduce((sum, a) => sum + a.amount, 0);
  const totalRepaid = advances.reduce((sum, a) => sum + (a.repaid || 0), 0);
  const totalSav = savings.filter(s => s.type === 'deposit').reduce((sum, a) => sum + a.amount, 0) -
                   savings.filter(s => s.type === 'withdraw').reduce((sum, a) => sum + a.amount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;

  const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fmtDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Staff Profile Details">
      <div className="profile-modal-banner">
        <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '22px' }}>
          {staffMember.name[0].toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{staffMember.name}</h2>
          <div style={{ opacity: 0.8, fontSize: '13px' }}>{staffMember.staffId} · {staffMember.mobile}</div>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white', marginTop: '6px', fontSize: '10px' }}>
            {staffMember.salaryType === 'monthly' ? 'Monthly Payroll' : 'Daily Wages'}
          </span>
        </div>
      </div>

      <div className="modal-body">
        <div className="grid-2" style={{ gap: '14px', marginBottom: '16px' }}>
          <div className="info-item" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">Joining Date</label>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{fmtDate(staffMember.joiningDate)}</span>
          </div>
          <div className="info-item" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">Salary Rate</label>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {staffMember.salaryType === 'monthly' 
                ? `${fmtCurrency(staffMember.monthlySalary)}/month` 
                : `${fmtCurrency(staffMember.dailyWage)}/day`}
            </span>
          </div>
          <div className="info-item" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">Present Days</label>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>{presentDays} days</span>
          </div>
          <div className="info-item" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">Absent Days</label>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger)' }}>{absentDays} days</span>
          </div>
          <div className="info-item" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">Total Advances</label>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--warning)' }}>{fmtCurrency(totalAdv)}</span>
          </div>
          <div className="info-item" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">Advance Balance</label>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger)' }}>{fmtCurrency(totalAdv - totalRepaid)}</span>
          </div>
          <div className="info-item" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">Savings Balance</label>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>{fmtCurrency(totalSav)}</span>
          </div>
          <div className="info-item" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">Total Salary Paid</label>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{fmtCurrency(totalPaid)}</span>
          </div>
        </div>
        
        <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-sm btn-primary" 
            onClick={() => { onClose(); onNavigate('attendance'); }}
          >
            <span className="material-symbols-outlined">fact_check</span>
            View Attendance
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
            Deposit/Withdraw Savings
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
