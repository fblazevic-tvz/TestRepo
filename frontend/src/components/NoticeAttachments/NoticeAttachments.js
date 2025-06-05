import React from 'react';
import PropTypes from 'prop-types';
import './NoticeAttachments.css'; 

function NoticeAttachments({ noticeId }) {

    const attachments = [
        { id: 1, name: `Dodatni_detalji_obavijest_${noticeId}.pdf`, url: '#' },
        { id: 2, name: `Povezani_dokument_${noticeId}.docx`, url: '#' },
    ];

    return (
        <div className="notice-attachments">
            <h2>Priloženi dokumenti</h2>

            <div className="attachments-list-container">
                {attachments.length > 0 ? (
                    <ul className="attachments-list">
                        {attachments.map(att => (
                            <li key={att.id} className="attachment-item">
                                <span className="attachment-icon">📎</span> 
                                <a href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                    {att.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nema priloženih dokumenata za ovu obavijest.</p>
                )}
            </div>
        </div>
    );
}

NoticeAttachments.propTypes = {
    noticeId: PropTypes.number, 
};

export default NoticeAttachments;