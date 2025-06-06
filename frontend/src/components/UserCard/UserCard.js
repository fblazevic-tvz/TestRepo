import React from 'react';
import PropTypes from 'prop-types';
import './UserCard.css';
import { useNavigate } from 'react-router-dom';
import { formatDateCroatian } from '../../utils/formatters';

function UserCard({ user }) {
    const navigate = useNavigate();
    const {
        id,
        userName = "Nije dostupno",
        email = "Nije dostupno",
        role = "User",
        createdAt = null,
        isActive = true,
    } = user || {};

    const goToDetails = () => {
        if (id) {
            navigate(`/dashboard/users/${id}`);
        } else {
            console.error("User ID is missing, cannot navigate to details.");
        }
    };

    return (
        <div className="user-card">
            <div className="user-card-header">
                <div className="user-card-avatar">
                    <div className="user-icon-placeholder-card"></div>
                </div>
                <div className={`user-status-badge ${isActive ? 'active' : 'inactive'}`}>
                    {isActive ? 'Aktivan' : 'Neaktivan'}
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
            </div>

            <div className="user-card-buttons-group">
                <button onClick={goToDetails} className="user-card-button-primary">
                    Detalji
                </button>
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
        isActive: PropTypes.bool,
    }).isRequired,
};

export default UserCard;