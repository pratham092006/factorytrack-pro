import React, { useState } from 'react';
import { loginUser, registerUser } from '../api';

export default function Auth({ onLoginSuccess }) {
  const [tab, setTab] = useState('login');
  
  // Login fields
  const [loginFactory, setLoginFactory] = useState('');
  const [loginUserVal, setLoginUserVal] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Register fields
  const [regFactory, setRegFactory] = useState('');
  const [regUserVal, setRegUserVal] = useState('');
  const [regPass, setRegPass] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginFactory || !loginUserVal || !loginPass) {
      setErrorMsg('Please fill all fields.');
      return;
    }
    
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      const data = await loginUser(loginFactory, loginUserVal, loginPass);
      if (data.success) {
        onLoginSuccess(data.user, data.token);
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
    if (!regFactory || !regUserVal || !regPass) {
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
      const data = await registerUser(regFactory, regUserVal, regPass);
      if (data.success) {
        setSuccessMsg('Registration successful! Please sign in.');
        setTab('login');
        // Pre-fill login info
        setLoginFactory(regFactory);
        setLoginUserVal(regUserVal);
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
            onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Login
          </div>
          <div 
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
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
              <label className="form-label">Factory Code / Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. acme"
                value={loginFactory}
                onChange={e => setLoginFactory(e.target.value.trim().toLowerCase())}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. admin"
                value={loginUserVal}
                onChange={e => setLoginUserVal(e.target.value.trim().toLowerCase())}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                required
              />
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
                onChange={e => setRegFactory(e.target.value.trim().toLowerCase())}
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
                onChange={e => setRegUserVal(e.target.value.trim().toLowerCase())}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Minimum 6 characters"
                value={regPass}
                onChange={e => setRegPass(e.target.value)}
                required
              />
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
