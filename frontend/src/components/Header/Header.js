import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css'; 

function Header() {
  const { isAuthenticated, user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
      try {
          await logout(); 
      } catch (error) {
          console.error("Logout failed:", error);
      }
  };

  return (
    <header className="app-header">
      <Link to="/" className="header-logo">IzjasniSe</Link>
      <nav className="header-nav">
        {isAuthenticated ? (
          <>
            <span className="header-welcome">Dobro došli, {user?.username || 'User'}!</span>
            <button onClick={handleLogout} className="header-button">Odjava</button>
          </>
        ) : (
          <>
            <Link to="/login" className="header-link">Prijava</Link>
            <Link to="/signup" className="header-link">Registracija</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;