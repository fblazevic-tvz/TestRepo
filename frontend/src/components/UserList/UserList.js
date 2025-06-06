import React from 'react';
import PropTypes from 'prop-types';
import UserCard from '../UserCard/UserCard';
import './UserList.css';

function UserList({ users, onUserStatusChanged }) {
  if (!users || users.length === 0) {
    return <p className="no-users-message">Nema korisnika u sustavu.</p>;
  }

  return (
    <div className="user-list-container">
      {users.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          onUserStatusChanged={onUserStatusChanged}
        />
      ))}
    </div>
  );
}

UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
  onUserStatusChanged: PropTypes.func,
};

export default UserList;