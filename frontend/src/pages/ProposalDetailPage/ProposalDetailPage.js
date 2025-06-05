import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProposalById } from '../../services/proposalService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ProposalDetailInfo from '../../components/ProposalDetailInfo/ProposalDetailInfo';
import ProposalParticipate from '../../components/ProposalParticipate/ProposalParticipate';
import ProposalSuggestions from '../../components/ProposalSuggestions/ProposalSuggestions';
import ProposalNotices from '../../components/ProposalNotices/ProposalNotices';
import { formatDateCroatian } from '../../utils/formatters';

import './ProposalDetailPage.css';



function ProposalDetailPage() {
    const { proposalId } = useParams();

    const [proposal, setProposal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (!proposalId) {
            setError("Proposal ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const loadProposal = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchProposalById(proposalId);
                setProposal(data);
            } catch (err) {
                setError(err.message || `Failed to load proposal ${proposalId}.`);
                setProposal(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadProposal();
    }, [proposalId]);


    const renderHeader = () => {
        if (!proposal && !isLoading) return null;

        const proposalName = isLoading ? "Loading..." : (proposal?.name || "Natječaj nije pronađen");

        return (
            <section className="detail-page-header">
                <div className="header-content">
                    <h1 className="header-headline">{proposalName}</h1>

                    {!isLoading && proposal && (
                         <p className="header-meta">
                             Objavljeno: {formatDateCroatian(proposal.createdAt)} | Status: {proposal.status}
                         </p>
                     )}
                </div>
                <div className="header-image-area">
                <div className="proposal-card-image-container">
                <img
                    src="/proposal.jpg"
                    alt="Vizualni prikaz za natječaj"
                    className="proposal-card-image"
                    loading="lazy"
                />
            </div>
                </div>
            </section>
        );
    };

    const renderTabs = () => {
        if (isLoading || error || !proposal) return null;

        return (
            <div className="detail-page-tabs">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                >
                    Natječaj
                </button>
                <button
                    onClick={() => setActiveTab('participate')}
                    className={`tab-button ${activeTab === 'participate' ? 'active' : ''}`}
                >
                    Sudjeluj
                </button>
                 <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`tab-button ${activeTab === 'suggestions' ? 'active' : ''}`}
                >
                    Prijedlozi
                </button>
                <button
                    onClick={() => setActiveTab('notices')}
                    className={`tab-button ${activeTab === 'notices' ? 'active' : ''}`}
                >
                    Obavijesti
                </button>

            </div>
        );
    }

    const renderTabContent = () => {
        if (isLoading || error || !proposal) return null;

        switch (activeTab) {
            case 'details':
                return <ProposalDetailInfo proposal={proposal} />;
            case 'participate':
                return <ProposalParticipate proposalId={proposal.id} />;
            case 'suggestions':
                return <ProposalSuggestions proposalId={proposal.id} />;
            case 'notices':
                return <ProposalNotices proposalId={proposal.id} />;
            default:
                return <ProposalDetailInfo proposal={proposal} />;
        }
    };

    return (
        <>

             <div className="back-link-container">
                <Link to="/proposals" className="back-link">← Natrag na sve natječaje</Link>
             </div>


            {isLoading && <LoadingSpinner />}
            {error && !isLoading && (
                 <div className="alert alert-danger detail-error">
                     Error: {error}
                     <br />
                     <Link to="/proposals">Vrati se na popis</Link>
                 </div>
             )}


            {renderHeader()}


            {!isLoading && !error && proposal && (
                <div className="detail-page-content-area">
                    {renderTabs()}
                    <div className="tab-content">
                        {renderTabContent()}
                    </div>
                </div>
            )}
        </>
    );
}

export default ProposalDetailPage;