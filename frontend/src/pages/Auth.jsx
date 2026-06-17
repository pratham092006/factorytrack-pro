import React, { useState } from 'react';
import { loginUser, registerUser } from '../api';

export default function Auth({ onLoginSuccess }) {
  const [tab, setTab] = useState('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Register fields
  const [regFactory, setRegFactory] = useState('');
  const [regUserVal, setRegUserVal] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      setErrorMsg('Please fill all fields.');
      return;
    }
    
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      const data = await loginUser(loginEmail, loginPass);
      if (data.success) {
        onLoginSuccess(data.user, data.database);
      } else {
        setErrorMsg(data.message || 'Login failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regFactory || !regUserVal || !regEmail || !regPass) {
      setErrorMsg('Please fill all fields.');
      return;
    }
    
    if (regPass.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      const data = await registerUser(regFactory.trim(), regUserVal.trim(), regEmail.trim(), regPass);
      if (data.success) {
        setSuccessMsg('Registration successful! Please sign in.');
        setTab('login');
        // Pre-fill login email
        setLoginEmail(regEmail.trim());
        setLoginPass('');
        setShowPassword(false);
      } else {
        setErrorMsg(data.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <span className="material-symbols-outlined">precision_manufacturing</span>
          </div>
          <h1>FactoryTrack Pro</h1>
          <p>Industrial Management Dashboard</p>
        </div>

        <div className="auth-tabs">
          <div 
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); setShowPassword(false); }}
          >
            Login
          </div>
          <div 
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); setShowPassword(false); }}
          >
            Register
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
            {successMsg}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="e.g. manager@factory.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper" style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control" 
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button 
                  type="button"
                  className="show-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Factory / Company Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Acme Manufacturing"
                value={regFactory}
                onChange={e => setRegFactory(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. john"
                value={regUserVal}
                onChange={e => setRegUserVal(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="e.g. john@factory.com"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper" style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control" 
                  placeholder="Minimum 6 characters"
                  value={regPass}
                  onChange={e => setRegPass(e.target.value)}
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button 
                  type="button"
                  className="show-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
