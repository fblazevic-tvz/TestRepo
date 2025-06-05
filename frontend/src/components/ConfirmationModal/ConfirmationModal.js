import React from 'react';
import PropTypes from 'prop-types';
import './ConfirmationModal.css';

function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Potvrda", 
    message = "Jeste li sigurni?", 
    confirmText = "Potvrdi",
    cancelText = "Odustani",
    isLoading = false 
}) {
    if (!isOpen) {
        return null;
    }

    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">

            <div className="modal-content" onClick={handleModalContentClick}>

                <div className="modal-header">
                    <h2 className="modal-title" id="modal-title">{title}</h2>
                </div>

                <div className="modal-body">
                    <p className="modal-message">{message}</p>
                </div>

                <div className="modal-actions">
                    <button
                        onClick={onClose}
                        className="modal-button modal-button-cancel button-secondary" 
                        disabled={isLoading} 
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="modal-button modal-button-confirm button-danger" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Brisanje...' : confirmText} 
                    </button>
                </div>
            </div>
        </div>
    );
}

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired, 
    onConfirm: PropTypes.func.isRequired, 
    title: PropTypes.string,
    message: PropTypes.string,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    isLoading: PropTypes.bool, 
};

export default ConfirmationModal;