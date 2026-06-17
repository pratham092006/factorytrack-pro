const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const supabase = require('./config/supabase');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root dist, frontend/dist (compiled React app), or fallback to frontend
const frontendPath = fs.existsSync(path.join(__dirname, '../dist'))
  ? path.join(__dirname, '../dist')
  : (fs.existsSync(path.join(__dirname, '../frontend/dist'))
      ? path.join(__dirname, '../frontend/dist')
      : path.join(__dirname, '../frontend'));

app.use(express.static(frontendPath));

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    if (!supabase) {
      return false;
    }
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is fine
      console.error('❌ Supabase connection error:', error.message);
      console.log('💡 Please check your SUPABASE_URL and SUPABASE_ANON_KEY in .env');
      return false;
    }
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    return false;
  }
}

// Test connection on startup
testSupabaseConnection().then(connected => {
  if (!connected) {
    console.log('⚠️ Falling back to Local JSON File Database (c:\\TaskMaster\\backend\\config\\db.json) for this session.');
    global.useLocalDB = true;
  } else {
    global.useLocalDB = false;
  }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/staff', require('./routes/staff'));

// Health check
app.get('/api/health', async (req, res) => {
  const isConnected = await testSupabaseConnection();
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: isConnected ? 'Connected' : 'Disconnected',
    supabase: {
      url: process.env.SUPABASE_URL ? 'Configured' : 'Missing',
      anonKey: process.env.SUPABASE_ANON_KEY ? 'Configured' : 'Missing',
      serviceKey: process.env.SUPABASE_SERVICE_KEY ? 'Configured' : 'Missing'
    }
  });
});

// Serve main app (must come after API routes)
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// 404 handler for other routes - redirect to main app
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Main App: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`💾 Database: Supabase`);
  });
}

module.exports = app;

// Made with Bob
