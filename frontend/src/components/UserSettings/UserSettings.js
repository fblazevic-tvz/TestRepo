import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './UserSettings.css';
import { formatDateCroatian } from '../../utils/formatters';
import { uploadUserAvatar } from '../../services/userService';

function UserSettings({ user, onUserUpdated }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl);
  const fileInputRef = useRef(null);

  if (!user) {
    return (
      <div className="user-settings-container">
        <p>Učitavanje korisničkih podataka...</p>
      </div>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Molimo odaberite sliku (JPEG, PNG, GIF ili WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Slika ne smije biti veća od 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const result = await uploadUserAvatar(user.id, file);
      setAvatarUrl(result.avatarUrl);
      
      // Notify parent component if callback provided
      if (onUserUpdated) {
        onUserUpdated({ ...user, avatarUrl: result.avatarUrl });
      }
    } catch (error) {
      setUploadError(error.message || 'Greška pri učitavanju slike');
    } finally {
      setIsUploading(false);
    }
  };

  const getAvatarUrl = () => {
    if (avatarUrl) {
      return `${process.env.REACT_APP_API_BASE_URL.replace('/api', '')}${avatarUrl}`;
    }
    return null;
  };

  return (
    <div className="user-settings-container">
      <div className="user-info-card">
        <div className="user-avatar-section">
          <div className="user-avatar-large" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
            {getAvatarUrl() ? (
              <img 
                src={getAvatarUrl()} 
                alt="Korisnička slika" 
                className="user-avatar-image"
              />
            ) : (
              <div className="user-icon-placeholder-large"></div>
            )}
            {isUploading && (
              <div className="avatar-upload-overlay">
                <div className="upload-spinner"></div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button 
            className="button-secondary change-avatar-button" 
            onClick={handleAvatarClick}
            disabled={isUploading}
          >
            {isUploading ? 'Učitavanje...' : 'Promijeni sliku'}
          </button>
          {uploadError && (
            <p className="upload-error">{uploadError}</p>
          )}
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
            <label className="info-label">Status računa</label>
            <div className="info-value">
              <span className={`status-tag ${user.accountStatus === "Active" ? 'active' : 'banned'}`}>
                {user.accountStatus === "Active" ? 'Aktivan' : 'Zabranjen'}
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
    id: PropTypes.number,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    createdAt: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  onUserUpdated: PropTypes.func,
};

export default UserSettings;


