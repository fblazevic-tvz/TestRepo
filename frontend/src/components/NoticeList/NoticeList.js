import React from 'react';
import PropTypes from 'prop-types';
import NoticeCard from '../NoticeCard/NoticeCard';
import './NoticeList.css';

function NoticeList({ notices, onEdit, onDelete }) {
  if (!notices || notices.length === 0) {
    return null; 
  }

  return (
    <div className="notice-list-container">
      {notices.map((notice) => (
        <NoticeCard 
          key={notice.id} 
          notice={notice}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

NoticeList.propTypes = {
  notices: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default NoticeList;