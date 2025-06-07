import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadUserAvatar } from '../../services/userService';
import './UserSettings.css';

function UserSettings({ user }) {
  const { updateUserAvatar } = useAuth();
  const [userData, setUserData] = useState(user);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Molimo odaberite važeću sliku (JPEG, PNG, GIF ili WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Slika mora biti manja od 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await uploadUserAvatar(user.id, file);
      
      // Update the local user data
      setUserData(prev => ({
        ...prev,
        avatarUrl: response.avatarUrl
      }));

      // Update the auth context with new avatar URL
      updateUserAvatar(response.avatarUrl);

      setSuccessMessage('Slika profila uspješno ažurirana!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError(err.message || 'Greška pri učitavanju slike');
    } finally {
      setIsUploading(false);
    }
  };

  const getAvatarUrl = () => {
    if (userData.avatarUrl) {
      if (userData.avatarUrl.startsWith('/')) {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7003/api';
        const baseUrl = apiBaseUrl.replace('/api', '');
        return `${baseUrl}${userData.avatarUrl}`;
      }
      return userData.avatarUrl;
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="user-settings">
      <div className="settings-section">
        <h2>Podaci o korisniku</h2>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        <div className="avatar-section">
          <h3>Slika profila</h3>
          <div className="avatar-upload-container">
            <div className="current-avatar">
              {avatarUrl ? (
                <img 
                  src={avatarUrl}
                  alt="Trenutna slika profila" 
                  className="avatar-preview"
                  onError={(e) => {
                    console.error('Failed to load avatar in settings:', avatarUrl);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="avatar-placeholder"
                style={avatarUrl ? { display: 'none' } : {}}
              >
                <span>Nema slike</span>
              </div>
            </div>
            <div className="avatar-upload-controls">
              <input
                type="file"
                id="avatar-upload"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="avatar-upload" 
                className="button-primary upload-button"
                style={{ 
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.6 : 1
                }}
              >
                {isUploading ? 'Učitavanje...' : 'Promijeni sliku'}
              </label>
              <p className="upload-hint">Maksimalna veličina: 5MB. Podržani formati: JPEG, PNG, GIF, WebP</p>
            </div>
          </div>
        </div>

        <div className="user-info-section">
          <div className="info-grid">
            <div className="info-item">
              <label>Korisničko ime:</label>
              <p>{userData.userName || 'N/A'}</p>
            </div>
            
            <div className="info-item">
              <label>Email:</label>
              <p>{userData.email || 'N/A'}</p>
            </div>
            
            <div className="info-item">
              <label>Uloga:</label>
              <p>
                {userData.role === 'Admin' && 'Administrator'}
                {userData.role === 'Moderator' && 'Moderator'}
                {userData.role === 'Regular' && 'Korisnik'}
              </p>
            </div>
            
            <div className="info-item">
              <label>Status računa:</label>
              <p className={`status ${userData.accountStatus === 'Active' ? 'status-active' : 'status-banned'}`}>
                {userData.accountStatus === 'Active' ? 'Aktivan' : 'Blokiran'}
              </p>
            </div>
            
            <div className="info-item">
              <label>Datum registracije:</label>
              <p>{formatDate(userData.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;