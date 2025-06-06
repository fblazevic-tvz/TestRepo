import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './UserCard.css';
import { useNavigate } from 'react-router-dom';
import { formatDateCroatian } from '../../utils/formatters';
import { changeUserStatus } from '../../services/userService';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import GavelIcon from '@mui/icons-material/Gavel';

function UserCard({ user, onUserStatusChanged }) {
    const navigate = useNavigate();
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [statusError, setStatusError] = useState('');
    const {
        id,
        userName = "Nije dostupno",
        email = "Nije dostupno",
        role = "User",
        createdAt = null,
        accountStatus = "Active",
        avatarUrl = null
    } = user || {};

    const isActive = accountStatus === "Active";
    const isBanned = accountStatus === "Banned";

    // Get the full avatar URL
    const getAvatarUrl = () => {
        if (avatarUrl) {
            if (avatarUrl.startsWith('/')) {
                // Extract base URL without /api
                const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7003/api';
                const baseUrl = apiBaseUrl.replace('/api', '');
                return `${baseUrl}${avatarUrl}`;
            }
            return avatarUrl;
        }
        return null;
    };

    const goToDetails = () => {
        if (id) {
            navigate(`/dashboard/users/${id}`);
        } else {
            console.error("User ID is missing, cannot navigate to details.");
        }
    };

    const handleStatusToggle = async (e) => {
        e.stopPropagation();
        setIsChangingStatus(true);
        setStatusError('');

        try {
            const newStatus = isActive ? "Banned" : "Active";
            await changeUserStatus(id, newStatus);
            
            if (onUserStatusChanged) {
                onUserStatusChanged(id, newStatus);
            }
        } catch (err) {
            console.error("Failed to change user status:", err);
            setStatusError(err.message || "Promjena statusa nije uspjela.");
        } finally {
            setIsChangingStatus(false);
        }
    };

    const fullAvatarUrl = getAvatarUrl();

    return (
        <div className="user-card">
            <div className="user-card-header">
                <div className="user-card-avatar">
                    {fullAvatarUrl ? (
                        <img 
                            src={fullAvatarUrl} 
                            alt={`${userName} avatar`}
                            className="user-card-avatar-image"
                            onError={(e) => {
                                console.error('Failed to load avatar:', fullAvatarUrl);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                    ) : null}
                    <div 
                        className="user-icon-placeholder-card"
                        style={fullAvatarUrl ? { display: 'none' } : {}}
                    ></div>
                </div>
                <div className={`user-status-badge ${isActive ? 'active' : 'inactive'}`}>
                    {isActive ? 'Aktivan' : 'Zabranjen'}
                </div>
            </div>

            <div className="user-card-content">
                <div className="user-card-info">
                    <h3 className="user-card-name">{userName}</h3>
                    <p className="user-card-email">{email}</p>
                    <div className="user-card-meta">
                        <span className={`user-role-badge ${role.toLowerCase()}`}>
                            {role}
                        </span>
                    </div>
                </div>

                <div className="user-card-dates">
                    <span>Datum registracije: {formatDateCroatian(createdAt)}</span>
                </div>
                
                {statusError && (
                    <div className="status-error-message">{statusError}</div>
                )}
            </div>

            <div className="user-card-buttons-group">
                <button onClick={goToDetails} className="user-card-button-primary">
                    Detalji
                </button>
                <Tooltip title={isActive ? "Banuj korisnika" : "Ukloni ban"}>
                    <span>
                        <IconButton
                            onClick={handleStatusToggle}
                            disabled={isChangingStatus}
                            className={`user-status-toggle-button ${isBanned ? 'banned' : ''}`}
                            size="medium"
                        >
                            <GavelIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </div>
        </div>
    );
}

UserCard.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        userName: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.string,
        createdAt: PropTypes.string,
        accountStatus: PropTypes.string,
        avatarUrl: PropTypes.string,
    }).isRequired,
    onUserStatusChanged: PropTypes.func,
};

export default UserCard;