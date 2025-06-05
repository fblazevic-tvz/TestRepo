import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const goToLogin = () => navigate('/login');
  const goToRegister = () => navigate('/signup');

  return (
    <div className="navbar-container">
      <NavLink to="/" className="navbar-logo-link">
        <div className="navbar-logo">
          <img
              src="/logo.png" 
              alt="IzjasniSe Logo"
              className="navbar-logo-image" 
          />
        </div>
      </NavLink>

      <nav className="navbar-nav">
        <NavLink
          to="/proposals"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Natječaji
        </NavLink>
        <NavLink
          to="/suggestions"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Prijedlozi
        </NavLink>
        <NavLink
          to="/notices"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Obavijesti
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          O nama
        </NavLink>

        {isAuthenticated && <div className="nav-spacer"></div>}

        {isAuthenticated && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              Dashboard
            </NavLink>
          </>
        )}
      </nav>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <div className="user-actions">
            <div className="user-avatar">
              <div className="user-icon-placeholder"></div>
            </div>
            <button onClick={handleLogout} className="logout-button">Odjavi se</button>
          </div>
        ) : (
          <>
            <div className="auth-buttons">
              <button onClick={goToLogin} className="login-button">
                Prijavi se
              </button>
            </div>
            <div className="auth-buttons">
              <button onClick={goToRegister} className="register-button">
                Registriraj se
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
