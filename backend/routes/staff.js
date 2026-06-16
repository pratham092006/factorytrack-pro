const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

const dbFallback = require('../config/dbFallback');

// Interceptor middleware for local DB fallback
router.use(async (req, res, next) => {
  if (!global.useLocalDB) return next();

  const userId = req.user.id;
  const method = req.method;
  const path = req.path;

  try {
    // 1. Attendance All
    if (method === 'GET' && path === '/attendance/all') {
      const data = await dbFallback.getAttendance(userId);
      return res.json({ success: true, attendance: data });
    }
    // 2. Advances All
    if (method === 'GET' && path === '/advances/all') {
      const data = await dbFallback.getAdvances(userId);
      return res.json({ success: true, advances: data });
    }
    // 3. Savings All
    if (method === 'GET' && path === '/savings/all') {
      const data = await dbFallback.getSavings(userId);
      return res.json({ success: true, savings: data });
    }
    // 4. Payments All
    if (method === 'GET' && path === '/payments/all') {
      const data = await dbFallback.getPayments(userId);
      return res.json({ success: true, payments: data });
    }
    
    // 5. Specific transactions updates
    // PUT /attendance/:id
    let match = path.match(/^\/attendance\/([^/]+)$/);
    if (method === 'PUT' && match) {
      const data = await dbFallback.updateAttendance(userId, match[1], req.body);
      return res.json({ success: true, attendance: data });
    }
    // DELETE /attendance/:id
    if (method === 'DELETE' && match) {
      await dbFallback.deleteAttendance(userId, match[1]);
      return res.json({ success: true, message: 'Deleted' });
    }

    // PUT /advances/:id
    match = path.match(/^\/advances\/([^/]+)$/);
    if (method === 'PUT' && match) {
      const data = await dbFallback.updateAdvance(userId, match[1], req.body);
      return res.json({ success: true, advance: data });
    }
    // DELETE /advances/:id
    if (method === 'DELETE' && match) {
      await dbFallback.deleteAdvance(userId, match[1]);
      return res.json({ success: true, message: 'Deleted' });
    }

    // DELETE /savings/:id
    match = path.match(/^\/savings\/([^/]+)$/);
    if (method === 'DELETE' && match) {
      await dbFallback.deleteSaving(userId, match[1]);
      return res.json({ success: true, message: 'Deleted' });
    }

    // DELETE /payments/:id
    match = path.match(/^\/payments\/([^/]+)$/);
    if (method === 'DELETE' && match) {
      await dbFallback.deletePayment(userId, match[1]);
      return res.json({ success: true, message: 'Deleted' });
    }

    // 6. Root routes or parameter paths starting with ID
    // GET /
    if (method === 'GET' && path === '/') {
      const data = await dbFallback.getStaff(userId);
      return res.json({ success: true, staff: data });
    }
    // POST /
    if (method === 'POST' && path === '/') {
      const data = await dbFallback.addStaff(userId, req.body);
      return res.status(201).json({ success: true, staff: data });
    }

    // Match /:id/attendance
    match = path.match(/^\/([^/]+)\/attendance$/);
    if (method === 'POST' && match) {
      const data = await dbFallback.markAttendance(userId, match[1], req.body);
      return res.status(201).json({ success: true, attendance: data });
    }

    // Match /:id/advances
    match = path.match(/^\/([^/]+)\/advances$/);
    if (method === 'POST' && match) {
      const data = await dbFallback.addAdvance(userId, match[1], req.body);
      return res.status(201).json({ success: true, advance: data });
    }

    // Match /:id/savings
    match = path.match(/^\/([^/]+)\/savings$/);
    if (method === 'POST' && match) {
      const data = await dbFallback.addSaving(userId, match[1], req.body);
      return res.status(201).json({ success: true, saving: data });
    }

    // Match /:id/payments
    match = path.match(/^\/([^/]+)\/payments$/);
    if (method === 'POST' && match) {
      const data = await dbFallback.addPayment(userId, match[1], req.body);
      return res.status(201).json({ success: true, payment: data });
    }

    // Match /:id
    match = path.match(/^\/([^/]+)$/);
    if (match) {
      const id = match[1];
      if (method === 'GET') {
        const staffList = await dbFallback.getStaff(userId);
        const item = staffList.find(s => s.id === id);
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });
        return res.json({ success: true, staff: item });
      }
      if (method === 'PUT') {
        const data = await dbFallback.updateStaff(userId, id, req.body);
        return res.json({ success: true, staff: data });
      }
      if (method === 'DELETE') {
        await dbFallback.deleteStaff(userId, id);
        return res.json({ success: true, message: 'Deleted' });
      }
    }

    next();
  } catch (err) {
    console.error('Local fallback DB dispatch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all staff for the current user's factory
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, staff: data || [] });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching staff' });
  }
});

// Get single staff member
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    res.json({ success: true, staff: data });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching staff' });
  }
});

