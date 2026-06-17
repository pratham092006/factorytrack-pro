const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const dbFallback = require('../config/dbFallback');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { factory, username, email, password } = req.body;

    if (!factory || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Factory, username, email, and password are required'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (global.useLocalDB) {
      try {
        const user = await dbFallback.registerUser(cleanEmail, password, username, factory);
        return res.status(201).json({
          success: true,
          database: 'local',
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

    // Check if user already exists in database
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    let authData;
    let authError;
    const clientUrl = process.env.CLIENT_URL || req.headers.referer || `${req.protocol}://${req.get('host')}`;

    try {
      // Try to create the user directly with email auto-confirmed via Admin API (requires service key)
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          factory: factory,
          username: username
        }
      });

      if (adminError) {
        const isAuthError = adminError.status === 401 || 
                            adminError.status === 403 || 
                            adminError.message?.toLowerCase().includes('service_role') || 
                            adminError.message?.toLowerCase().includes('not allowed');
        if (isAuthError) {
          console.log('Admin user creation unauthorized, falling back to standard signUp...');
          const signUpResult = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              emailRedirectTo: clientUrl,
              data: {
                factory: factory,
                username: username
              }
            }
          });
          authData = signUpResult.data;
          authError = signUpResult.error;
        } else {
          authData = adminData;
          authError = adminError;
        }
      } else {
        authData = adminData;
        console.log('✅ User created and confirmed via Admin API successfully');
      }
    } catch (adminErr) {
      console.warn('Admin user creation failed, falling back to standard signUp:', adminErr.message);
      const signUpResult = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: clientUrl,
          data: {
            factory: factory,
            username: username
          }
        }
      });
      authData = signUpResult.data;
      authError = signUpResult.error;
    }

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    const userId = authData?.user?.id || authData?.session?.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Registration succeeded in auth provider but failed to return user data.'
      });
    }

    // Also store user info in users table
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          factory: factory,
          username: username,
          email: cleanEmail,
          created_at: new Date().toISOString()
        }
      ]);

    if (dbError) {
      console.error('Error storing user in database:', dbError);
    }

    res.status(201).json({
      success: true,
      database: 'supabase',
      message: 'User registered successfully',
      user: {
        id: userId,
        factory: factory,
        username: username,
        email: cleanEmail
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (global.useLocalDB) {
      try {
        const { user, token } = await dbFallback.loginUser(cleanEmail, password);
        return res.json({
          success: true,
          database: 'local',
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
      email: cleanEmail,
      password: password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    const userId = data?.user?.id || data?.session?.user?.id;
    const token = data?.session?.access_token;

    if (!userId || !token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or login session could not be established'
      });
    }

    // Fetch user details from database to return original factory name and username
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (dbError) {
      console.error('Error fetching user info after login:', dbError);
    }

    res.json({
      success: true,
      database: 'supabase',
      token,
      user: {
        id: userId,
        factory: userData?.factory || data?.user?.user_metadata?.factory || 'FactoryTrack Pro',
        username: userData?.username || data?.user?.user_metadata?.username || 'User',
        email: cleanEmail
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
          database: 'local',
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
    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;

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
      database: 'supabase',
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
