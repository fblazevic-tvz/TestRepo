import React from 'react';
import PropTypes from 'prop-types';
import './NoticeCard.css';
import { useNavigate } from 'react-router-dom';
import { formatDateCroatian } from '../../utils/formatters';

function NoticeCard({ notice }) {
    const navigate = useNavigate();
    const {
        id,
        title = "Nije dostupno",
        content = "Ne postoji sadržaj.",
        createdAt = null,
        proposal = null,
        moderator = null
    } = notice || {};

    const proposalName = proposal?.name || "Općenito";
    const moderatorName = moderator?.userName || "System";

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

    return (
        <div className="notice-card">
            <div className="notice-card-image-container">
                <img
                    src="/notice.webp"
                    alt="Vizualni prikaz za obavijest"
                    className="notice-card-image"
                    loading="lazy"
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
    }).isRequired,
};

export default NoticeCard;
