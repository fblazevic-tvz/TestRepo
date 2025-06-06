import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || '/dashboard';
  console.log("Location object is : ", location)

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
      login(loginData, from);
      console.log("[LoginPage] Context login function call completed.");
    } catch (err) {
      console.error("[LoginPage] Error caught in handleSubmit:", err);
      setError(err.message || 'Prijava nije uspjela. Molimo provjerite podatke za prijavu.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-box">
        <h2>Prijavi se</h2>
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Korisničko ime</label>
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
            <label htmlFor="password">Lozinka</label>
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
            {loading ? 'Prijava...' : 'Prijava'}
          </button>
          <div className="signup-link">
            Nemate račun? <Link to="/signup">Registrirajte se</Link>
          </div>
          <div className="navigation-options">
            <Link to="/" className="home-link">← Natrag na početnu</Link>
            {location.state?.from && location.state.from !== '/login' && (
              <>
                <span className="separator">ili</span>
                <button
                  type="button"
                  onClick={() => navigate(location.state.from)}
                  className="text-button"
                >
                  Vrati se gdje si bio
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;