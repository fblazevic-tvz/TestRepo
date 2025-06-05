import React from 'react';
import PropTypes from 'prop-types';
import './SuggestionAttachments.css';

function SuggestionAttachments({ suggestionId, attachments }) {

    const displayAttachments = [
        { id: 1, name: `Attachment_for_suggestion_${suggestionId}_1.pdf`, url: '#' },
        { id: 2, name: `Plan_suggestion_${suggestionId}.jpg`, url: '#' },
    ];

    return (
        <div className="suggestion-attachments">
            <h2>Priloženi dokumenti</h2>

            <div className="attachments-list-container">
                {displayAttachments.length > 0 ? (
                    <ul className="attachments-list">
                        {displayAttachments.map(att => (
                            <li key={att.id} className="attachment-item">
                                <span className="attachment-icon">📎</span>
                                <a href={att.url || '#'} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                    {att.name || 'Attachment'}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nema priloženih dokumenata za ovaj prijedlog.</p>
                )}
            </div>
        </div>
    );
}

SuggestionAttachments.propTypes = {
    suggestionId: PropTypes.number,
    attachments: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string,
        url: PropTypes.string,
    })),
};

export default SuggestionAttachments;