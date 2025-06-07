import React from 'react';
import PropTypes from 'prop-types';
import NoticeCard from '../NoticeCard/NoticeCard';
import './NoticeList.css';

function NoticeList({ notices, onEdit, onDelete }) {
  if (!notices || notices.length === 0) {
    return null;
  }

  return (
    <ul className="notice-list-container">
      {notices.map((notice) => (
        <li key={notice.id}>
          <NoticeCard
            notice={notice}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
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