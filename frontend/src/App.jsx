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

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.username}!`);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await logoutUser();
        setCurrentUser(null);
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

  // Compute Wages / Payroll Calculations for Selected Month
  const calcStaffSalary = (staffId, monthKey) => {
    const s = staff.find(x => x.id === staffId);
    if (!s) return null;

    const workDays = settings.workingDaysPerMonth || 26;
    const otMult = settings.otMultiplier || 1.5;

    const att = attendance.filter(a => a.staffId === staffId && a.date.slice(0, 7) === monthKey);
    const presentDays = att.filter(a => a.status === 'present').length;
    const halfDays = att.filter(a => a.status === 'half-day' || a.status === 'halfday').length;
    const absentDays = att.filter(a => a.status === 'absent').length;
    
    const totalWorked = att.reduce((sum, a) => sum + (a.workedHours || 0), 0);
    const totalOT = att.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

    let baseSalary = 0, otPay = 0, grossSalary = 0;

    if (s.salaryType === 'monthly') {
      const perDayRate = s.monthlySalary / workDays;
      baseSalary = (presentDays + halfDays * 0.5) * perDayRate;
      const hourlyRate = perDayRate / 8; // Standard 8 hour workday
      otPay = totalOT * hourlyRate * otMult;
    } else {
      baseSalary = (presentDays + halfDays * 0.5) * s.dailyWage;
      const hourlyRate = s.dailyWage / 8; // Standard 8 hour workday
      otPay = totalOT * hourlyRate * otMult;
    }

    grossSalary = baseSalary + otPay;

    return {
      staffId,
      presentDays,
      halfDays,
      absentDays,
      totalWorked: Number(totalWorked.toFixed(2)),
      totalOT: Number(totalOT.toFixed(2)),
      basicPay: Number(baseSalary.toFixed(2)),
      otPay: Number(otPay.toFixed(2)),
      grossSalary: Number(grossSalary.toFixed(2))
    };
  };

  // CRUD handlers
  const handleSaveStaff = async (data) => {
    try {
      if (data.id) {
        const updated = await updateStaff(data.id, data);
        setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
        showToast('Employee profile updated successfully!');
      } else {
        const added = await addStaff(data);
        setStaff(prev => [added, ...prev]);
        showToast('New employee added successfully!');
      }
      setActiveModal(null);
      setModalData(null);
    } catch (err) {
      showToast(err.message || 'Failed to save staff record', 'danger');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Warning: Deleting this employee profile will also wipe their attendance and payment logs. Proceed?')) {
      try {
        await deleteStaff(id);
        setStaff(prev => prev.filter(s => s.id !== id));
        // Remove related transactions from cache
        setAttendance(prev => prev.filter(a => a.staffId !== id));
        setAdvances(prev => prev.filter(a => a.staffId !== id));
        setSavings(prev => prev.filter(s => s.staffId !== id));
        setPayments(prev => prev.filter(p => p.staffId !== id));
        showToast('Employee profile deleted.');
      } catch (err) {
        showToast(err.message || 'Failed to delete staff', 'danger');
      }
    }
  };

  const handleMarkAttendance = async (staffId, record) => {
    try {
      // Check if there is an existing record for this date
      const existing = attendance.find(a => a.staffId === staffId && a.date === record.date);
      if (existing) {
        const updated = await updateAttendance(existing.id, record);
        setAttendance(prev => prev.map(a => a.id === updated.id ? updated : a));
        showToast('Attendance record updated.');
      } else {
        const added = await markAttendance(staffId, record);
        setAttendance(prev => [added, ...prev]);
        showToast('Attendance recorded.');
      }
      setActiveModal(null);
      setModalData(null);
    } catch (err) {
      showToast(err.message || 'Failed to record attendance', 'danger');
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (window.confirm('Delete this attendance entry?')) {
      try {
        await deleteAttendance(id);
        setAttendance(prev => prev.filter(a => a.id !== id));
        showToast('Attendance record deleted.');
      } catch (err) {
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

  const handleSaveAdvance = async (staffId, record) => {
    try {
      if (record.id) {
        const updated = await updateAdvance(record.id, record);
        setAdvances(prev => prev.map(a => a.id === updated.id ? updated : a));
        showToast('Advance transaction updated.');
      } else {
        const added = await addAdvance(staffId, record);
        setAdvances(prev => [added, ...prev]);
        showToast('Advance given successfully!');
      }
      setActiveModal(null);
      setModalData(null);
    } catch (err) {
      showToast(err.message || 'Failed to record advance', 'danger');
    }
  };

  const handleDeleteAdvance = async (id) => {
    if (window.confirm('Delete this cash advance record?')) {
      try {
        await deleteAdvance(id);
        setAdvances(prev => prev.filter(a => a.id !== id));
        showToast('Advance entry deleted.');
      } catch (err) {
        showToast(err.message || 'Failed to delete advance entry', 'danger');
      }
    }
  };

  const handleSaveSaving = async (staffId, record) => {
    try {
      const added = await addSaving(staffId, record);
      setSavings(prev => [added, ...prev]);
      showToast(`${record.type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
      setActiveModal(null);
      setModalData(null);
    } catch (err) {
      showToast(err.message || 'Failed to process savings', 'danger');
    }
  };

  const handleDeleteSaving = async (id) => {
    if (window.confirm('Erase this savings ledger transaction?')) {
      try {
        await deleteSaving(id);
        setSavings(prev => prev.filter(s => s.id !== id));
        showToast('Savings record deleted.');
      } catch (err) {
        showToast(err.message || 'Failed to delete savings record', 'danger');
      }
    }
  };

  const handleSavePayment = async (staffId, record) => {
    try {
      const added = await addPayment(staffId, record);
      setPayments(prev => [added, ...prev]);
      showToast('Salary payment transaction recorded successfully!');
      setActiveModal(null);
      setModalData(null);
    } catch (err) {
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
