import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { fetchProposalAttachments } from '../../services/proposalAttachmentService';
import './ProposalParticipate.css';

function ProposalParticipate({ proposalId }) {
    const [attachments, setAttachments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadAttachments = async () => {
            if (!proposalId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            
            try {
                const data = await fetchProposalAttachments(proposalId);
                setAttachments(data);
            } catch (err) {
                console.error('Failed to load attachments:', err);
                setError(err.message || 'Failed to load attachments');
            } finally {
                setIsLoading(false);
            }
        };

        loadAttachments();
    }, [proposalId]);

    return (
        <div className="proposal-participate">
            <h2>Sudjeluj u Natječaju</h2>

            <Link
                to={`/create-suggestion?proposalId=${proposalId}`} 
                className="button-primary participate-button"
                style={!proposalId ? { pointerEvents: 'none', opacity: 0.65 } : {}}
            >
                Stvori prijedlog za ovaj natječaj
            </Link>

            <div className="attachments-section">
                <h3>Povezani Dokumenti</h3>
                {isLoading ? (
                    <p>Učitavanje dokumenata...</p>
                ) : error ? (
                    <p className="error-message">Greška pri učitavanju dokumenata</p>
                ) : attachments.length > 0 ? (
                    <ul className="attachments-list">
                        {attachments.map(att => (
                            <li key={att.id} className="attachment-item">
                                <span className="attachment-icon">📄</span> 
                                <a 
                                    href={att.downloadUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="attachment-link"
                                >
                                    {att.fileName}
                                </a>
                                {att.description && (
                                    <span className="attachment-desc"> - {att.description}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nema priloženih dokumenata.</p>
                )}
            </div>
        </div>
    );
}

ProposalParticipate.propTypes = {
    proposalId: PropTypes.number.isRequired, 
};

export default ProposalParticipate;