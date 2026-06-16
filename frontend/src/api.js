// API service layer for FactoryTrack Pro
const API_URL = '/api';

let authToken = localStorage.getItem('ftp_token') || '';

export function getAuthToken() {
  return authToken;
}

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('ftp_token', token);
  } else {
    localStorage.removeItem('ftp_token');
  }
}

async function apiCall(endpoint, options = {}) {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      setAuthToken('');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: response.statusText || 'Request failed' };
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

/* ==========================================
   CONVERTERS (snake_case <-> camelCase)
   ========================================== */

function mapStaffToFrontend(s) {
  if (!s) return null;
  return {
    id: s.id,
    userId: s.user_id,
    staffId: s.staff_id,
    name: s.name,
    mobile: s.mobile,
    salaryType: s.salary_type,
    dailyWage: Number(s.daily_wage || 0),
    monthlySalary: Number(s.monthly_salary || 0),
    status: s.status,
    joiningDate: s.joining_date || (s.created_at ? s.created_at.slice(0, 10) : ''),
    createdAt: s.created_at,
    updatedAt: s.updated_at
  };
}

function mapStaffToBackend(s) {
  if (!s) return null;
  return {
    staffId: s.staffId,
    name: s.name,
    mobile: s.mobile,
    salaryType: s.salaryType,
    dailyWage: Number(s.dailyWage || 0),
    monthlySalary: Number(s.monthlySalary || 0),
    status: s.status
  };
}

function mapAttendanceToFrontend(a) {
  if (!a) return null;
  return {
    id: a.id,
    userId: a.user_id,
    staffId: a.staff_id,
    date: a.date,
    status: a.status === 'halfday' ? 'half-day' : a.status,
    inTime: a.in_time,
    outTime: a.out_time,
    workedHours: Number(a.worked_hours || 0),
    overtimeHours: Number(a.overtime_hours || 0),
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    staff: a.staff ? mapStaffToFrontend(a.staff) : null
  };
}

function mapAttendanceToBackend(a) {
  if (!a) return null;
  return {
    date: a.date,
    status: a.status === 'half-day' ? 'halfday' : a.status,
    inTime: a.inTime,
    outTime: a.outTime,
    workedHours: Number(a.workedHours || 0),
    overtimeHours: Number(a.overtimeHours || 0)
  };
}

function mapAdvanceToFrontend(a) {
  if (!a) return null;
  return {
    id: a.id,
    userId: a.user_id,
    staffId: a.staff_id,
    amount: Number(a.amount || 0),
    date: a.date,
    reason: a.reason,
    repaid: Number(a.repaid || 0),
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    staff: a.staff ? mapStaffToFrontend(a.staff) : null
  };
}

function mapAdvanceToBackend(a) {
  if (!a) return null;
  return {
    amount: Number(a.amount || 0),
    date: a.date,
    reason: a.reason,
    repaid: Number(a.repaid || 0)
  };
}

function mapSavingToFrontend(s) {
  if (!s) return null;
  return {
    id: s.id,
    userId: s.user_id,
    staffId: s.staff_id,
    type: s.type,
    amount: Number(s.amount || 0),
    date: s.date,
    notes: s.notes,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    staff: s.staff ? mapStaffToFrontend(s.staff) : null
  };
}

function mapSavingToBackend(s) {
  if (!s) return null;
  return {
    type: s.type,
    amount: Number(s.amount || 0),
    date: s.date,
    notes: s.notes
  };
}

function mapPaymentToFrontend(p) {
  if (!p) return null;
  return {
    id: p.id,
    userId: p.user_id,
    staffId: p.staff_id,
    month: p.month,
    amount: Number(p.amount || 0),
    date: p.date,
    notes: p.notes,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    staff: p.staff ? mapStaffToFrontend(p.staff) : null
  };
}

function mapPaymentToBackend(p) {
  if (!p) return null;
  return {
    month: p.month,
    amount: Number(p.amount || 0),
    date: p.date,
    notes: p.notes
  };
}

