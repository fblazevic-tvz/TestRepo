import React from 'react';
import PropTypes from 'prop-types';
import SuggestionCard from '../SuggestionCard/SuggestionCard'; 
import './SuggestionList.css'; 

function SuggestionList({ suggestions, showActions = false, onEdit, onDelete,  onVoteToggled }) {
  if (!suggestions || suggestions.length === 0) {
    return <p className="no-suggestions-message">Nisu pronađeni prijedlozi.</p>; 
  }

  return (
    <div className="suggestion-list-container"> 
      {suggestions.map((suggestion) => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
          onVoteToggled={ onVoteToggled}
        /> 
      ))}
    </div>
  );
}

SuggestionList.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    showActions: PropTypes.bool, 
    onEdit: PropTypes.func,      
    onDelete: PropTypes.func, 
    onVoteToggled: PropTypes.func 
  })).isRequired,
};

export default SuggestionList;