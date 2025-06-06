import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchMySuggestions, deleteSuggestion } from '../../services/suggestionService';
import { fetchMyProposals, deleteProposal } from '../../services/proposalService';
import Sidebar from '../../components/Sidebar/Sidebar';
import SuggestionList from '../../components/SuggestionList/SuggestionList';
import ProposalList from '../../components/ProposalList/ProposalList';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [mySuggestions, setMySuggestions] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [itemToDeleteType, setItemToDeleteType] = useState(null); // 'suggestion' or 'proposal'
  const [isDeleting, setIsDeleting] = useState(false);

  const isModerator = user?.role === 'Moderator';
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (isAdmin) {
      navigate('/dashboard/users', { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (user?.userId && !isAdmin) {
      setIsLoading(true);
      setError('');
      console.log("User unutar dashboard : " ,user);
      if (isModerator) {
        // Load proposals for moderator
        fetchMyProposals(user.userId)
          .then(data => {
            setMyProposals(data);
          })
          .catch(err => {
            console.error("Error fetching moderator proposals:", err);
            setError(err.message || 'Greška pri dohvaćanju vaših natječaja.');
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // Load suggestions for regular user
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
      }
    }
  }, [user, isModerator, isAdmin]);

  const handleEditSuggestion = useCallback((suggestionId) => {
    console.log(`Navigating to edit page for suggestion ID: ${suggestionId}`);
    navigate(`/suggestions/edit/${suggestionId}`);
  }, [navigate]);

  const handleDeleteSuggestion = useCallback((suggestionId) => {
    console.log(`Requesting delete confirmation for suggestion ID: ${suggestionId}`);
    setItemToDeleteId(suggestionId);
    setItemToDeleteType('suggestion');
    setIsModalOpen(true);
    setError('');
  }, []);

  const handleEditProposal = useCallback((proposalId) => {
    console.log(`Navigating to edit page for proposal ID: ${proposalId}`);
    navigate(`/proposals/edit/${proposalId}`);
  }, [navigate]);

  const handleDeleteProposal = useCallback((proposalId) => {
    console.log(`Requesting delete confirmation for proposal ID: ${proposalId}`);
    setItemToDeleteId(proposalId);
    setItemToDeleteType('proposal');
    setIsModalOpen(true);
    setError('');
  }, []);

  const handleCloseModal = useCallback(() => {
    if (isDeleting) return;
    setIsModalOpen(false);
    setItemToDeleteId(null);
    setItemToDeleteType(null);
    setError('');
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDeleteId || !itemToDeleteType) return;

    console.log(`Confirmed delete for ${itemToDeleteType} ID: ${itemToDeleteId}`);
    setIsDeleting(true);
    setError('');
    
    try {
      if (itemToDeleteType === 'suggestion') {
        await deleteSuggestion(itemToDeleteId);
        setMySuggestions(prev => prev.filter(s => s.id !== itemToDeleteId));
        console.log(`Suggestion ${itemToDeleteId} deleted successfully.`);
      } else if (itemToDeleteType === 'proposal') {
        await deleteProposal(itemToDeleteId);
        setMyProposals(prev => prev.filter(p => p.id !== itemToDeleteId));
        console.log(`Proposal ${itemToDeleteId} deleted successfully.`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err.message || `Brisanje ${itemToDeleteType === 'suggestion' ? 'prijedloga' : 'natječaja'} nije uspjelo.`);
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
      setItemToDeleteId(null);
      setItemToDeleteType(null);
    }
  }, [itemToDeleteId, itemToDeleteType]);

  const handleCreateProposal = () => {
    navigate('/create-proposal');
  };

  // Don't render for admin
  if (isAdmin) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-content">
        <h1>Upravljačka ploča</h1>
        {user ? (
          <p className="welcome-message">Dobrodošli, {user.username}!</p>
        ) : (
          <p>Učitavanje...</p>
        )}
        
        <section className="dashboard-section">
          {isModerator ? (
            <>
              <div className="section-header">
                <h2>Moji natječaji</h2>
                <button 
                  className="button-primary create-button" 
                  onClick={handleCreateProposal}
                >
                  Stvori novi natječaj
                </button>
              </div>
              {(isLoading || isDeleting) && <LoadingSpinner />}
              {error && <div className="alert alert-danger">Greška: {error}</div>}
              {!isLoading && !error && (
                myProposals.length > 0 ? (
                  <ProposalList
                    proposals={myProposals}
                    showActions={true}
                    onEdit={handleEditProposal}
                    onDelete={handleDeleteProposal}
                  />
                ) : (
                  <p className="no-items-message">Nemate još natječaja.</p>
                )
              )}
            </>
          ) : (
            <>
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
                  <p className="no-items-message">Nemate još prijedloga.</p>
                )
              )}
            </>
          )}
        </section>
      </main>
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Potvrdi brisanje"
        message={`Jeste li sigurni da želite trajno obrisati ${itemToDeleteType === 'suggestion' ? 'ovaj prijedlog' : 'ovaj natječaj'}? Ova akcija ne može biti poništena.`}
        confirmText="Obriši"
        cancelText="Odustani"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default DashboardPage;