import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchUserById } from '../../services/userService';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserSettings from '../../components/UserSettings/UserSettings';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './UserDetailPage.css';

function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || isNaN(parseInt(userId))) {
      setError('Invalid user ID');
      setIsLoading(false);
      return;
    }

    const loadUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchUserById(userId);
        setUserData(data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError(err.message || 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  const goBack = () => {
    navigate('/dashboard/users');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-content">
        <div className="back-link-container">
          <button onClick={goBack} className="back-link-button">
            ← Natrag na korisnike
          </button>
        </div>

        <h1>Detalji korisnika</h1>
        
        {isLoading && <LoadingSpinner />}
        
        {error && !isLoading && (
          <div className="alert alert-danger">
            Greška: {error}
            <br />
            <Link to="/dashboard/users">Vrati se na popis korisnika</Link>
          </div>
        )}
        
        {!isLoading && userData && (
          <UserSettings user={userData} />
        )}
      </main>
    </div>
  );
}

export default UserDetailPage;