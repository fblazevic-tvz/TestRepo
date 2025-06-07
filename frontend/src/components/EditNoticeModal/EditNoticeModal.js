import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { updateNotice } from '../../services/noticeService';
import './EditNoticeModal.css';

function EditNoticeModal({ isOpen, onClose, notice, onNoticeUpdated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (notice && isOpen) {
            setTitle(notice.title || '');
            setContent(notice.content || '');
            setError('');
        }
    }, [notice, isOpen]);

    if (!isOpen || !notice) return null;

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

        if (title.trim() === notice.title && content.trim() === notice.content) {
            handleClose();
            return;
        }

        setIsSubmitting(true);

        const updateData = {
            title: title.trim(),
            content: content.trim()
        };

        try {
            await updateNotice(notice.id, updateData);
            const updatedNotice = {
                ...notice,
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            onNoticeUpdated(updatedNotice);
            handleClose();
        } catch (err) {
            setError(err.message || 'Greška pri ažuriranju obavijesti.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
            <div className="modal-content edit-notice-modal" onClick={handleModalContentClick}>
                <header className="modal-header">
                    <h2 className="modal-title">Uredi obavijest</h2>
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
                            <label htmlFor="edit-notice-title">Naslov obavijesti:</label>
                            <input
                                type="text"
                                id="edit-notice-title"
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
                            <label htmlFor="edit-notice-content">Sadržaj:</label>
                            <textarea
                                id="edit-notice-content"
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
                            {isSubmitting ? 'Spremanje...' : 'Spremi promjene'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

EditNoticeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    notice: PropTypes.object,
    onNoticeUpdated: PropTypes.func.isRequired,
};

export default EditNoticeModal;