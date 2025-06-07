import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createNotice } from '../../services/noticeService';
import './CreateNoticeModal.css';

function CreateNoticeModal({ isOpen, onClose, proposalId, moderatorId, onNoticeCreated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setTitle('');
        setContent('');
        setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim() || !content.trim()) {
            setError('Sva polja su obavezna.');
            return;
        }

        if (title.trim().length > 150) {
            setError('Naslov ne smije biti duži od 150 znakova.');
            return;
        }

        setIsSubmitting(true);

        const noticeData = {
            title: title.trim(),
            content: content.trim(),
            proposalId: proposalId,
            moderatorId: moderatorId
        };

        try {
            const createdNotice = await createNotice(noticeData);
            onNoticeCreated(createdNotice);
            handleClose();
        } catch (err) {
            setError(err.message || 'Greška pri kreiranju obavijesti.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
            <div className="modal-content create-notice-modal" onClick={handleModalContentClick}>
                <header className="modal-header">
                    <h2 className="modal-title">Nova obavijest</h2>
                    <button
                        type="button"
                        className="modal-close-button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        aria-label="Zatvori"
                    >
                        ×
                    </button>
                </header>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger notice-error">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="notice-title">Naslov obavijesti:</label>
                            <input
                                type="text"
                                id="notice-title"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                maxLength={150}
                                disabled={isSubmitting}
                                placeholder="Unesite naslov obavijesti..."
                                autoFocus
                            />
                            <small className="form-text text-muted">
                                Maksimalno 150 znakova
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notice-content">Sadržaj:</label>
                            <textarea
                                id="notice-content"
                                className="form-control"
                                rows="6"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                disabled={isSubmitting}
                                placeholder="Unesite sadržaj obavijesti..."
                            />
                        </div>
                    </div>

                    <footer className="modal-actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="modal-button modal-button-cancel button-secondary"
                            disabled={isSubmitting}
                        >
                            Odustani
                        </button>
                        <button
                            type="submit"
                            className="modal-button modal-button-confirm button-primary"
                            disabled={isSubmitting || !title.trim() || !content.trim()}
                        >
                            {isSubmitting ? 'Objavljuje se...' : 'Objavi obavijest'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

CreateNoticeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    proposalId: PropTypes.number.isRequired,
    moderatorId: PropTypes.number.isRequired,
    onNoticeCreated: PropTypes.func.isRequired,
};

export default CreateNoticeModal;