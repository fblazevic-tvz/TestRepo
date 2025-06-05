import React from 'react';
import PropTypes from 'prop-types';
import './ProposalDetailInfo.css'; 
import { formatDateCroatian, formatCurrencyEuroCroatian } from '../../utils/formatters';



function ProposalDetailInfo({ proposal }) {
    if (!proposal) {
        return <p>Podaci o natječaju nisu dostupni</p>;
    }

    const {
        description = "Nema dostupnog opisa",
        maxBudget = null,
        submissionStart = null,
        submissionEnd = null,
        status = null,
        city = null,
        moderator = null,
    } = proposal;

    
    const cityName = city?.name || "Nije dostupno";
    const cityPostcode = city?.postcode || "N/A";
    const moderatorName = moderator?.userName || "Nije dostupno";
    
    return (
        <div className="proposal-detail-info">
            <h2>Detalji natječaja</h2>
            <div className="info-grid">
                <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value status">{status}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Maksimalni budžet:</span>
                    <span className="info-value budget">{formatCurrencyEuroCroatian(maxBudget)}</span>
                </div>
                 <div className="info-item">
                    <span className="info-label">Period Prijave:</span>
                    <span className="info-value dates">
                        {formatDateCroatian(submissionStart)} - {formatDateCroatian(submissionEnd)}
                    </span>
                </div>
                <div className="info-item">
                    <span className="info-label">Grad:</span>
                    <span className="info-value city">{cityName} ({cityPostcode})</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Moderator:</span>
                     <span className="info-value moderator">{moderatorName}</span>
                </div>
            </div>
            <h2>Opis</h2>
            <p className="proposal-description">{description}</p>
        </div>
    );
}

ProposalDetailInfo.propTypes = {
    proposal: PropTypes.object, 
};

export default ProposalDetailInfo;