import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserById } from '../../services/userService';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserSettings from '../../components/UserSettings/UserSettings';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './SettingsPage.css';

function SettingsPage() {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser?.userId) {
        setError('User ID not available');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchUserById(authUser.userId);
        setUserData(data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError(err.message || 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [authUser]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-content">
        <h1>Moji podaci</h1>
        {isLoading && <LoadingSpinner />}
        {error && !isLoading && (
          <div className="alert alert-danger">
            Greška pri učitavanju podataka: {error}
          </div>
        )}
        {!isLoading && userData && (
          <UserSettings user={userData} />
        )}
      </main>
    </div>
  );
}

export default SettingsPage;