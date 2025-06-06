import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import CreateNoticeModal from '../CreateNoticeModal/CreateNoticeModal';
import './ProposalDetailInfo.css'; 
import { formatDateCroatian, formatCurrencyEuroCroatian } from '../../utils/formatters';

function ProposalDetailInfo({ proposal, onNoticeCreated }) {
    const { user, isAuthenticated } = useAuth();
    const [isCreateNoticeModalOpen, setIsCreateNoticeModalOpen] = useState(false);

    if (!proposal) {
        return <p>Podaci o natječaju nisu dostupni</p>;
    }

    const {
        id,
        description = "Nema dostupnog opisa",
        maxBudget = null,
        submissionStart = null,
        submissionEnd = null,
        status = null,
        city = null,
        moderator = null,
        moderatorId = null,
    } = proposal;

    const cityName = city?.name || "Nije dostupno";
    const cityPostcode = city?.postcode || "N/A";
    const moderatorName = moderator?.userName || "Nije dostupno";
    
    // Check if current user is the moderator of this proposal
    const isProposalModerator = isAuthenticated && 
                                user?.role === 'Moderator' && 
                                moderatorId && 
                                parseInt(user.userId) === moderatorId;

    const handleCreateNotice = () => {
        setIsCreateNoticeModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateNoticeModalOpen(false);
    };

    const handleNoticeCreated = (newNotice) => {
        if (onNoticeCreated) {
            onNoticeCreated(newNotice);
        }
    };
    
    return (
        <>
            <div className="proposal-detail-info">
                <div className="proposal-header-section">
                    <h2>Detalji natječaja</h2>
                    {isProposalModerator && (
                        <button 
                            onClick={handleCreateNotice}
                            className="button-primary create-notice-button"
                        >
                            Stvori novu obavijest
                        </button>
                    )}
                </div>
                
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
                        <span className="info-label">Period prijave:</span>
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

            {isProposalModerator && (
                <CreateNoticeModal
                    isOpen={isCreateNoticeModalOpen}
                    onClose={handleCloseModal}
                    proposalId={id}
                    moderatorId={parseInt(user.userId)}
                    onNoticeCreated={handleNoticeCreated}
                />
            )}
        </>
    );
}

ProposalDetailInfo.propTypes = {
    proposal: PropTypes.object,
    onNoticeCreated: PropTypes.func,
};

export default ProposalDetailInfo;