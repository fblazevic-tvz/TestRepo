import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const navbar = event.target.closest('.navbar-container');
      const isClickInsideNavbar = navbar !== null;
      
      if (!isClickInsideNavbar && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const goToLogin = () => {
    navigate('/login', {state: {from: location}});
    setIsMobileMenuOpen(false);
  };

  const goToRegister = () => {
    navigate('/signup', { state: {from: location}});
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="navbar-container">
      <NavLink to="/" className="navbar-logo-link" onClick={handleNavLinkClick}>
        <div className="navbar-logo">
          <img
              src="/logo.png" 
              alt="IzjasniSe Logo"
              className="navbar-logo-image" 
          />
        </div>
      </NavLink>

      <nav className={`navbar-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLink
          to="/proposals"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          onClick={handleNavLinkClick}
        >
          Natječaji
        </NavLink>
        <NavLink
          to="/suggestions"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          onClick={handleNavLinkClick}
        >
          Prijedlozi
        </NavLink>
        <NavLink
          to="/notices"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          onClick={handleNavLinkClick}
        >
          Obavijesti
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          onClick={handleNavLinkClick}
        >
          O nama
        </NavLink>

        {isAuthenticated && <div className="nav-spacer"></div>}

        {isAuthenticated && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              onClick={handleNavLinkClick}
            >
              Upravljačka ploča
            </NavLink>
          </>
        )}

        {!isAuthenticated && (
          <div className="mobile-auth-buttons">
            <button onClick={goToLogin} className="login-button">
              Prijavi se
            </button>
            <button onClick={goToRegister} className="register-button">
              Registriraj se
            </button>
          </div>
        )}

        {isAuthenticated && (
          <div className="mobile-auth-buttons">
            <button onClick={handleLogout} className="logout-button">
              Odjavi se
            </button>
          </div>
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
              <button onClick={goToRegister} className="register-button">
                Registriraj se
              </button>
            </div>
          </>
        )}
      </div>

      <button 
        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation menu"
      >
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>
  );
}

export default Navbar;