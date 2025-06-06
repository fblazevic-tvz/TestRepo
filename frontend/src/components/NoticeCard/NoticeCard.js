import React from 'react';
import PropTypes from 'prop-types';
import './NoticeCard.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatDateCroatian } from '../../utils/formatters';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import Tooltip from '@mui/material/Tooltip';

function NoticeCard({ notice, onEdit, onDelete }) {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    
    const {
        id,
        title = "Nije dostupno",
        content = "Ne postoji sadržaj.",
        createdAt = null,
        proposal = null,
        moderator = null,
        moderatorId = null
    } = notice || {};

    const proposalName = proposal?.name || "Općenito";
    const moderatorName = moderator?.userName || "System";

    // Check if current user is the moderator who created this notice
    const isNoticeModerator = isAuthenticated && 
                              user?.role === 'Moderator' && 
                              moderatorId && 
                              parseInt(user.userId) === moderatorId;

    const shortContent = content.length > 120
        ? content.substring(0, 120) + '...'
        : content;

    const goToDetails = () => {
        if (id) {
            navigate(`/notices/${id}`);
        } else {
            console.error("Notice ID is missing, cannot navigate to details.");
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        if (onEdit && id) {
            onEdit(notice);
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (onDelete && id) {
            onDelete(id, title);
        }
    };

    return (
        <div className="notice-card">
            <div className="notice-card-image-container">
                <img
                    src="/notice.webp"
                    alt="Vizualni prikaz za obavijest"
                    className="notice-card-image"
                    loading="lazy"
                    onClick={goToDetails}
                />
            </div>
            <div className="notice-card-content">
                <div className="notice-card-title-category">
                    <p className="notice-card-category">{proposalName}</p>
                    <h3 className="notice-card-title">{title}</h3>
                    <p className="notice-card-meta">
                        Objavio: {moderatorName} | Datum: {formatDateCroatian(createdAt)}
                    </p>
                </div>
                <p className="notice-card-paragraph">{shortContent}</p>
            </div>
            <div className="notice-card-buttons-group">
                <button onClick={goToDetails} className="notice-card-button-secondary">
                    Pročitaj više
                </button>
                
                {isNoticeModerator && (
                    <div className="notice-card-actions">
                        <Tooltip title="Uredi obavijest">
                            <IconButton 
                                size="small" 
                                onClick={handleEditClick} 
                                className="notice-action-icon-button edit"
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Obriši obavijest">
                            <IconButton 
                                size="small" 
                                onClick={handleDeleteClick} 
                                className="notice-action-icon-button delete"
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

NoticeCard.propTypes = {
    notice: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
        content: PropTypes.string,
        createdAt: PropTypes.string,
        proposal: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
        moderator: PropTypes.shape({
            id: PropTypes.number,
            userName: PropTypes.string,
        }),
        moderatorId: PropTypes.number,
    }).isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
};

export default NoticeCard;