/* ==========================================
   AUTH API
   ========================================== */
export async function loginUser(factory, username, password) {
  const data = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ factory, username, password })
  });
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function registerUser(factory, username, password) {
  const data = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ factory, username, password })
  });
  return data;
}

export async function getCurrentUser() {
  return await apiCall('/auth/me');
}

export async function logoutUser() {
  try {
    await apiCall('/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout error on server:', err);
  }
  setAuthToken('');
}

/* ==========================================
   STAFF API
   ========================================== */
export async function fetchStaff() {
  const res = await apiCall('/staff');
  const list = res.staff || [];
  return list.map(mapStaffToFrontend);
}

export async function addStaff(record) {
  const res = await apiCall('/staff', {
    method: 'POST',
    body: JSON.stringify(mapStaffToBackend(record))
  });
  return mapStaffToFrontend(res.staff);
}

export async function updateStaff(id, record) {
  const res = await apiCall(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapStaffToBackend(record))
  });
  return mapStaffToFrontend(res.staff);
}

export async function deleteStaff(id) {
  return await apiCall(`/staff/${id}`, { method: 'DELETE' });
}

/* ==========================================
   ATTENDANCE API
   ========================================== */
export async function fetchAttendance() {
  const res = await apiCall('/staff/attendance/all');
  const list = res.attendance || [];
  return list.map(mapAttendanceToFrontend);
}

export async function markAttendance(staffId, record) {
  const res = await apiCall(`/staff/${staffId}/attendance`, {
    method: 'POST',
    body: JSON.stringify(mapAttendanceToBackend(record))
  });
  return mapAttendanceToFrontend(res.attendance);
}

export async function updateAttendance(id, record) {
  const res = await apiCall(`/staff/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapAttendanceToBackend(record))
  });
  return mapAttendanceToFrontend(res.attendance);
}

export async function deleteAttendance(id) {
  return await apiCall(`/staff/attendance/${id}`, { method: 'DELETE' });
}

/* ==========================================
   ADVANCES API
   ========================================== */
export async function fetchAdvances() {
  const res = await apiCall('/staff/advances/all');
  const list = res.advances || [];
  return list.map(mapAdvanceToFrontend);
}

export async function addAdvance(staffId, record) {
  const res = await apiCall(`/staff/${staffId}/advances`, {
    method: 'POST',
    body: JSON.stringify(mapAdvanceToBackend(record))
  });
  return mapAdvanceToFrontend(res.advance);
}

export async function updateAdvance(id, record) {
  const res = await apiCall(`/staff/advances/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapAdvanceToBackend(record))
  });
  return mapAdvanceToFrontend(res.advance);
}

export async function deleteAdvance(id) {
  return await apiCall(`/staff/advances/${id}`, { method: 'DELETE' });
}

/* ==========================================
   SAVINGS API
   ========================================== */
export async function fetchSavings() {
  const res = await apiCall('/staff/savings/all');
  const list = res.savings || [];
  return list.map(mapSavingToFrontend);
}

export async function addSaving(staffId, record) {
  const res = await apiCall(`/staff/${staffId}/savings`, {
    method: 'POST',
    body: JSON.stringify(mapSavingToBackend(record))
  });
  return mapSavingToFrontend(res.saving);
}

export async function deleteSaving(id) {
  return await apiCall(`/staff/savings/${id}`, { method: 'DELETE' });
}

/* ==========================================
   PAYMENTS API
   ========================================== */
export async function fetchPayments() {
  const res = await apiCall('/staff/payments/all');
  const list = res.payments || [];
  return list.map(mapPaymentToFrontend);
}

export async function addPayment(staffId, record) {
  const res = await apiCall(`/staff/${staffId}/payments`, {
    method: 'POST',
    body: JSON.stringify(mapPaymentToBackend(record))
  });
  return mapPaymentToFrontend(res.payment);
}

export async function deletePayment(id) {
  return await apiCall(`/staff/payments/${id}`, { method: 'DELETE' });
}
