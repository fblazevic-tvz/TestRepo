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
            <section className="proposal-detail-info">
                <header className="proposal-header-section">
                    <h2>Detalji natječaja</h2>
                    {isProposalModerator && (
                        <button
                            onClick={handleCreateNotice}
                            className="button-primary create-notice-button"
                        >
                            Stvori novu obavijest
                        </button>
                    )}
                </header>

                <dl className="info-grid">
                    <div className="info-item">
                        <dt className="info-label">Status:</dt>
                        <dd className="info-value status">{status}</dd>
                    </div>
                    <div className="info-item">
                        <dt className="info-label">Maksimalni budžet:</dt>
                        <dd className="info-value budget">{formatCurrencyEuroCroatian(maxBudget)}</dd>
                    </div>
                    <div className="info-item">
                        <dt className="info-label">Period prijave:</dt>
                        <dd className="info-value dates">
                            {formatDateCroatian(submissionStart)} - {formatDateCroatian(submissionEnd)}
                        </dd>
                    </div>
                    <div className="info-item">
                        <dt className="info-label">Grad:</dt>
                        <dd className="info-value city">{cityName} ({cityPostcode})</dd>
                    </div>
                    <div className="info-item">
                        <dt className="info-label">Moderator:</dt>
                        <dd className="info-value moderator">{moderatorName}</dd>
                    </div>
                </dl>

                <h2>Opis</h2>
                <p className="proposal-description">{description}</p>
            </section>

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