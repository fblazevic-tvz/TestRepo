import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDateCroatian, formatCurrencyEuroCroatian } from '../../utils/formatters'; 
import './SuggestionDetailInfo.css'; 

function SuggestionDetailInfo({ suggestion }) {
    if (!suggestion) {
        return <p>Podaci o prijedlogu nisu dostupni.</p>;
    }

    const {
        description = "Nema dostupnog opisa.",
        estimatedCost = null,
        status = null,
        createdAt = null,
        author = null, 
        location = null,
        proposal = null, 
        votes = [],
    } = suggestion;

    const authorName = author?.userName || "Anonimno";
    const locationName = location?.name || location?.address || "Nepoznata lokacija";
    const locationCityName = location?.city?.name || ""; 
    const proposalName = proposal?.name || "Nepoznat Natječaj";
    const voteCount = votes?.length || 0;

    return (
        <div className="suggestion-detail-layout"> 
            <div className="suggestion-content-main">
                <h3>Opis prijedloga</h3>
                <p className="suggestion-content-text">{description}</p>
                 <p className="suggestion-meta">
                     Podneseno: {formatDateCroatian(createdAt)} | Autor: {authorName}
                 </p>
            </div>

            <aside className="suggestion-info-sidebar">
                <h4>Informacije o Prijedlogu</h4>
                <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Status:</span>
                    <span className="sidebar-info-value status">{status}</span>
                </div>
                 <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Procijenjeni trošak:</span>
                    <span className="sidebar-info-value budget">{formatCurrencyEuroCroatian(estimatedCost)}</span>
                </div>
                 <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Broj glasova:</span>
                    <span className="sidebar-info-value votes">{voteCount}</span>
                </div>
                <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Lokacija:</span>
                    <span className="sidebar-info-value location">{locationName}{locationCityName ? `, ${locationCityName}` : ''}</span>
                </div>

                {proposal?.id && (
                    <div className="related-proposal-info">
                         <h5>Povezani natječaj</h5>
                         <p>
                             <Link to={`/proposals/${proposal.id}`} className="sidebar-link-to-proposal">
                                 {proposalName}
                             </Link>
                         </p>
                    </div>
                 )}
            </aside>
        </div>
    );
}

SuggestionDetailInfo.propTypes = {
    suggestion: PropTypes.object, 
};

export default SuggestionDetailInfo;