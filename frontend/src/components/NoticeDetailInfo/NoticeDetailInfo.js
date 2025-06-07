import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatDateCroatian, formatCurrencyEuroCroatian } from '../../utils/formatters';
import './NoticeDetailInfo.css';

function NoticeDetailInfo({ notice, onEdit }) {
    const { user, isAuthenticated } = useAuth();

    if (!notice) {
        return <p>Podaci o obavijesti nisu dostupni.</p>;
    }

    const {
        id,
        content = "Nema sadržaja.",
        createdAt = null,
        moderator: noticeModerator = null,
        moderatorId = null,
        proposal = null,
    } = notice;

    const {
        name: proposalName = "N/A",
        maxBudget = null,
        submissionStart = null,
        submissionEnd = null,
        status: proposalStatus = null,
        city = null,
        moderator: proposalModerator = null,
    } = proposal || {};

    const noticeModeratorName = noticeModerator?.userName || "System";
    const proposalModeratorName = proposalModerator?.userName || "N/A";
    const cityName = city?.name || "N/A";
    const cityPostcode = city?.postcode || "N/A";

    const isNoticeModerator = isAuthenticated &&
                              user?.role === 'Moderator' &&
                              moderatorId &&
                              parseInt(user.userId) === moderatorId;

    const handleEditClick = () => {
        if (onEdit) {
            onEdit(notice);
        }
    };

    return (
        <div className="notice-detail-layout">
            <main className="notice-content-main">
                <header className="notice-content-header">
                    <h3>Sadržaj obavijesti</h3>
                    {isNoticeModerator && (
                        <button
                            onClick={handleEditClick}
                            className="button-secondary edit-notice-button"
                        >
                            Uredi obavijest
                        </button>
                    )}
                </header>
                <p className="notice-content-text">{content}</p>
                <footer className="notice-meta">Objavljeno: {formatDateCroatian(createdAt)} | Autor: {noticeModeratorName}</footer>
            </main>

            <aside className="proposal-info-sidebar">
                <h4>Informacije o natječaju</h4>
                <dl className="sidebar-info-item">
                    <dt className="sidebar-info-label">Natječaj:</dt>
                    <dd className="sidebar-info-value">{proposalName}</dd>
                </dl>
                <dl className="sidebar-info-item">
                    <dt className="sidebar-info-label">Status natječaja:</dt>
                    <dd className="sidebar-info-value">{proposalStatus}</dd>
                </dl>
                <dl className="sidebar-info-item">
                    <dt className="sidebar-info-label">Budžet:</dt>
                    <dd className="sidebar-info-value">{formatCurrencyEuroCroatian(maxBudget)}</dd>
                </dl>
                <dl className="sidebar-info-item">
                    <dt className="sidebar-info-label">Period prijave:</dt>
                    <dd className="sidebar-info-value dates">{formatDateCroatian(submissionStart)} - {formatDateCroatian(submissionEnd)}</dd>
                </dl>
                <dl className="sidebar-info-item">
                    <dt className="sidebar-info-label">Grad:</dt>
                    <dd className="sidebar-info-value">{cityName} ({cityPostcode})</dd>
                </dl>
                <dl className="sidebar-info-item">
                    <dt className="sidebar-info-label">Moderator natječaja:</dt>
                    <dd className="sidebar-info-value">{proposalModeratorName}</dd>
                </dl>

                {proposal?.id && (
                     <Link to={`/proposals/${proposal.id}`} className="sidebar-link-to-proposal">
                     Pogledaj cijeli natječaj →
                    </Link>
                 )}
            </aside>
        </div>
    );
}

NoticeDetailInfo.propTypes = {
    notice: PropTypes.object,
    onEdit: PropTypes.func,
};

export default NoticeDetailInfo;