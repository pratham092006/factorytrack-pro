import React, { useState } from 'react';

export default function Settings({
  settings,
  onSaveSettings,
  onBackup,
  onRestore,
  onClearData,
  currentUser
}) {
  const [factoryName, setFactoryName] = useState(settings.factoryName || 'FactoryTrack Pro');
  const [currency, setCurrency] = useState(settings.currency || '₹');
  const [workingDays, setWorkingDays] = useState(settings.workingDaysPerMonth || 26);
  const [otMultiplier, setOtMultiplier] = useState(settings.otMultiplier || 1.5);
  const [newPassword, setNewPassword] = useState('');
  const [darkMode, setDarkMode] = useState(settings.darkMode || false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      factoryName,
      currency,
      workingDaysPerMonth: Number(workingDays),
      otMultiplier: Number(otMultiplier),
      darkMode,
      newPassword: newPassword || null
    });
    setNewPassword('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.data) {
          alert('Invalid backup file structure.');
          return;
        }
        if (window.confirm('Are you sure you want to restore? This will overwrite your existing data.')) {
          onRestore(parsed.data);
        }
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-title">System Settings</div>
          <div className="page-header-subtitle">Manage factory rules, payroll parameters, and database utilities</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-header">
            <div className="card-title">
              <span className="material-symbols-outlined">tune</span>
              Configuration & Profile
            </div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Factory / Organization Name</label>
              <input
                type="text"
                className="form-control"
                value={factoryName}
                onChange={e => setFactoryName(e.target.value)}
                required
              />
            </div>

            <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-control"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Standard Working Days/Mo</label>
                <input
                  type="number"
                  className="form-control"
                  value={workingDays}
                  onChange={e => setWorkingDays(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Overtime Hourly Multiplier</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={otMultiplier}
                onChange={e => setOtMultiplier(e.target.value)}
                required
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                Example: 1.5x means overtime hours are paid at 150% of the normal hourly rate.
              </small>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <input
                type="checkbox"
                id="darkModeToggle"
                checked={darkMode}
                onChange={e => setDarkMode(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="darkModeToggle" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                Enable Dark Theme
              </label>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {darkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

            <div className="form-group">
              <label className="form-label">Administrator Username</label>
              <input
                type="text"
                className="form-control"
                value={currentUser?.username || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (Optional)</label>
              <input
                type="password"
                className="form-control"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              <span className="material-symbols-outlined">save</span>
              Save Settings
            </button>
          </div>
        </form>

        {/* Database / Maintenance Tools */}
        <div className="card" style={{ gridColumn: 'span 1', height: 'fit-content' }}>
          <div className="card-header">
            <div className="card-title">
              <span className="material-symbols-outlined" style={{ color: 'var(--danger)' }}>settings_suggest</span>
              System Maintenance
            </div>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Backup Data</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
                Download a complete copy of all staff details, attendance sheets, advances, and savings ledgers to a JSON file.
              </p>
              <button onClick={onBackup} className="btn btn-outline" style={{ width: '100%' }}>
                <span className="material-symbols-outlined">cloud_download</span>
                Export System Backup
              </button>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Restore Data</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
                Restore the system database from a previously exported FactoryTrack Pro backup JSON file.
              </p>
              <label className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">cloud_upload</span>
                Upload Backup File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

            <div>
              <h4 style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--danger)', fontSize: '14px' }}>Danger Zone</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
                Permanently erase all employee profiles, attendance logs, and financial transaction history. This action is irreversible.
              </p>
              <button onClick={onClearData} className="btn btn-danger" style={{ width: '100%' }}>
                <span className="material-symbols-outlined">delete_forever</span>
                Erase All Database Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
