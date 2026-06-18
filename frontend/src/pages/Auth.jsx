import React, { useState } from 'react';
import { loginUser, registerUser } from '../api';

export default function Auth({ onLoginSuccess }) {
  const [tab, setTab] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass]   = useState('');

  const [regFactory, setRegFactory] = useState('');
  const [regUserVal, setRegUserVal] = useState('');
  const [regEmail, setRegEmail]     = useState('');
  const [regPass, setRegPass]       = useState('');

  const [errorMsg, setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]     = useState(false);
  const [showLoginPass, setShowLoginPass]   = useState(false);
  const [showRegPass,   setShowRegPass]     = useState(false);

  const switchTab = (t) => {
    setTab(t);
    setErrorMsg('');
    setSuccessMsg('');
    setShowLoginPass(false);
    setShowRegPass(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) { setErrorMsg('Please fill all fields.'); return; }
    setErrorMsg(''); setSuccessMsg(''); setLoading(true);
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
      setErrorMsg('Please fill all fields.'); return;
    }
    if (regPass.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    setErrorMsg(''); setSuccessMsg(''); setLoading(true);
    try {
      const data = await registerUser(regFactory.trim(), regUserVal.trim(), regEmail.trim(), regPass);
      if (data.success) {
        setSuccessMsg('Account created! Please sign in.');
        switchTab('login');
        setLoginEmail(regEmail.trim());
        setLoginPass('');
      } else {
        setErrorMsg(data.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error during registration.');
    } finally {
      setLoading(false);
    }
  };

  /* ── shared eye-button style ── */
  const eyeBtnStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  };

  return (
    <div className="auth-container">
      {/* Animated background blobs */}
      <div className="auth-bg-blob auth-bg-blob-1" />
      <div className="auth-bg-blob auth-bg-blob-2" />
      <div className="auth-bg-blob auth-bg-blob-3" />

      <div className="auth-card fade-in">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <span className="material-symbols-outlined">precision_manufacturing</span>
          </div>
          <h1>FactoryTrack Pro</h1>
          <p>Industrial Management Dashboard</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <div
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
            role="tab"
            aria-selected={tab === 'login'}
          >
            Sign In
          </div>
          <div
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
            role="tab"
            aria-selected={tab === 'register'}
          >
            Register
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>error</span>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>check_circle</span>
            {successMsg}
          </div>
        )}

        {/* ── Login Form ── */}
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
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                  required
                />
                <button
                  type="button"
                  style={eyeBtnStyle}
                  onClick={() => setShowLoginPass(v => !v)}
                  aria-label={showLoginPass ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showLoginPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '4px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', margin: 0 }} />
                  Signing In…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

        ) : (
          /* ── Register Form ── */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Factory / Company Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Acme Manufacturing"
                value={regFactory}
                onChange={e => setRegFactory(e.target.value)}
                autoComplete="organization"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. john"
                  value={regUserVal}
                  onChange={e => setRegUserVal(e.target.value)}
                  autoComplete="username"
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
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showRegPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={regPass}
                  onChange={e => setRegPass(e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: '44px' }}
                  required
                />
                <button
                  type="button"
                  style={eyeBtnStyle}
                  onClick={() => setShowRegPass(v => !v)}
                  aria-label={showRegPass ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showRegPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '4px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', margin: 0 }} />
                  Creating Account…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">person_add</span>
                  Create Account
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: 1.6
        }}>
          By using FactoryTrack Pro you agree to our{' '}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Terms of Service</span>.
        </p>
      </div>
    </div>
  );
}
