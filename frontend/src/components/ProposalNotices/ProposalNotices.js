import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchNoticesByProposalId } from '../../services/noticeService'; 
import NoticeList from '../NoticeList/NoticeList'; 
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './ProposalNotices.css'; 

function ProposalNotices({ proposalId }) {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

    return (
        <div className="proposal-notices"> 
            <h2>Povezane obavijesti</h2> 

            {isLoading && <LoadingSpinner />}
            {error && <div className="alert alert-danger">Error: {error}</div>}

            {!isLoading && !error && (
                notices.length > 0
                    ? <NoticeList notices={notices} />
                    : <p className="no-proposal-notices-message">Nema povezanih obavijesti za ovaj natječaj.</p>
            )}
        </div>
    );
}

ProposalNotices.propTypes = {
    proposalId: PropTypes.number,
};

export default ProposalNotices;