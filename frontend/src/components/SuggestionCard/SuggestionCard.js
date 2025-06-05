import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toggleVote } from '../../services/voteService';
import { formatDateCroatian, formatCurrencyEuroCroatian } from '../../utils/formatters';

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import Tooltip from '@mui/material/Tooltip';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

import './SuggestionCard.css';

function SuggestionCard({ suggestion, showActions = false, onEdit, onDelete, onVoteToggled }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, votedSuggestionIds, updateUserVoteStatus } = useAuth();

  const [localVoteCount, setLocalVoteCount] = useState(suggestion?.votes?.length || 0);
  const [isVoteLoading, setIsVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState('');

  const {
    id, name = "N/A", description = "Ne postoji.",
    estimatedCost = null, status = null, createdAt = null,
    proposal = null, author = null, location = null,
  } = suggestion || {};

  const hasVoted = suggestion?.id ? votedSuggestionIds.has(suggestion.id) : false;

  useEffect(() => {
    setLocalVoteCount(suggestion?.votes?.length || 0);
  }, [suggestion]);

  const handleVoteToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setVoteError("Morate biti prijavljeni da biste glasali.");
      return;
    }
    if (!id) return;

    setIsVoteLoading(true);
    setVoteError('');

    const previousVoteCount = localVoteCount;
    setLocalVoteCount(prev => hasVoted ? prev - 1 : prev + 1);

    try {
      const result = await toggleVote(id);
      updateUserVoteStatus(id, result.userHasVoted);
      if (onVoteToggled) {
        onVoteToggled(id, result.newVoteCount, result.userHasVoted);
      }
      setLocalVoteCount(result.newVoteCount);
      console.log("Vote toggled successfully:", result);
    } catch (err) {
      console.error("Vote toggle failed:", err);
      setVoteError(err.message || "Glasanje nije uspjelo.");
      setLocalVoteCount(previousVoteCount);
    } finally {
      setIsVoteLoading(false);
    }
  };

  const proposalName = proposal?.name || "Nije dostupno";
  const authorName = author?.userName || "Nije dostupno";
  const locationName = location?.name || location?.address || "Nije dostupno";

  const shortDescription = description.length > 100
    ? description.substring(0, 100) + '...'
    : description;

  const goToDetails = () => {
    if (id) {
      navigate(`/suggestions/${id}`);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit && id) {
      onEdit(id);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete && id) {
      onDelete(id);
    }
  };

  return (
    <div className="suggestion-card">
      <img
        src="/suggestion.jpg"
        alt="Vizualni prikaz za prijedlog"
        className="suggestion-card-image"
        loading="lazy"
      />

      <div className="suggestion-card-content">
        <div className="suggestion-card-title-category">
          <p className="suggestion-card-category">{proposalName} / {locationName}</p>
          <h3 className="suggestion-card-title">{name}</h3>
          <p className="suggestion-card-meta">
            Status: {status} | Trošak: {formatCurrencyEuroCroatian(estimatedCost)} | Glasovi: {localVoteCount}
          </p>
        </div>

        <p className="suggestion-card-paragraph">{shortDescription}</p>

        <div className="suggestion-card-user-card">
          <div className="suggestion-user-thumb"><div className="user-icon-placeholder-card"></div></div>
          <div className="suggestion-user-details">
            <span className="suggestion-user-name">{authorName}</span>
            <span className="suggestion-user-role">Podneseno: {formatDateCroatian(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="suggestion-card-buttons-group">
        <button onClick={goToDetails} className="suggestion-card-button-primary details-button">
          Detalji
        </button>

        <div className="suggestion-card-vote-action">
          <Tooltip title={hasVoted ? "Ukloni glas" : "Glasaj za"}>
            <span>
              <IconButton
                size="small"
                onClick={handleVoteToggle}
                disabled={isVoteLoading || !isAuthenticated}
                className={`suggestion-action-icon-button vote-button ${hasVoted ? 'voted' : ''}`}
                aria-label={hasVoted ? "Ukloni glas" : "Glasaj za prijedlog"}
              >
                {hasVoted ? <ThumbUpAltIcon fontSize="small" /> : <ThumbUpOffAltIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
          <span className="vote-count-display">{localVoteCount}</span>
          {voteError && <span className="vote-error-inline">{voteError}</span>}
        </div>

        {showActions ? (
          <div className="suggestion-card-actions">
            <Tooltip title="Uredi Prijedlog">
              <IconButton size="small" onClick={handleEditClick} className="suggestion-action-icon-button edit">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Obriši Prijedlog">
              <IconButton size="small" onClick={handleDeleteClick} className="suggestion-action-icon-button delete">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        ) : (
          <div className="suggestion-card-actions-placeholder"></div>
        )}
      </div>
    </div>
  );
}

SuggestionCard.propTypes = {
  suggestion: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    estimatedCost: PropTypes.number,
    status: PropTypes.number,
    createdAt: PropTypes.string,
    proposal: PropTypes.object,
    author: PropTypes.object,
    location: PropTypes.object,
    votes: PropTypes.array,
  }).isRequired,
  showActions: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default SuggestionCard;
