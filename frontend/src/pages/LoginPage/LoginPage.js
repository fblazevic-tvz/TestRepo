import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    console.log("[LoginPage] Submit handler started.");

    try {
      console.log("[LoginPage] Calling loginUser service...");
      const loginData = await loginUser({ username, password });
      console.log("[LoginPage] loginUser service returned:", loginData);

      console.log("[LoginPage] loginData structure seems valid. Calling context login function...");
      login(loginData);
      console.log("[LoginPage] Context login function call completed.");
    } catch (err) {
      console.error("[LoginPage] Error caught in handleSubmit:", err);
      setError(err.message || 'Login failed. Please check credentials or console.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-box">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              required
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="button-primary login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
