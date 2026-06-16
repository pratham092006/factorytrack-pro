const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const dbFallback = require('../config/dbFallback');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { factory, username, password } = req.body;

    if (!factory || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Factory, username, and password are required'
      });
    }

    if (global.useLocalDB) {
      try {
        const user = await dbFallback.registerUser(factory, username, password);
        return res.status(201).json({
          success: true,
          message: 'User registered successfully (Local Fallback DB)',
          user: {
            id: user.id,
            factory: user.factory,
            username: user.username,
            email: user.email
          }
        });
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
    }

    // Create user with Supabase Auth
    const email = `${username}@${factory}.factorytrack.local`;
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          factory: factory,
          username: username
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Also store user info in users table
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          factory: factory,
          username: username,
          email: email,
          created_at: new Date().toISOString()
        }
      ]);

    if (dbError) {
      console.error('Error storing user in database:', dbError);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: data.user.id,
        factory: factory,
        username: username,
        email: email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { factory, username, password } = req.body;

    if (!factory || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Factory, username, and password are required'
      });
    }

    const email = `${username}@${factory}.factorytrack.local`;

    if (global.useLocalDB) {
      try {
        const { user, token } = await dbFallback.loginUser(factory, username, password);
        return res.json({
          success: true,
          token,
          user: {
            id: user.id,
            factory: user.factory,
            username: user.username,
            email: user.email
          }
        });
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: err.message
        });
      }
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        factory: factory,
        username: username,
        email: email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    if (global.useLocalDB) {
      try {
        const user = await dbFallback.getUserByToken(token);
        return res.json({
          success: true,
          user: {
            id: user.id,
            factory: user.factory,
            username: user.username,
            email: user.email
          }
        });
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: err.message
        });
      }
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Get user details from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('Error fetching user:', dbError);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        factory: userData?.factory || user.user_metadata?.factory,
        username: userData?.username || user.user_metadata?.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token && !global.useLocalDB && supabase) {
      await supabase.auth.signOut();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

module.exports = router;

// Made with Bob
