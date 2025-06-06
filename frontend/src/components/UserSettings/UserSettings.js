import React from 'react';
import PropTypes from 'prop-types';
import './UserSettings.css';
import { formatDateCroatian } from '../../utils/formatters';

function UserSettings({ user }) {
  if (!user) {
    return (
      <div className="user-settings-container">
        <p>Učitavanje korisničkih podataka...</p>
      </div>
    );
  }



  return (
    <div className="user-settings-container">
      
      <div className="user-info-card">
        <div className="user-avatar-section">
          <div className="user-avatar-large">
            <div className="user-icon-placeholder-large"></div>
          </div>
          <button className="button-secondary change-avatar-button" disabled>
            Promijeni sliku
          </button>
        </div>

        <div className="user-details-section">
          <div className="info-group">
            <label className="info-label">Korisničko ime</label>
            <div className="info-value">{user.userName || 'N/A'}</div>
          </div>

          <div className="info-group">
            <label className="info-label">Email</label>
            <div className="info-value">{user.email || 'N/A'}</div>
          </div>

          <div className="info-group">
            <label className="info-label">Uloga</label>
            <div className="info-value role-badge">
              <span className={`role-tag ${user.role?.toLowerCase() || 'user'}`}>
                {user.role || 'Korisnik'}
              </span>
            </div>
          </div>

          <div className="info-group">
            <label className="info-label">Datum registracije</label>
            <div className="info-value">{formatDateCroatian(user.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

UserSettings.propTypes = {
  user: PropTypes.shape({
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    createdAt: PropTypes.string,
  }),
};

export default UserSettings;