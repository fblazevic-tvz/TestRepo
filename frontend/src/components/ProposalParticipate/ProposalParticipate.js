import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ProposalParticipate.css';

function ProposalParticipate({ proposalId }) {

    const attachments = [
        { id: 1, name: 'Plan_izgradnje_parka.pdf', url: '#' },
        { id: 2, name: 'Proracun_stavke.xlsx', url: '#' },
        { id: 3, name: 'Skica_lokacije.jpg', url: '#' },
    ];

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
                {attachments.length > 0 ? (
                    <ul className="attachments-list">
                        {attachments.map(att => (
                            <li key={att.id} className="attachment-item">
                                <span className="attachment-icon">📄</span> 
                                <a href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                    {att.name}
                                </a>
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
    proposalId: PropTypes.number, 
};

export default ProposalParticipate;