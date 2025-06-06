import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { fetchNoticesByProposalId, deleteNotice } from '../../services/noticeService'; 
import NoticeList from '../NoticeList/NoticeList'; 
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import EditNoticeModal from '../EditNoticeModal/EditNoticeModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import './ProposalNotices.css'; 

function ProposalNotices({ proposalId }) {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [noticeToEdit, setNoticeToEdit] = useState(null);
    
    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [noticeToDelete, setNoticeToDelete] = useState({ id: null, title: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!proposalId) return; 

        const loadNotices = async () => {
            setIsLoading(true);
            setError(null);
            setNotices([]);
            try {
                const data = await fetchNoticesByProposalId(proposalId);
                setNotices(data);
            } catch (err) {
                setError(err.message || `Failed to load notices for proposal ${proposalId}.`);
            } finally {
                setIsLoading(false);
            }
        };

        loadNotices();
    }, [proposalId]); 

    const handleEdit = useCallback((notice) => {
        setNoticeToEdit(notice);
        setIsEditModalOpen(true);
    }, []);

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setNoticeToEdit(null);
    };

    const handleNoticeUpdated = (updatedNotice) => {
        setNotices(prevNotices => 
            prevNotices.map(notice => 
                notice.id === updatedNotice.id ? updatedNotice : notice
            )
        );
        setIsEditModalOpen(false);
        setNoticeToEdit(null);
    };

    const handleDelete = useCallback((noticeId, noticeTitle) => {
        setNoticeToDelete({ id: noticeId, title: noticeTitle });
        setIsDeleteModalOpen(true);
    }, []);

    const handleDeleteModalClose = () => {
        if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setNoticeToDelete({ id: null, title: '' });
        }
    };

    const handleConfirmDelete = async () => {
        if (!noticeToDelete.id) return;
        
        setIsDeleting(true);
        try {
            await deleteNotice(noticeToDelete.id);
            setNotices(prevNotices => 
                prevNotices.filter(notice => notice.id !== noticeToDelete.id)
            );
            setIsDeleteModalOpen(false);
            setNoticeToDelete({ id: null, title: '' });
        } catch (err) {
            setError(err.message || 'Brisanje obavijesti nije uspjelo.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="proposal-notices"> 
            <h2>Povezane obavijesti</h2> 

            {isLoading && <LoadingSpinner />}
            {error && <div className="alert alert-danger">Error: {error}</div>}

            {!isLoading && !error && (
                notices.length > 0
                    ? <NoticeList notices={notices} onEdit={handleEdit} onDelete={handleDelete} />
                    : <p className="no-proposal-notices-message">Nema povezanih obavijesti za ovaj natječaj.</p>
            )}

            <EditNoticeModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                notice={noticeToEdit}
                onNoticeUpdated={handleNoticeUpdated}
            />
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteModalClose}
                onConfirm={handleConfirmDelete}
                title="Potvrdi brisanje obavijesti"
                message={`Jeste li sigurni da želite obrisati obavijest "${noticeToDelete.title}"? Ova akcija ne može biti poništena.`}
                confirmText="Obriši"
                cancelText="Odustani"
                isLoading={isDeleting}
            />
        </div>
    );
}

ProposalNotices.propTypes = {
    proposalId: PropTypes.number,
};

export default ProposalNotices;