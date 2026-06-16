# Supabase Setup Guide for FactoryTrack Pro

## Step 1: Create Database Tables

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` file
5. Paste it into the SQL editor
6. Click **Run** to execute the SQL

This will create:
- ✅ All 6 tables (users, staff, attendance, advances, savings, payments)
- ✅ Indexes for better performance
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp updates

## Step 2: Verify Tables Created

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - users
   - staff
   - attendance
   - advances
   - savings
   - payments

## Step 3: Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase
2. Make sure **Email** provider is enabled
3. Under **Email Auth** settings:
   - ✅ Enable email confirmations (optional)
   - ✅ Set up email templates (optional)

## Step 4: Environment Variables

Your `.env` file is already configured with:
```
SUPABASE_URL=https://fcdbtfggeympmqyhrwum.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Test the Connection

1. Stop the current server (Ctrl+C in terminal)
2. Start the server:
   ```bash
   npm start
   ```
3. You should see:
   ```
   ✅ Supabase connected successfully
   🚀 Server running on port 5001
   ```

## Step 6: Test the Application

1. Open browser: http://localhost:5001
2. Click **Register** tab
3. Create a new account:
   - Factory: Your factory name
   - Username: Your username
   - Password: Your password
4. Login with your credentials
5. Start adding staff members!

## Database Schema Overview

### Users Table
- Stores user information (factory, username, email)
- Linked to Supabase Auth

### Staff Table
- Employee records
- Fields: staff_id, name, mobile, salary_type, daily_wage, monthly_salary, status

### Attendance Table
- Daily attendance tracking
- Fields: date, status, in_time, out_time, worked_hours, overtime_hours

### Advances Table
- Salary advances given to employees
- Fields: amount, date, reason, repaid

### Savings Table
- Employee savings (deposits/withdrawals)
- Fields: type, amount, date, notes

### Payments Table
- Salary payment records
- Fields: month, amount, date, notes

## Security Features

✅ **Row Level Security (RLS)**: Users can only access their own data
✅ **Authentication**: JWT tokens via Supabase Auth
✅ **Data Isolation**: Each factory's data is completely separate
✅ **Secure API**: All routes protected with authentication middleware

## Troubleshooting

### Connection Error
- Check if SUPABASE_URL and SUPABASE_ANON_KEY are correct in `.env`
- Verify your Supabase project is active

### Tables Not Found
- Run the SQL schema in Supabase SQL Editor
- Check Table Editor to verify tables exist

### Authentication Error
- Make sure Email provider is enabled in Supabase
- Check if RLS policies are created

### Data Not Showing
- Verify you're logged in with the correct account
- Check browser console for errors
- Verify RLS policies allow data access

## API Endpoints

All endpoints require authentication (Bearer token in Authorization header)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Staff Management
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Add new staff
- `GET /api/staff/:id` - Get staff by ID
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Attendance
- `GET /api/staff/attendance/all` - Get all attendance
- `POST /api/staff/:id/attendance` - Mark attendance
- `PUT /api/staff/attendance/:id` - Update attendance
- `DELETE /api/staff/attendance/:id` - Delete attendance

### Advances
- `GET /api/staff/advances/all` - Get all advances
- `POST /api/staff/:id/advances` - Add advance
- `PUT /api/staff/advances/:id` - Update advance
- `DELETE /api/staff/advances/:id` - Delete advance

### Savings
- `GET /api/staff/savings/all` - Get all savings
- `POST /api/staff/:id/savings` - Add saving
- `DELETE /api/staff/savings/:id` - Delete saving

### Payments
- `GET /api/staff/payments/all` - Get all payments
- `POST /api/staff/:id/payments` - Record payment
- `DELETE /api/staff/payments/:id` - Delete payment

## Next Steps

1. ✅ Run the SQL schema in Supabase
2. ✅ Start the server
3. ✅ Register a new account
4. ✅ Start managing your factory staff!

---

**Need Help?** Check the Supabase documentation: https://supabase.com/docs