// Add new staff
router.post('/', async (req, res) => {
  try {
    const { staffId, name, mobile, salaryType, dailyWage, monthlySalary } = req.body;

    const { data, error } = await supabase
      .from('staff')
      .insert([
        {
          user_id: req.user.id,
          staff_id: staffId,
          name,
          mobile,
          salary_type: salaryType,
          daily_wage: dailyWage || 0,
          monthly_salary: monthlySalary || 0,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, staff: data });
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({ success: false, message: error.message || 'Error adding staff' });
  }
});

// Update staff
router.put('/:id', async (req, res) => {
  try {
    const { name, mobile, salaryType, dailyWage, monthlySalary, status } = req.body;

    const { data, error } = await supabase
      .from('staff')
      .update({
        name,
        mobile,
        salary_type: salaryType,
        daily_wage: dailyWage || 0,
        monthly_salary: monthlySalary || 0,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, staff: data });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating staff' });
  }
});

// Delete staff
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ success: false, message: error.message || 'Error deleting staff' });
  }
});

// ===== ATTENDANCE ROUTES =====

// Get all attendance records
router.get('/attendance/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        staff:staff_id (
          id,
          name,
          staff_id
        )
      `)
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, attendance: data || [] });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance' });
  }
});

// Mark attendance for a staff member
router.post('/:id/attendance', async (req, res) => {
  try {
    const { date, status, inTime, outTime, workedHours, overtimeHours } = req.body;

    const { data, error } = await supabase
      .from('attendance')
      .insert([
        {
          user_id: req.user.id,
          staff_id: req.params.id,
          date,
          status,
          in_time: inTime,
          out_time: outTime,
          worked_hours: workedHours || 0,
          overtime_hours: overtimeHours || 0
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, attendance: data });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: 'Error marking attendance' });
  }
});

// Update attendance
router.put('/attendance/:id', async (req, res) => {
  try {
    const { status, inTime, outTime, workedHours, overtimeHours } = req.body;

    const { data, error } = await supabase
      .from('attendance')
      .update({
        status,
        in_time: inTime,
        out_time: outTime,
        worked_hours: workedHours || 0,
        overtime_hours: overtimeHours || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, attendance: data });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ success: false, message: 'Error updating attendance' });
  }
});

// Delete attendance
router.delete('/attendance/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, message: 'Attendance deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ success: false, message: 'Error deleting attendance' });
  }
});

// ===== ADVANCE ROUTES =====

// Get all advances
router.get('/advances/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('advances')
      .select(`
        *,
        staff:staff_id (
          id,
          name,
          staff_id
        )
      `)
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, advances: data || [] });
  } catch (error) {
    console.error('Error fetching advances:', error);
    res.status(500).json({ success: false, message: 'Error fetching advances' });
  }
});

// Add advance
router.post('/:id/advances', async (req, res) => {
  try {
    const { amount, date, reason, repaid } = req.body;

    const { data, error } = await supabase
      .from('advances')
      .insert([
        {
          user_id: req.user.id,
          staff_id: req.params.id,
          amount,
          date,
          reason,
          repaid: repaid || 0
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, advance: data });
  } catch (error) {
    console.error('Error adding advance:', error);
    res.status(500).json({ success: false, message: 'Error adding advance' });
  }
});

// Update advance
router.put('/advances/:id', async (req, res) => {
  try {
    const { amount, reason, repaid } = req.body;

    const { data, error } = await supabase
      .from('advances')
      .update({
        amount,
        reason,
        repaid,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, advance: data });
  } catch (error) {
    console.error('Error updating advance:', error);
    res.status(500).json({ success: false, message: 'Error updating advance' });
  }
});

// Delete advance
router.delete('/advances/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('advances')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, message: 'Advance deleted successfully' });
  } catch (error) {
    console.error('Error deleting advance:', error);
    res.status(500).json({ success: false, message: 'Error deleting advance' });
  }
});

// ===== SAVINGS ROUTES =====

// Get all savings
router.get('/savings/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('savings')
      .select(`
        *,
        staff:staff_id (
          id,
          name,
          staff_id
        )
      `)
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, savings: data || [] });
  } catch (error) {
    console.error('Error fetching savings:', error);
    res.status(500).json({ success: false, message: 'Error fetching savings' });
  }
});

// Add saving record
router.post('/:id/savings', async (req, res) => {
  try {
    const { type, amount, date, notes } = req.body;

    const { data, error } = await supabase
      .from('savings')
      .insert([
        {
          user_id: req.user.id,
          staff_id: req.params.id,
          type,
          amount,
          date,
          notes
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, saving: data });
  } catch (error) {
    console.error('Error adding saving:', error);
    res.status(500).json({ success: false, message: 'Error adding saving' });
  }
});

// Delete saving
router.delete('/savings/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('savings')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, message: 'Saving deleted successfully' });
  } catch (error) {
    console.error('Error deleting saving:', error);
    res.status(500).json({ success: false, message: 'Error deleting saving' });
  }
});

// ===== PAYMENT ROUTES =====

// Get all payments
router.get('/payments/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        staff:staff_id (
          id,
          name,
          staff_id
        )
      `)
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, payments: data || [] });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Error fetching payments' });
  }
});

// Record payment
router.post('/:id/payments', async (req, res) => {
  try {
    const { month, amount, date, notes } = req.body;

    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          user_id: req.user.id,
          staff_id: req.params.id,
          month,
          amount,
          date,
          notes
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, payment: data });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ success: false, message: 'Error recording payment' });
  }
});

// Delete payment
router.delete('/payments/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, message: 'Error deleting payment' });
  }
});

module.exports = router;

// Made with Bob
