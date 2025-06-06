import React from 'react';
import PropTypes from 'prop-types';
import ProposalCard from '../ProposalCard/ProposalCard';
import './ProposalList.css';

function ProposalList({ proposals, showActions = false, onEdit, onDelete }) {
  if (!proposals || proposals.length === 0) {
    return <p className="no-proposals-message">No proposals found at the moment.</p>;
  }

  return (
    <div className="proposal-list-container"> 
      {proposals.map((proposal) => (
        <ProposalCard 
          key={proposal.id} 
          proposal={proposal}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

ProposalList.propTypes = {
    proposals: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
    })).isRequired,
    showActions: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
};

export default ProposalList;