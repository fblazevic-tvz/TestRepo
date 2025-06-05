import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchSuggestionById } from '../../services/suggestionService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import SuggestionDetailInfo from '../../components/SuggestionDetailInfo/SuggestionDetailInfo';
import SuggestionAttachments from '../../components/SuggestionAttachments/SuggestionAttachments';
import SuggestionComments from '../../components/SuggestionComments/SuggestionComments';
import { formatDateCroatian } from '../../utils/formatters';
import './SuggestionDetailPage.css';

function SuggestionDetailPage() {
    const { suggestionId } = useParams();
    const navigate = useNavigate();

    const [suggestion, setSuggestion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (!suggestionId || isNaN(parseInt(suggestionId, 10))) {
            setError("Nevažeći ID prijedloga.");
            setIsLoading(false);
            return;
        }
        const loadSuggestion = async () => {
            console.log(`Fetching suggestion with ID: ${suggestionId}`);
            setIsLoading(true);
            setError(null);
            setSuggestion(null);
            try {
                const data = await fetchSuggestionById(suggestionId);
                console.log("Fetched suggestion data:", data);
                setSuggestion(data);
            } catch (err) {
                console.error(`Error fetching suggestion ${suggestionId}:`, err);
                setError(err.message || `Dohvaćanje prijedloga ${suggestionId} nije uspjelo.`);
                setSuggestion(null);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadSuggestion();
    }, [suggestionId]);

    const renderHeader = () => {
        if (isLoading) {
            return (
                <div className="suggestion-detail-header">
                    <h1>Učitavanje prijedloga...</h1>
                </div>
            );
        }
        if (error || !suggestion) {
            return (
                <div className="suggestion-detail-header">
                    <h1>Greška</h1>
                    <p className="suggestion-header-meta">Prijedlog nije moguće učitati.</p>
                </div>
            );
        }
        return (
            <div className="suggestion-detail-header">
                <h1>{suggestion.name || "Prijedlog bez naziva"}</h1>
                <p className="suggestion-header-meta">
                    Status: {suggestion.status} | Podneseno: {formatDateCroatian(suggestion.createdAt)}
                </p>
            </div>
        );
    };

    const renderTabs = () => {
        if (isLoading || error || !suggestion) return null;
        return (
            <div className="detail-page-tabs suggestion-tabs">
                <button onClick={() => setActiveTab('details')} className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}>Detalji</button>
                <button onClick={() => setActiveTab('attachments')} className={`tab-button ${activeTab === 'attachments' ? 'active' : ''}`}>Dodatci</button>
                <button onClick={() => setActiveTab('comments')} className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}>Komentari ({suggestion?.comments?.length || 0})</button>
            </div>
        );
    };

    const renderTabContent = () => {
        if (isLoading || error || !suggestion) return null;

        switch (activeTab) {
            case 'details':
                return <SuggestionDetailInfo suggestion={suggestion} />;
            case 'attachments':
                return <SuggestionAttachments suggestionId={suggestion.id} attachments={suggestion.attachments} />;
            case 'comments':
                return <SuggestionComments
                    suggestionId={suggestion.id}
                    initialComments={suggestion.comments || []}
                />;
            default:
                return <SuggestionDetailInfo suggestion={suggestion} />;
        }
    };

    const goBack = () => navigate(-1);

    return (
        <>
            <div className="back-link-container">
                <button onClick={goBack} className="back-link-button">← Natrag</button>
            </div>

            {isLoading && !suggestion && <LoadingSpinner />}

            {error && !isLoading && !suggestion && (
                <div className="alert alert-danger detail-error">
                    Greška: {error} <br />
                    <Link to="/suggestions">Vrati se na popis prijedloga</Link>
                </div>
            )}

            {!isLoading && renderHeader()}

            {!isLoading && !error && suggestion && (
                <div className="detail-page-content-area suggestion-content-area">
                    {renderTabs()}
                    <div className="tab-content">
                        {renderTabContent()}
                    </div>
                </div>
            )}
        </>
    );
}

export default SuggestionDetailPage;