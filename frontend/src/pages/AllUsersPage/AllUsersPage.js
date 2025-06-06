import React, { useState, useEffect, useMemo } from 'react';
import { fetchUsers } from '../../services/userService';
import UserList from '../../components/UserList/UserList';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Sidebar from '../../components/Sidebar/Sidebar';
import './AllUsersPage.css';

const ITEMS_PER_PAGE = 12;

function AllUsersPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAllUsers = async () => {
      setIsLoading(true);
      setError(null);
      setAllUsers([]);
      try {
        const data = await fetchUsers();
        const sortedData = data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllUsers(sortedData);
        setCurrentPage(1);
      } catch (err) {
        setError(err.message || 'Failed to load users.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let tempUsers = allUsers;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempUsers = tempUsers.filter(user =>
        user.userName?.toLowerCase().includes(lowerSearchTerm) ||
        user.email?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (selectedRole) {
      tempUsers = tempUsers.filter(user =>
        user.role?.toLowerCase() === selectedRole.toLowerCase()
      );
    }

    return tempUsers;
  }, [allUsers, searchTerm, selectedRole]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="pagination-nav">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button prev-next"
        >
          « Prethodni
        </button>
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            disabled={currentPage === number}
            className={`pagination-button page-number ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button prev-next"
        >
          Sljedeći »
        </button>
      </nav>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-content">
        <h1>Upravljanje korisnicima</h1>
        
        <div className="filter-controls-container">
          <div className="filter-group">
            <label htmlFor="search-term" className="filter-label">Pretraži korisnike:</label>
            <input
              type="text"
              id="search-term"
              className="filter-input form-control"
              placeholder="Ime ili email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="role-select" className="filter-label">Uloga:</label>
            <select
              id="role-select"
              className="filter-select form-control"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={isLoading}
            >
              <option value="">-- Sve uloge --</option>
              <option value="Admin">Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <div className="alert alert-danger">Error loading data: {error}</div>}

        {!isLoading && !error && (
          <>
            {currentUsers.length > 0 ? (
              <>
                <div className="users-count">
                  Prikazano {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} od {filteredUsers.length} korisnika
                </div>
                <UserList users={currentUsers} />
                {renderPagination()}
              </>
            ) : (
              <p className="no-users-message">Nema korisnika koji odgovaraju zadanim filterima.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AllUsersPage;