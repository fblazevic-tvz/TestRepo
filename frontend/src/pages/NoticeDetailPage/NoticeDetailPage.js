import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchNoticeById, deleteNotice } from '../../services/noticeService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import NoticeDetailInfo from '../../components/NoticeDetailInfo/NoticeDetailInfo';
import NoticeAttachments from '../../components/NoticeAttachments/NoticeAttachments';
import EditNoticeModal from '../../components/EditNoticeModal/EditNoticeModal';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { formatDateCroatian } from '../../utils/formatters';
import './NoticeDetailPage.css';

function NoticeDetailPage() {
    const { noticeId } = useParams();
    const navigate = useNavigate();

    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    
    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const goBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        if (!noticeId) {
            setError("Notice ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const loadNotice = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchNoticeById(noticeId);
                setNotice(data);
            } catch (err) {
                setError(err.message || `Failed to load notice ${noticeId}.`);
                setNotice(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadNotice();
    }, [noticeId]);

    const handleEdit = useCallback((noticeToEdit) => {
        setIsEditModalOpen(true);
    }, []);

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
    };

    const handleNoticeUpdated = (updatedNotice) => {
        setNotice(updatedNotice);
        setIsEditModalOpen(false);
    };
    
    const handleDeleteModalClose = () => {
        if (!isDeleting) {
            setIsDeleteModalOpen(false);
        }
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteNotice(noticeId);
            // Navigate back to notices list or proposal
            if (notice?.proposal?.id) {
                navigate(`/proposals/${notice.proposal.id}`, { 
                    state: { activeTab: 'notices', message: 'Obavijest uspješno obrisana.' } 
                });
            } else {
                navigate('/notices', { 
                    state: { message: 'Obavijest uspješno obrisana.' } 
                });
            }
        } catch (err) {
            setError(err.message || 'Brisanje obavijesti nije uspjelo.');
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const renderHeader = () => {
        if (isLoading || error || !notice) return null;
        return (
            <div className="notice-detail-header">
                <h1>{notice.title}</h1>
                <p className="notice-header-meta">Objavljeno: {formatDateCroatian(notice.createdAt)}</p>
            </div>
        );
    };

    const renderTabs = () => {
        if (isLoading || error || !notice) return null;
        return (
            <div className="detail-page-tabs notice-tabs">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                >
                    Detalji
                </button>
                <button
                    onClick={() => setActiveTab('attachments')}
                    className={`tab-button ${activeTab === 'attachments' ? 'active' : ''}`}
                >
                    Dodatci
                </button>
            </div>
        );
    }

    const renderTabContent = () => {
        if (isLoading || error || !notice) return null;

        switch (activeTab) {
            case 'details':
                return <NoticeDetailInfo notice={notice} onEdit={handleEdit} />;
            case 'attachments':
                return <NoticeAttachments noticeId={notice.id} />;
            default:
                return <NoticeDetailInfo notice={notice} onEdit={handleEdit} />;
        }
    };

    return (
        <>
            <div className="back-link-container">
                <button onClick={goBack} className="back-link-button">
                    ← Natrag
                </button>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && !isLoading && (
                <div className="alert alert-danger detail-error">
                    Error: {error} <br />
                    <Link to="/notices">Vrati se na popis</Link>
                </div>
            )}

            {!isLoading && !error && notice && renderHeader()}

            {!isLoading && !error && notice && (
                <div className="detail-page-content-area notice-content-area">
                    {renderTabs()}
                    <div className="tab-content">
                        {renderTabContent()}
                    </div>
                </div>
            )}

            {notice && (
                <>
                    <EditNoticeModal
                        isOpen={isEditModalOpen}
                        onClose={handleEditModalClose}
                        notice={notice}
                        onNoticeUpdated={handleNoticeUpdated}
                    />
                    
                    <ConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={handleDeleteModalClose}
                        onConfirm={handleConfirmDelete}
                        title="Potvrdi brisanje obavijesti"
                        message={`Jeste li sigurni da želite obrisati obavijest "${notice.title}"? Ova akcija ne može biti poništena.`}
                        confirmText="Obriši"
                        cancelText="Odustani"
                        isLoading={isDeleting}
                    />
                </>
            )}
        </>
    );
}

export default NoticeDetailPage;