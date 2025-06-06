import React from 'react';
import PropTypes from 'prop-types';
import './ProposalCard.css';
import { useNavigate } from 'react-router-dom';
import { formatDateCroatian, formatCurrencyEuroCroatian } from '../../utils/formatters';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import Tooltip from '@mui/material/Tooltip';

function ProposalCard({ proposal, showActions = false, onEdit, onDelete }) {
    const navigate = useNavigate();
    const {
        id,
        name = "Nije dostupno",
        description = "Nije dostupno.",
        maxBudget = null,
        submissionStart = null,
        submissionEnd = null,
        status = "N/A",
        city = null,
        moderator = null,
    } = proposal || {};

    const cityName = city?.name || "Nije dostupno";
    const moderatorName = moderator?.userName || "Nije dostupno";

    const goToDetails = () => {
        if (id) {
            navigate(`/proposals/${id}`);
        } else {
            console.error("Proposal ID is missing, cannot navigate to details.");
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

    const shortDescription = description.length > 100
        ? description.substring(0, 100) + '...'
        : description;

    return (
        <div className="proposal-card">
            <div className="proposal-card-image-container">
                <img
                    src="/proposal.jpg"
                    alt="Vizualni prikaz za natječaj"
                    className="proposal-card-image"
                    loading="lazy"
                    onClick={goToDetails}
                />
            </div>

            <div className="proposal-card-content">
                <div className="proposal-card-title-category">
                    <p className="proposal-card-category">{cityName}</p>
                    <h3 className="proposal-card-title">{name}</h3>
                    <p className="proposal-card-category status">Status: {status}</p>
                    <p className="proposal-card-category budget">Budžet: {formatCurrencyEuroCroatian(maxBudget)}</p>
                </div>

                <p className="proposal-card-paragraph">{shortDescription}</p>

                <div className="proposal-card-user-card">
                    <div className="proposal-user-thumb">
                        <div className="user-icon-proposal-placeholder-card"></div>
                    </div>
                    <div className="proposal-user-details">
                        <span className="proposal-user-name">{moderatorName}</span>
                        <span className="proposal-user-role">Moderator</span>
                    </div>
                </div>

                <div className="proposal-card-dates">
                    <span>Trajanje natječaja: {formatDateCroatian(submissionStart)} - {formatDateCroatian(submissionEnd)}</span>
                </div>
            </div>

            <div className="proposal-card-buttons-group">
                <button onClick={goToDetails} className="proposal-card-button-primary">Detalji</button>
                
                {showActions && (
                    <div className="proposal-card-actions">
                        <Tooltip title="Uredi natječaj">
                            <IconButton 
                                size="small" 
                                onClick={handleEditClick} 
                                className="proposal-action-icon-button edit"
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Obriši natječaj">
                            <IconButton 
                                size="small" 
                                onClick={handleDeleteClick} 
                                className="proposal-action-icon-button delete"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                )}
            </div>
        </div>
    );
}

ProposalCard.propTypes = {
    proposal: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string,
        description: PropTypes.string,
        maxBudget: PropTypes.number,
        submissionStart: PropTypes.string,
        submissionEnd: PropTypes.string,
        status: PropTypes.number,
        city: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
        moderator: PropTypes.shape({
            id: PropTypes.number,
            username: PropTypes.string,
        }),
    }).isRequired,
    showActions: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
};

export default ProposalCard;