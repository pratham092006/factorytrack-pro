const supabase = require('../config/supabase');
const dbFallback = require('../config/dbFallback');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    if (global.useLocalDB) {
      try {
        const user = await dbFallback.getUserByToken(token);
        req.user = {
          id: user.id,
          factory: user.factory,
          username: user.username,
          email: user.email
        };
        return next();
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user details from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user:', dbError);
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      factory: userData?.factory || user.user_metadata?.factory,
      username: userData?.username || user.user_metadata?.username,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = auth;

// Made with Bob
