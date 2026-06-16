# FactoryTrack Pro - Full Stack Application

A complete factory staff management system with **Supabase** backend and modern frontend.

## 📁 Project Structure

```
TaskMaster/
├── frontend/              # Frontend application
│   └── index.html        # FactoryTrack Pro UI with API integration
├── backend/              # Backend server
│   ├── server.js         # Express server
│   ├── config/           # Configuration
│   │   └── supabase.js   # Supabase client
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication endpoints
│   │   └── staff.js      # Staff management endpoints
│   └── middleware/       # Express middleware
│       └── auth.js       # JWT authentication
├── supabase-schema.sql   # Database schema
├── SUPABASE_SETUP.md     # Detailed setup guide
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json          # Dependencies
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Supabase account (free tier works great!)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase database:**
   - Go to https://app.supabase.com
   - Open your project
   - Navigate to **SQL Editor**
   - Copy contents of `supabase-schema.sql`
   - Paste and run in SQL Editor
   - See `SUPABASE_SETUP.md` for detailed instructions

3. **Environment is already configured:**
   - `.env` file contains your Supabase credentials
   - No additional configuration needed!

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Access the application:**
   - Open browser: http://localhost:5001
   - Register a new account
   - Start managing your factory staff!

## 🔧 Development

```bash
# Start with auto-reload
npm run dev
```

## 📡 API Endpoints

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
- `GET /api/staff/attendance/all` - Get all attendance records
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
- `POST /api/staff/:id/savings` - Add saving record
- `DELETE /api/staff/savings/:id` - Delete saving

### Payments
- `GET /api/staff/payments/all` - Get all payments
- `POST /api/staff/:id/payments` - Record payment
- `DELETE /api/staff/payments/:id` - Delete payment

## ✨ Features

### Frontend (FactoryTrack Pro)
- ✅ Modern, responsive UI
- ✅ Dark/Light theme toggle
- ✅ Staff management
- ✅ Attendance tracking
- ✅ Salary calculations (daily/monthly)
- ✅ Advance management
- ✅ Savings tracking
- ✅ Payment records
- ✅ Reports & Analytics
- ✅ Data export (CSV/JSON)
- ✅ Charts and visualizations

### Backend
- ✅ RESTful API
- ✅ Supabase Authentication
- ✅ PostgreSQL database (via Supabase)
- ✅ Multi-tenant (factory-isolated data)
- ✅ Row Level Security (RLS)
- ✅ Real-time capabilities (Supabase)
- ✅ Error handling
- ✅ CORS enabled

## 🔐 Security

- ✅ Supabase Auth with JWT tokens
- ✅ Row Level Security (RLS) policies
- ✅ Factory-level data isolation
- ✅ Protected API routes
- ✅ Secure password handling

## 📊 Database Schema

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

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- CSS3 (Custom design system)
- Vanilla JavaScript
- Chart.js for visualizations

**Backend:**
- Node.js
- Express.js
- Supabase (PostgreSQL + Auth + Real-time)
- JWT for authentication

**Database:**
- PostgreSQL (via Supabase)
- Row Level Security (RLS)
- Real-time subscriptions

## 🌟 Why Supabase?

- ✅ **Free tier** with generous limits
- ✅ **PostgreSQL** - powerful relational database
- ✅ **Built-in authentication** - no need for custom auth
- ✅ **Row Level Security** - data isolation at database level
- ✅ **Real-time** - instant updates across clients
- ✅ **Auto-generated APIs** - REST and GraphQL
- ✅ **Storage** - file uploads (future feature)
- ✅ **Edge Functions** - serverless functions (future feature)

## 📝 Environment Variables

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# JWT Secret (for custom tokens if needed)
JWT_SECRET=your_secret_key

# Client URL
CLIENT_URL=http://localhost:5001
```

## 🚨 Troubleshooting

See `SUPABASE_SETUP.md` for detailed troubleshooting guide.

Common issues:
- **Connection Error**: Check Supabase credentials in `.env`
- **Tables Not Found**: Run `supabase-schema.sql` in Supabase SQL Editor
- **Authentication Error**: Enable Email provider in Supabase Auth settings
- **Data Not Showing**: Verify RLS policies are created

## 📚 Documentation

- [Supabase Setup Guide](SUPABASE_SETUP.md) - Detailed setup instructions
- [Supabase Docs](https://supabase.com/docs) - Official Supabase documentation
- [API Reference](SUPABASE_SETUP.md#api-endpoints) - Complete API documentation

## 🎯 Roadmap

- [ ] Real-time attendance updates
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Payroll automation
- [ ] Document storage (Supabase Storage)
- [ ] Email notifications
- [ ] Multi-language support

## 📄 License

MIT License - Feel free to use this project for your factory management needs!

## 🤝 Support

For issues or questions:
1. Check `SUPABASE_SETUP.md` for setup help
2. Review Supabase documentation
3. Create an issue in the repository

---

**Made with ❤️ for efficient factory management**

**Powered by Supabase** 🚀