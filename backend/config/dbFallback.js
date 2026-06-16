const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'db.json');
const isVercel = process.env.VERCEL === '1';

// In-memory fallback database for serverless environments
let inMemoryDB = {
  users: [],
  staff: [],
  attendance: [],
  advances: [],
  savings: [],
  payments: []
};

// Initialize file database if not in Vercel
if (!isVercel) {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(inMemoryDB, null, 2));
    }
  } catch (err) {
    console.warn('Failed to initialize local file DB, using in-memory mode:', err.message);
  }
}

function readDB() {
  if (isVercel) return inMemoryDB;
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading JSON fallback database:', err);
  }
  return inMemoryDB;
}

function writeDB(data) {
  if (isVercel) {
    inMemoryDB = data;
    return;
  }
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing JSON fallback database:', err);
    inMemoryDB = data; // Fall back to keeping it in memory
  }
}

module.exports = {
  // Auth operations
  registerUser: async (factory, username, password) => {
    const db = readDB();
    const email = `${username}@${factory}.factorytrack.local`;
    
    // Check if email already exists
    if (db.users.some(u => u.email === email)) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: crypto.randomUUID(),
      factory,
      username,
      email,
      password,
      created_at: new Date().toISOString()
    };
    
    db.users.push(newUser);
    writeDB(db);
    
    return newUser;
  },

  loginUser: async (factory, username, password) => {
    const db = readDB();
    const email = `${username}@${factory}.factorytrack.local`;
    const user = db.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const dummyToken = Buffer.from(JSON.stringify({ id: user.id, username: user.username })).toString('base64');
    return { user, token: dummyToken };
  },

  getUserByToken: async (token) => {
    const db = readDB();
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      const user = db.users.find(u => u.id === payload.id);
      if (!user) throw new Error('User not found');
      return user;
    } catch (err) {
      throw new Error('Invalid authentication token');
    }
  },

  // Staff operations
  getStaff: async (userId) => {
    const db = readDB();
    return db.staff.filter(s => s.user_id === userId);
  },

  addStaff: async (userId, staffData) => {
    const db = readDB();
    const newStaff = {
      id: crypto.randomUUID(),
      user_id: userId,
      staff_id: staffData.staffId,
      name: staffData.name,
      mobile: staffData.mobile,
      salary_type: staffData.salaryType,
      daily_wage: Number(staffData.dailyWage || 0),
      monthly_salary: Number(staffData.monthlySalary || 0),
      status: staffData.status || 'active',
      created_at: new Date().toISOString()
    };
    db.staff.push(newStaff);
    writeDB(db);
    return newStaff;
  },

  updateStaff: async (userId, staffId, staffData) => {
    const db = readDB();
    const idx = db.staff.findIndex(s => s.id === staffId && s.user_id === userId);
    if (idx === -1) throw new Error('Staff member not found');
    
    db.staff[idx] = {
      ...db.staff[idx],
      name: staffData.name,
      mobile: staffData.mobile,
      salary_type: staffData.salaryType,
      daily_wage: Number(staffData.dailyWage || 0),
      monthly_salary: Number(staffData.monthlySalary || 0),
      status: staffData.status || 'active',
      updated_at: new Date().toISOString()
    };
    writeDB(db);
    return db.staff[idx];
  },

  deleteStaff: async (userId, staffId) => {
    const db = readDB();
    db.staff = db.staff.filter(s => !(s.id === staffId && s.user_id === userId));
    db.attendance = db.attendance.filter(a => a.staff_id !== staffId);
    db.advances = db.advances.filter(a => a.staff_id !== staffId);
    db.savings = db.savings.filter(s => s.staff_id !== staffId);
    db.payments = db.payments.filter(p => p.staff_id !== staffId);
    writeDB(db);
  },

  // Attendance operations
  getAttendance: async (userId) => {
    const db = readDB();
    return db.attendance
      .filter(a => a.user_id === userId)
      .map(a => ({
        ...a,
        staff: db.staff.find(s => s.id === a.staff_id)
      }));
  },

  markAttendance: async (userId, staffId, record) => {
    const db = readDB();
    db.attendance = db.attendance.filter(a => !(a.staff_id === staffId && a.date === record.date));
    
    const newAtt = {
      id: crypto.randomUUID(),
      user_id: userId,
      staff_id: staffId,
      date: record.date,
      status: record.status,
      in_time: record.inTime,
      out_time: record.outTime,
      worked_hours: Number(record.workedHours || 0),
      overtime_hours: Number(record.overtimeHours || 0),
      created_at: new Date().toISOString()
    };
    
    db.attendance.push(newAtt);
    writeDB(db);
    return newAtt;
  },

  updateAttendance: async (userId, attId, record) => {
    const db = readDB();
    const idx = db.attendance.findIndex(a => a.id === attId && a.user_id === userId);
    if (idx === -1) throw new Error('Attendance record not found');
    
    db.attendance[idx] = {
      ...db.attendance[idx],
      status: record.status,
      in_time: record.inTime,
      out_time: record.outTime,
      worked_hours: Number(record.workedHours || 0),
      overtime_hours: Number(record.overtimeHours || 0),
      updated_at: new Date().toISOString()
    };
    writeDB(db);
    return db.attendance[idx];
  },

  deleteAttendance: async (userId, attId) => {
    const db = readDB();
    db.attendance = db.attendance.filter(a => !(a.id === attId && a.user_id === userId));
    writeDB(db);
  },

  // Advances operations
  getAdvances: async (userId) => {
    const db = readDB();
    return db.advances
      .filter(a => a.user_id === userId)
      .map(a => ({
        ...a,
        staff: db.staff.find(s => s.id === a.staff_id)
      }));
  },

  addAdvance: async (userId, staffId, record) => {
    const db = readDB();
    const newAdv = {
      id: crypto.randomUUID(),
      user_id: userId,
      staff_id: staffId,
      amount: Number(record.amount || 0),
      date: record.date,
      reason: record.reason,
      repaid: Number(record.repaid || 0),
      created_at: new Date().toISOString()
    };
    db.advances.push(newAdv);
    writeDB(db);
    return newAdv;
  },

  updateAdvance: async (userId, advId, record) => {
    const db = readDB();
    const idx = db.advances.findIndex(a => a.id === advId && a.user_id === userId);
    if (idx === -1) throw new Error('Advance record not found');
    
    db.advances[idx] = {
      ...db.advances[idx],
      amount: Number(record.amount || 0),
      reason: record.reason,
      repaid: Number(record.repaid || 0),
      updated_at: new Date().toISOString()
    };
    writeDB(db);
    return db.advances[idx];
  },

  deleteAdvance: async (userId, advId) => {
    const db = readDB();
    db.advances = db.advances.filter(a => !(a.id === advId && a.user_id === userId));
    writeDB(db);
  },

  // Savings operations
  getSavings: async (userId) => {
    const db = readDB();
    return db.savings
      .filter(s => s.user_id === userId)
      .map(s => ({
        ...s,
        staff: db.staff.find(x => x.id === s.staff_id)
      }));
  },

  addSaving: async (userId, staffId, record) => {
    const db = readDB();
    const newSav = {
      id: crypto.randomUUID(),
      user_id: userId,
      staff_id: staffId,
      type: record.type,
      amount: Number(record.amount || 0),
      date: record.date,
      notes: record.notes,
      created_at: new Date().toISOString()
    };
    db.savings.push(newSav);
    writeDB(db);
    return newSav;
  },

  deleteSaving: async (userId, savId) => {
    const db = readDB();
    db.savings = db.savings.filter(s => !(s.id === savId && s.user_id === userId));
    writeDB(db);
  },

  // Payments operations
  getPayments: async (userId) => {
    const db = readDB();
    return db.payments
      .filter(p => p.user_id === userId)
      .map(p => ({
        ...p,
        staff: db.staff.find(s => s.id === p.staff_id)
      }));
  },

  addPayment: async (userId, staffId, record) => {
    const db = readDB();
    const newPay = {
      id: crypto.randomUUID(),
      user_id: userId,
      staff_id: staffId,
      month: record.month,
      amount: Number(record.amount || 0),
      date: record.date,
      notes: record.notes,
      created_at: new Date().toISOString()
    };
    db.payments.push(newPay);
    writeDB(db);
    return newPay;
  },

  deletePayment: async (userId, payId) => {
    const db = readDB();
    db.payments = db.payments.filter(p => !(p.id === payId && p.user_id === userId));
    writeDB(db);
  }
};
