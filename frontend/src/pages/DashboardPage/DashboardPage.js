import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchMySuggestions, deleteSuggestion } from '../../services/suggestionService';
import Sidebar from '../../components/Sidebar/Sidebar';
import SuggestionList from '../../components/SuggestionList/SuggestionList';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [mySuggestions, setMySuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestionToDeleteId, setSuggestionToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      setIsLoading(true);
      setError('');
      fetchMySuggestions()
        .then(data => {
          setMySuggestions(data);
        })
        .catch(err => {
          console.error("Error fetching user suggestions:", err);
          setError(err.message || 'Greška pri dohvaćanju vaših prijedloga.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setMySuggestions([]);
    }
  }, [user]);

  const handleEditSuggestion = useCallback((suggestionId) => {
    console.log(`Navigating to edit page for suggestion ID: ${suggestionId}`);
    navigate(`/suggestions/edit/${suggestionId}`);
  }, [navigate]);

  const handleDeleteSuggestion = useCallback((suggestionId) => {
    console.log(`Requesting delete confirmation for suggestion ID: ${suggestionId}`);
    setSuggestionToDeleteId(suggestionId);
    setIsModalOpen(true);
    setError('');
  }, []);

  const handleCloseModal = useCallback(() => {
    if (isDeleting) return;
    setIsModalOpen(false);
    setSuggestionToDeleteId(null);
    setError('');
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!suggestionToDeleteId) return;

    console.log(`Confirmed delete for suggestion ID: ${suggestionToDeleteId}`);
    setIsDeleting(true);
    setError('');
    try {
      await deleteSuggestion(suggestionToDeleteId);
      setMySuggestions(prev => prev.filter(s => s.id !== suggestionToDeleteId));
      console.log(`Suggestion ${suggestionToDeleteId} deleted successfully.`);
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err.message || "Brisanje prijedloga nije uspjelo.");
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
      setSuggestionToDeleteId(null);
    }
  }, [suggestionToDeleteId]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-content">
        <h1>Dashboard</h1>
        {user ? (
          <p className="welcome-message">Dobrodošli!</p>
        ) : (
          <p>Učitavanje...</p>
        )}
        <section className="dashboard-section">
          <h2>Moji prijedlozi</h2>
          {(isLoading || isDeleting) && <LoadingSpinner />}
          {error && <div className="alert alert-danger">Greška: {error}</div>}
          {!isLoading && !error && (
            mySuggestions.length > 0 ? (
              <SuggestionList
                suggestions={mySuggestions}
                showActions={true}
                onEdit={handleEditSuggestion}
                onDelete={handleDeleteSuggestion}
              />
            ) : (
              <></>
            )
          )}
        </section>
      </main>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Potvrdi Brisanje"
        message={`Jeste li sigurni da želite trajno obrisati ovaj prijedlog? Ova akcija ne može biti poništena.`}
        confirmText="Obriši"
        cancelText="Odustani"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default DashboardPage;
