import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDateCroatian, formatCurrencyEuroCroatian } from '../../utils/formatters'; 
import './NoticeDetailInfo.css';

function NoticeDetailInfo({ notice }) {
    if (!notice) {
        return <p>Podaci o obavijesti nisu dostupni.</p>;
    }

    const {
        content = "Nema sadržaja.",
        createdAt = null,
        moderator: noticeModerator = null, 
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

    return (
        <div className="notice-detail-layout">
            <div className="notice-content-main">
                <h3>Sadržaj obavijesti</h3>
                <p className="notice-content-text">{content}</p>
                 <p className="notice-meta">Objavljeno: {formatDateCroatian(createdAt)} | Autor: {noticeModeratorName}</p>
            </div>

            <aside className="proposal-info-sidebar">
                <h4>Informacije o natječaju</h4>
                <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Natječaj:</span>
                    <span className="sidebar-info-value">{proposalName}</span>
                </div>
                <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Status natječaja:</span>
                    <span className="sidebar-info-value">{proposalStatus}</span>
                </div>
                <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Budžet:</span>
                    <span className="sidebar-info-value">{formatCurrencyEuroCroatian(maxBudget)}</span>
                </div>
                 <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Period prijave:</span>
                    <span className="sidebar-info-value dates">{formatDateCroatian(submissionStart)} - {formatDateCroatian(submissionEnd)}</span>
                </div>
                 <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Grad:</span>
                    <span className="sidebar-info-value">{cityName} ({cityPostcode})</span>
                </div>
                 <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Moderator natječaja:</span>
                    <span className="sidebar-info-value">{proposalModeratorName}</span>
                </div>

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
};

export default NoticeDetailInfo;