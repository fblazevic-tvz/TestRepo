import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get the full avatar URL
  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      // If avatarUrl starts with '/', it's a relative path
      if (user.avatarUrl.startsWith('/')) {
        // Extract base URL without /api
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7003/api';
        const baseUrl = apiBaseUrl.replace('/api', '');
        return `${baseUrl}${user.avatarUrl}`;
      }
      // Otherwise, assume it's already a full URL
      return user.avatarUrl;
    }
    return null;
  };

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

  const avatarUrl = getAvatarUrl();

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
            <div className="user-avatar" onClick={() => navigate('/dashboard/settings')}>
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={user?.username || 'User avatar'} 
                  className="user-avatar-image"
                  onError={(e) => {
                    console.error('Failed to load avatar:', avatarUrl);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="user-icon-placeholder" 
                style={avatarUrl ? { display: 'none' } : {}}
              ></div>
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