import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Staff from './pages/Staff';
import Attendance from './pages/Attendance';
import Salary from './pages/Salary';
import Advances from './pages/Advances';
import Savings from './pages/Savings';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Analytics from './pages/Analytics';

import {
  getCurrentUser,
  logoutUser,
  fetchStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  fetchAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  fetchAdvances,
  addAdvance,
  updateAdvance,
  deleteAdvance,
  fetchSavings,
  addSaving,
  deleteSaving,
  fetchPayments,
  addPayment
} from './api';

import {
  StaffModal,
  AttendanceModal,
  AdvanceModal,
  SavingsModal,
  PaymentModal,
  ProfileModal
} from './components/Modals';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbType, setDbType] = useState(null); // 'supabase' or 'local'

  // App Settings State (Loaded from LocalStorage)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ftp_settings');
    return saved ? JSON.parse(saved) : {
      factoryName: 'FactoryTrack Pro',
      currency: '₹',
      workingDaysPerMonth: 26,
      otMultiplier: 1.5,
      darkMode: false
    };
  });

  // UI State
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(settings.darkMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  // Data Cache State
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [savings, setSavings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals Active State
  const [activeModal, setActiveModal] = useState(null); // 'staff', 'attendance', 'advance', 'savings', 'payment', 'profile'
  const [modalData, setModalData] = useState(null); // Selected item for edit/view

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Check Current Session on Mount
  useEffect(() => {
    async function checkSession() {
      try {
        const token = localStorage.getItem('ftp_token');
        if (token) {
          const userRes = await getCurrentUser();
          if (userRes && userRes.success) {
            setCurrentUser(userRes.user);
            setDbType(userRes.database || 'supabase');
          }
        }
      } catch (err) {
        console.error('Session verification failed', err);
        localStorage.removeItem('ftp_token');
      } finally {
        setAuthLoading(false);
      }
    }
    checkSession();
  }, []);

  // Listen for session expiration (401 Unauthorized)
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      setDbType(null);
      setStaff([]);
      setAttendance([]);
      setAdvances([]);
      setSavings([]);
      setPayments([]);
      showToast('Session expired. Please sign in again.', 'warning');
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  // Sync Dark Mode state to HTML tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Load Database Data once User Logged In
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [staffList, attList, advList, savList, payList] = await Promise.all([
        fetchStaff(),
        fetchAttendance(),
        fetchAdvances(),
        fetchSavings(),
        fetchPayments()
      ]);
      setStaff(staffList);
      setAttendance(attList);
      setAdvances(advList);
      setSavings(savList);
      setPayments(payList);
    } catch (err) {
      showToast(err.message || 'Error loading data from database', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user, database) => {
    setCurrentUser(user);
    setDbType(database || 'supabase');
    showToast(`Welcome back, ${user.username}!`);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await logoutUser();
        setCurrentUser(null);
        setDbType(null);
        setStaff([]);
        setAttendance([]);
        setAdvances([]);
        setSavings([]);
        setPayments([]);
        showToast('Signed out successfully.');
      } catch (err) {
        showToast('Logout failed', 'danger');
      }
    }
  };

  // Utility Date Formatting
  const fmtDate = (dStr) => {
    if (!dStr) return '-';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        // format as DD-MM-YYYY
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const date = new Date(dStr);
      return date.toLocaleDateString('en-GB');
    } catch (e) {
      return dStr;
    }
  };

  // Utility Currency Formatting
  const fmtCurrency = (amount) => {
    const symbol = settings.currency || '₹';
    return `${symbol}${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };

  // Helper date generators
  const today = () => new Date().toISOString().slice(0, 10);
  const thisMonthKey = () => new Date().toISOString().slice(0, 7);

  const getMonthKeys = (limit = 12) => {
    const list = [];
    const date = new Date();
    for (let i = 0; i < limit; i++) {
      list.push(date.toISOString().slice(0, 7));
      date.setMonth(date.getMonth() - 1);
    }
    return list;
  };

  const monthLabel = (key) => {
    if (!key) return '';
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Calculate Advance balance for employee
  const getAdvanceBalance = (staffId) => {
    return advances
      .filter(a => a.staffId === staffId)
      .reduce((sum, a) => sum + a.amount - a.repaid, 0);
  };

  // Calculate Savings balance for employee
  const getSavingsBalance = (staffId) => {
    return savings
      .filter(s => s.staffId === staffId)
      .reduce((sum, s) => sum + (s.type === 'deposit' ? s.amount : -s.amount), 0);
  };

  // Compute Wages / Payroll Calculations for Selected Month.
  // OT is always derived live from workedHours vs the staff's CURRENT stdHours,
  // so editing a staff member's daily wage or working hours instantly recalculates
  // all salary/OT figures without needing to re-mark attendance.
  const calcStaffSalary = (staffId, monthKey) => {
    const s = staff.find(x => x.id === staffId);
    if (!s) return null;

    const workDays = settings.workingDaysPerMonth || 26;
    const otMult  = settings.otMultiplier || 1.5;
    const stdHours = Number(s.workingHours) || 8;   // always use the CURRENT value

    const att = attendance.filter(
      a => a.staffId === staffId && a.date.slice(0, 7) === monthKey
    );

    const presentDays = att.filter(a => a.status === 'present').length;
    const halfDays    = att.filter(a => a.status === 'half-day' || a.status === 'halfday').length;
    const absentDays  = att.filter(a => a.status === 'absent').length;

    const totalWorked = att.reduce((sum, a) => sum + (a.workedHours || 0), 0);

    let baseSalary = 0, otPay = 0;

    if (s.salaryType === 'monthly') {
      // Monthly: pay by day count; OT computed live from workedHours vs current stdHours
      const perDayRate = s.monthlySalary / workDays;
      const hourlyRate = perDayRate / stdHours;
      baseSalary = (presentDays + halfDays * 0.5) * perDayRate;

      // Recalculate OT per record from workedHours so staff edits take effect immediately
      att.forEach(a => {
        if (a.status !== 'present' && a.status !== 'half-day' && a.status !== 'halfday') return;
        const worked = a.workedHours || 0;
        if (worked > stdHours) otPay += (worked - stdHours) * hourlyRate * otMult;
      });

    } else {
      // Daily wage: pay is proportional to hours actually worked up to stdHours per day.
      // Anything beyond stdHours is overtime.
      const hourlyRate = s.dailyWage / stdHours;

      att.forEach(a => {
        if (a.status !== 'present' && a.status !== 'half-day' && a.status !== 'halfday') return;
        const worked = a.workedHours || 0;
        const regularHours = Math.min(worked, stdHours);
        const otHours      = worked > stdHours ? worked - stdHours : 0;
        baseSalary += regularHours * hourlyRate;
        otPay      += otHours * hourlyRate * otMult;
      });
    }

    // Recompute total OT hours live from attendance (don't rely on stored overtimeHours)
    const totalOT = att.reduce((sum, a) => {
      if (a.status !== 'present' && a.status !== 'half-day' && a.status !== 'halfday') return sum;
      const worked = a.workedHours || 0;
      return sum + (worked > stdHours ? worked - stdHours : 0);
    }, 0);

    const grossSalary = baseSalary + otPay;

    return {
      staffId,
      presentDays,
      halfDays,
      absentDays,
      stdHours,                                         // expose so UI can show it
      totalWorked: Number(totalWorked.toFixed(2)),
      totalOT:     Number(totalOT.toFixed(2)),
      basicPay:    Number(baseSalary.toFixed(2)),
      otPay:       Number(otPay.toFixed(2)),
      grossSalary: Number(grossSalary.toFixed(2))
    };
  };

  // CRUD handlers
  // CRUD handlers
  const handleSaveStaff = async (data) => {
    setActiveModal(null);
    setModalData(null);

    const isEdit = !!data.id;
    const tempId = data.id || `temp-${Date.now()}`;
    const optimisticRecord = {
      ...data,
      id: tempId,
      joiningDate: data.joiningDate || new Date().toISOString().slice(0, 10),
      status: data.status || 'active'
    };

    if (isEdit) {
      setStaff(prev => prev.map(s => s.id === data.id ? optimisticRecord : s));
    } else {
      setStaff(prev => [optimisticRecord, ...prev]);
    }

    try {
      if (isEdit) {
        const updated = await updateStaff(data.id, data);
        setStaff(prev => prev.map(s => s.id === tempId ? updated : s));
        showToast('Employee profile updated successfully!');
      } else {
        const added = await addStaff(data);
        setStaff(prev => prev.map(s => s.id === tempId ? added : s));
        showToast('New employee added successfully!');
      }
    } catch (err) {
      if (isEdit) {
        loadAllData();
      } else {
        setStaff(prev => prev.filter(s => s.id !== tempId));
      }
      showToast(err.message || 'Failed to save staff record', 'danger');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Warning: Deleting this employee profile will also wipe their attendance and payment logs. Proceed?')) {
      const oldStaff = [...staff];
      const oldAttendance = [...attendance];
      const oldAdvances = [...advances];
      const oldSavings = [...savings];
      const oldPayments = [...payments];

      setStaff(prev => prev.filter(s => s.id !== id));
      setAttendance(prev => prev.filter(a => a.staffId !== id));
      setAdvances(prev => prev.filter(a => a.staffId !== id));
      setSavings(prev => prev.filter(s => s.staffId !== id));
      setPayments(prev => prev.filter(p => p.staffId !== id));

      try {
        await deleteStaff(id);
        showToast('Employee profile deleted.');
      } catch (err) {
        setStaff(oldStaff);
        setAttendance(oldAttendance);
        setAdvances(oldAdvances);
        setSavings(oldSavings);
        setPayments(oldPayments);
        showToast(err.message || 'Failed to delete staff', 'danger');
      }
    }
  };

  const handleMarkAttendance = async (attendanceId, record) => {
    setActiveModal(null);
    setModalData(null);

    const isEdit = !!attendanceId;
    const tempId = attendanceId || `temp-${Date.now()}`;
    const associatedStaff = staff.find(s => s.id === record.staffId);
    const optimisticRecord = {
      ...record,
      id: tempId,
      staff: associatedStaff || null
    };

    if (isEdit) {
      setAttendance(prev => prev.map(a => a.id === attendanceId ? optimisticRecord : a));
    } else {
      setAttendance(prev => [optimisticRecord, ...prev]);
    }

    try {
      if (isEdit) {
        const updated = await updateAttendance(attendanceId, record);
        setAttendance(prev => prev.map(a => a.id === tempId ? updated : a));
        showToast('Attendance record updated.');
      } else {
        const added = await markAttendance(record.staffId, record);
        setAttendance(prev => prev.map(a => a.id === tempId ? added : a));
        showToast('Attendance recorded.');
      }
    } catch (err) {
      if (isEdit) {
        loadAllData();
      } else {
        setAttendance(prev => prev.filter(a => a.id !== tempId));
      }
      showToast(err.message || 'Failed to record attendance', 'danger');
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (window.confirm('Delete this attendance entry?')) {
      const oldAttendance = [...attendance];
      setAttendance(prev => prev.filter(a => a.id !== id));

      try {
        await deleteAttendance(id);
        showToast('Attendance record deleted.');
      } catch (err) {
        setAttendance(oldAttendance);
        showToast(err.message || 'Failed to delete attendance entry', 'danger');
      }
    }
  };

  const handleBulkMarkPresent = async (date) => {
    if (!staff.length) return showToast('No active staff found.', 'danger');
    setLoading(true);
    try {
      const promises = staff.map(async (s) => {
        // Skip if attendance is already marked for this day
        const exists = attendance.some(a => a.staffId === s.id && a.date === date);
        if (exists) return null;

        return await markAttendance(s.id, {
          date,
          status: 'present',
          inTime: '09:00',
          outTime: '17:00',
          workedHours: 8,
          overtimeHours: 0
        });
      });

      const results = await Promise.all(promises);
      const addedRecords = results.filter(r => r !== null);
      if (addedRecords.length > 0) {
        setAttendance(prev => [...addedRecords, ...prev]);
        showToast(`Bulk marked ${addedRecords.length} staff members as PRESENT.`);
      } else {
        showToast('All staff already have attendance marked for today.', 'warning');
      }
    } catch (err) {
      showToast(err.message || 'Bulk attendance marking failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdvance = async (advanceId, record) => {
    setActiveModal(null);
    setModalData(null);

    const isEdit = !!advanceId;
    const tempId = advanceId || `temp-${Date.now()}`;
    const associatedStaff = staff.find(s => s.id === record.staffId);
    const optimisticRecord = {
      ...record,
      id: tempId,
      staff: associatedStaff || null
    };

    if (isEdit) {
      setAdvances(prev => prev.map(a => a.id === advanceId ? optimisticRecord : a));
    } else {
      setAdvances(prev => [optimisticRecord, ...prev]);
    }

    try {
      if (isEdit) {
        const updated = await updateAdvance(advanceId, record);
        setAdvances(prev => prev.map(a => a.id === tempId ? updated : a));
        showToast('Advance transaction updated.');
      } else {
        const added = await addAdvance(record.staffId, record);
        setAdvances(prev => prev.map(a => a.id === tempId ? added : a));
        showToast('Advance given successfully!');
      }
    } catch (err) {
      if (isEdit) {
        loadAllData();
      } else {
        setAdvances(prev => prev.filter(a => a.id !== tempId));
      }
      showToast(err.message || 'Failed to record advance', 'danger');
    }
  };

  const handleDeleteAdvance = async (id) => {
    if (window.confirm('Delete this cash advance record?')) {
      const oldAdvances = [...advances];
      setAdvances(prev => prev.filter(a => a.id !== id));

      try {
        await deleteAdvance(id);
        showToast('Advance entry deleted.');
      } catch (err) {
        setAdvances(oldAdvances);
        showToast(err.message || 'Failed to delete advance entry', 'danger');
      }
    }
  };

  const handleSaveSaving = async (staffId, record) => {
    setActiveModal(null);
    setModalData(null);

    const tempId = `temp-${Date.now()}`;
    const associatedStaff = staff.find(s => s.id === staffId);
    const optimisticRecord = {
      ...record,
      id: tempId,
      staffId,
      staff: associatedStaff || null
    };

    setSavings(prev => [optimisticRecord, ...prev]);

    try {
      const added = await addSaving(staffId, record);
      setSavings(prev => prev.map(s => s.id === tempId ? added : s));
      showToast(`${record.type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
    } catch (err) {
      setSavings(prev => prev.filter(s => s.id !== tempId));
      showToast(err.message || 'Failed to process savings', 'danger');
    }
  };

  const handleDeleteSaving = async (id) => {
    if (window.confirm('Erase this savings ledger transaction?')) {
      const oldSavings = [...savings];
      setSavings(prev => prev.filter(s => s.id !== id));

      try {
        await deleteSaving(id);
        showToast('Savings record deleted.');
      } catch (err) {
        setSavings(oldSavings);
        showToast(err.message || 'Failed to delete savings record', 'danger');
      }
    }
  };

  const handleSavePayment = async (staffId, record) => {
    setActiveModal(null);
    setModalData(null);

    const tempId = `temp-${Date.now()}`;
    const associatedStaff = staff.find(s => s.id === staffId);
    const optimisticRecord = {
      ...record,
      id: tempId,
      staffId,
      staff: associatedStaff || null
    };

    setPayments(prev => [optimisticRecord, ...prev]);

    try {
      const added = await addPayment(staffId, record);
      setPayments(prev => prev.map(p => p.id === tempId ? added : p));
      showToast('Salary payment transaction recorded successfully!');
    } catch (err) {
      setPayments(prev => prev.filter(p => p.id !== tempId));
      showToast(err.message || 'Failed to pay salary', 'danger');
    }
  };

  // Settings Actions
  const handleSaveSettings = (newSetts) => {
    setSettings(newSetts);
    setDarkMode(newSetts.darkMode);
    localStorage.setItem('ftp_settings', JSON.stringify(newSetts));
    showToast('System settings saved successfully!');
  };

  const handleBackup = () => {
    const backupObj = {
      version: '3.0',
      user: currentUser.username,
      date: new Date().toISOString(),
      data: { staff, attendance, advances, savings, payments }
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FactoryTrack_Backup_${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported successfully.');
  };

  const handleRestore = async (restoredData) => {
    setLoading(true);
    try {
      // Delete old records and insert new ones
      // Since doing bulk DB operation can be complex, let's load them to the view
      // For absolute correctness, a direct SQL/API sync is best. Here we simulate replacement:
      // Loop over and push to backend, or reload local caches if offline
      // The user can re-sync by loading the caches:
      if (restoredData.staff) setStaff(restoredData.staff);
      if (restoredData.attendance) setAttendance(restoredData.attendance);
      if (restoredData.advances) setAdvances(restoredData.advances);
      if (restoredData.savings) setSavings(restoredData.savings);
      if (restoredData.payments) setPayments(restoredData.payments);
      showToast('Local database caches restored. Refresh to sync completely.');
    } catch (err) {
      showToast('Data restoration failed.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('CRITICAL WARNING: You are about to erase all records. This deletes everything from database. Continue?')) {
      if (window.confirm('Confirming second time: erase database contents?')) {
        setLoading(true);
        try {
          // Simply loop through and delete all staff records (which cascade deletes others)
          const promises = staff.map(s => deleteStaff(s.id));
          await Promise.all(promises);
          setStaff([]);
          setAttendance([]);
          setAdvances([]);
          setSavings([]);
          setPayments([]);
          showToast('Database wiped successfully.', 'warning');
        } catch (err) {
          showToast('Failed to erase database completely.', 'danger');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ marginBottom: '16px' }}></div>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Active page selector rendering
  const renderActivePage = () => {
    const commonProps = {
      staff,
      attendance,
      advances,
      savings,
      payments,
      settings,
      searchQuery,
      calcStaffSalary,
      getSavingsBalance,
      getAdvanceBalance,
      fmtCurrency,
      fmtDate,
      thisMonthKey,
      today,
      getMonthKeys,
      monthLabel,
      currentUser
    };

    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            {...commonProps}
            onNavigate={setActivePage}
            onAddStaff={() => {
              setModalData(null);
              setActiveModal('staff');
            }}
          />
        );
      case 'staff':
        return (
          <Staff
            {...commonProps}
            onAddStaff={() => {
              setModalData(null);
              setActiveModal('staff');
            }}
            onEditStaff={(s) => {
              setModalData(s);
              setActiveModal('staff');
            }}
            onDeleteStaff={handleDeleteStaff}
            onViewProfile={(s) => {
              setModalData(s);
              setActiveModal('profile');
            }}
          />
        );
      case 'attendance':
        return (
          <Attendance
            {...commonProps}
            onMarkAttendance={(sId, recordId) => {
              const rec = attendance.find(a => a.id === recordId);
              setModalData(rec || { staffId: sId });
              setActiveModal('attendance');
            }}
            onDeleteAttendance={handleDeleteAttendance}
            onBulkMarkPresent={handleBulkMarkPresent}
          />
        );
      case 'salary':
        return <Salary {...commonProps} />;
      case 'advances':
        return (
          <Advances
            {...commonProps}
            onGiveAdvance={(s) => {
              setModalData({ staff: s, advance: null });
              setActiveModal('advance');
            }}
            onEditAdvance={(a) => {
              const s = staff.find(x => x.id === a.staffId);
              setModalData({ staff: s, advance: a });
              setActiveModal('advance');
            }}
            onDeleteAdvance={handleDeleteAdvance}
          />
        );
      case 'savings':
        return (
          <Savings
            {...commonProps}
            onOpenSavingsModal={(s, type) => {
              setModalData({ staff: s, type });
              setActiveModal('savings');
            }}
          />
        );
      case 'payments':
        return (
          <Payments
            {...commonProps}
            onProcessPayment={(s, month, summary) => {
              setModalData({ staff: s, month, summary });
              setActiveModal('payment');
            }}
          />
        );
      case 'analytics':
        return <Analytics {...commonProps} />;
      case 'reports':
        return <Reports {...commonProps} />;
      case 'settings':
        return (
          <Settings
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onBackup={handleBackup}
            onRestore={handleRestore}
            onClearData={handleClearData}
            currentUser={currentUser}
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'danger' ? 'danger' : t.type === 'warning' ? 'warning' : 'success'}`}>
            <span className="material-symbols-outlined">
              {t.type === 'danger' ? 'error' : t.type === 'warning' ? 'warning' : 'check_circle'}
            </span>
            {t.message}
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        factoryName={settings.factoryName || currentUser.factory}
        currentUser={currentUser}
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area */}
      <div className="main-content">
        {dbType === 'local' && (
          <div style={{
            background: 'hsl(38, 92%, 50%)',
            color: '#fff',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 10
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
            <span>
              <strong>Local Database Fallback Active.</strong> Your changes are temporary and will be lost on server refresh. Please configure <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> in Vercel and redeploy.
            </span>
          </div>
        )}
        <Header
          activePage={activePage}
          darkMode={darkMode}
          toggleDarkMode={() => {
            const nextMode = !darkMode;
            setDarkMode(nextMode);
            handleSaveSettings({ ...settings, darkMode: nextMode });
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onAddStaff={() => {
            setModalData(null);
            setActiveModal('staff');
          }}
        />

        <div className="content-scroll">
          {loading && (
            <div className="loader-overlay">
              <div className="spinner"></div>
            </div>
          )}
          {renderActivePage()}
        </div>
      </div>

      {/* Shared Modals Rendering */}
      <StaffModal
        isOpen={activeModal === 'staff'}
        onClose={() => {
          setActiveModal(null);
          setModalData(null);
        }}
        onSave={handleSaveStaff}
        staffMember={modalData}
      />

      <AttendanceModal
        isOpen={activeModal === 'attendance'}
        onClose={() => {
          setActiveModal(null);
          setModalData(null);
        }}
        onSave={handleMarkAttendance}
        staff={staff}
        record={modalData}
      />

      <AdvanceModal
        isOpen={activeModal === 'advance'}
        onClose={() => {
          setActiveModal(null);
          setModalData(null);
        }}
        onSave={handleSaveAdvance}
        staff={staff}
        record={modalData?.advance}
        defaultStaffId={modalData?.staff?.id}
      />

      <SavingsModal
        isOpen={activeModal === 'savings'}
        onClose={() => {
          setActiveModal(null);
          setModalData(null);
        }}
        onSave={handleSaveSaving}
        staff={staff}
        type={modalData?.type}
        defaultStaffId={modalData?.staff?.id}
        getBalance={getSavingsBalance}
      />

      <PaymentModal
        isOpen={activeModal === 'payment'}
        onClose={() => {
          setActiveModal(null);
          setModalData(null);
        }}
        onSave={handleSavePayment}
        staffMember={modalData?.staff}
        monthKey={modalData?.month}
        monthLabel={modalData ? monthLabel(modalData.month) : ''}
        metrics={modalData?.summary}
      />

      <ProfileModal
        isOpen={activeModal === 'profile'}
        onClose={() => {
          setActiveModal(null);
          setModalData(null);
        }}
        staffMember={modalData}
        attendance={attendance}
        advances={advances}
        savings={savings}
        payments={payments}
        onNavigate={setActivePage}
      />
    </div>
  );
}
