import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProposals } from '../../services/proposalService';
import { fetchNotices } from '../../services/noticeService';
import ProposalList from '../../components/ProposalList/ProposalList';
import NoticeList from '../../components/NoticeList/NoticeList';
import './FrontPage.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CallToActionSection from '../../components/CallToActionSection/CallToActionSection';

console.log('Type of LoadingSpinner:', typeof LoadingSpinner, LoadingSpinner);
console.log('Type of ProposalList:', typeof ProposalList, ProposalList);

function FrontPage() {
  const [proposals, setProposals] = useState([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [errorProposals, setErrorProposals] = useState(null);

  const [latestNotices, setLatestNotices] = useState([]);
  const [isLoadingNotices, setIsLoadingNotices] = useState(false);
  const [errorNotices, setErrorNotices] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProposals = async () => {
      setIsLoadingProposals(true);
      setErrorProposals(null);
      try {
        const data = await fetchProposals();
        setProposals(data);
      } catch (err) {
        setErrorProposals(err.message || 'Failed to load proposals.');
        setProposals([]);
      } finally {
        setIsLoadingProposals(false);
      }
    };
    loadProposals();
  }, []);

  useEffect(() => {
    const loadNotices = async () => {
      setIsLoadingNotices(true);
      setErrorNotices(null);
      try {
        const allNotices = await fetchNotices();
        const sortedNotices = allNotices.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLatestNotices(sortedNotices.slice(0, 3));
      } catch (err) {
        setErrorNotices(err.message || 'Failed to load notices.');
        setLatestNotices([]);
      } finally {
        setIsLoadingNotices(false);
      }
    };
    loadNotices();
  }, []);

  const limitedProposals = proposals.slice(0, 3);

  const goToAllNotices = () => {
    navigate('/notices');
  };

  return (
    <div className="front-page-layout">
      <CallToActionSection />

      <section className="novi-natjecaji-section">
      <h2 className="section-secondary-headline">Natječaji</h2>
        <div className="proposal-list-area">
          {isLoadingProposals && <LoadingSpinner />}
          {errorProposals && <div className="alert alert-danger">Error: {errorProposals}</div>}
          {!isLoadingProposals && !errorProposals && (
            limitedProposals.length > 0
              ? <ProposalList proposals={limitedProposals} />
              : <p className="no-proposals-message">Trenutno nema aktivnih natječaja.</p>
          )}
        </div>
        <button onClick={() => navigate('/proposals')} className="section-cta-button button-primary">
          Svi natječaji
        </button>
      </section>

      <section className="novosti-section">
        <div className="section-text-container">
          <div className="section-text-top">
            <h2 className="section-secondary-headline">Novosti</h2>
          </div>
        </div>

        <div className="notice-list-area">
          {isLoadingNotices && <LoadingSpinner />}
          {errorNotices && <div className="alert alert-danger">Error: {errorNotices}</div>}
          {!isLoadingNotices && !errorNotices && (
            latestNotices.length > 0
              ? <NoticeList notices={latestNotices} />
              : <p className="no-notices-message">Trenutno nema novih obavijesti.</p>
          )}
        </div>

        <button onClick={goToAllNotices} className="section-cta-button button-primary">
          Sve obavijesti
        </button>
      </section>
    </div>
  );
}

export default FrontPage;
