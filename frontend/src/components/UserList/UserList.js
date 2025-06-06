import React from 'react';
import PropTypes from 'prop-types';
import UserCard from '../UserCard/UserCard';
import './UserList.css';

function UserList({ users }) {
  if (!users || users.length === 0) {
    return <p className="no-users-message">Nema korisnika u sustavu.</p>;
  }

  return (
    <div className="user-list-container">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
};

export default UserList;