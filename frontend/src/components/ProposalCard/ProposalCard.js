import React from 'react';
import PropTypes from 'prop-types';
import './ProposalCard.css';
import { useNavigate } from 'react-router-dom';
import { formatDateCroatian, formatCurrencyEuroCroatian } from '../../utils/formatters';

function ProposalCard({ proposal }) {
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
                        <div className="user-icon-placeholder-card"></div>
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
};

export default ProposalCard;
