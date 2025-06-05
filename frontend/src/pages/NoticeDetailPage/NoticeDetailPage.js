import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchNoticeById } from '../../services/noticeService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import NoticeDetailInfo from '../../components/NoticeDetailInfo/NoticeDetailInfo';
import NoticeAttachments from '../../components/NoticeAttachments/NoticeAttachments';
import { formatDateCroatian } from '../../utils/formatters';
import './NoticeDetailPage.css';

function NoticeDetailPage() {
    const { noticeId } = useParams();

    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    const navigate = useNavigate();

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
                return <NoticeDetailInfo notice={notice} />;
            case 'attachments':
                return <NoticeAttachments noticeId={notice.id} />;
            default:
                return <NoticeDetailInfo notice={notice} />;
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
        </>
    );
}

export default NoticeDetailPage;
