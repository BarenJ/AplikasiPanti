// src/components/Login.js
import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.login(username, password);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      const roleName = response.user.role === 'admin' ? 'Administrator' : 'Staff';
      alert(`✅ Login berhasil! Selamat datang, ${response.user.full_name} (${roleName})`);
      onLogin(response.user, response.token);
    } catch (err) {
      setError(err.error || 'Login gagal. Silakan periksa kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear form function
  const handleClearForm = () => {
    setUsername('');
    setPassword('');
    setError('');
  };

  // Demo credentials for testing
  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('staff');
      setPassword('staff123');
    }
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="login-card" style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div className="text-center mb-4">
          <i className="fas fa-heartbeat" style={{
            fontSize: '4rem',
            color: '#667eea',
            marginBottom: '20px'
          }}></i>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Panti Werdha Kasih Karunia</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Sistem Manajemen Penghuni</p>
          
          {/* Role badges */}
          <div className="d-flex justify-content-center gap-2 mt-3">
            <span className="badge bg-primary">Administrator</span>
            <span className="badge bg-success">Staff</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-user"></i>
              </span>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Remember Me & Clear Form */}
          <div className="mb-4 d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Ingat saya
              </label>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleClearForm}
              disabled={isLoading}
            >
              <i className="fas fa-broom me-1"></i> Bersihkan
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-primary w-100 py-3 mb-3"
            disabled={isLoading}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Memproses...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i>
                Masuk ke Sistem
              </>
            )}
          </button>

          {/* Demo Credentials - Only for development/testing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="demo-credentials mb-4">
              <h6 className="text-center mb-3" style={{ color: '#666' }}>
                <i className="fas fa-vial me-2"></i>Demo Credentials
              </h6>
              <div className="row g-2">
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={() => fillDemoCredentials('admin')}
                    disabled={isLoading}
                  >
                    <i className="fas fa-user-tie me-1"></i> Admin
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-outline-success w-100"
                    onClick={() => fillDemoCredentials('staff')}
                    disabled={isLoading}
                  >
                    <i className="fas fa-user me-1"></i> Staff
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Information Section */}
          <div className="card mt-4">
            <div className="card-body p-3">
              <h6 className="card-title mb-2">
                <i className="fas fa-info-circle text-info me-2"></i>
                Informasi Login
              </h6>
              <ul className="list-unstyled mb-0" style={{ fontSize: '0.85rem' }}>
                <li><i className="fas fa-user-tie text-primary me-2"></i><strong>Admin:</strong> Akses lengkap semua fitur</li>
                <li><i className="fas fa-user text-success me-2"></i><strong>Staff:</strong> Akses terbatas untuk input data</li>
                <li><i className="fas fa-key text-warning me-2"></i>Hubungi admin jika lupa password</li>
              </ul>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center">
            <small className="text-muted d-block">
              <i className="fas fa-shield-alt me-1"></i>
              Pastikan Anda adalah pengguna yang berwenang
            </small>
            <small className="text-muted d-block mt-1">
              Versi 1.0.0 • © 2024 Panti Werdha Kasih Karunia
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;