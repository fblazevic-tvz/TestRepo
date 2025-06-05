import React, { useState, useEffect, useMemo } from 'react';
import { fetchNotices } from '../../services/noticeService';
import NoticeList from '../../components/NoticeList/NoticeList';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AllNoticesPage.css';

const ITEMS_PER_PAGE = 12;

function AllNoticesPage() {
  const [allNotices, setAllNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [proposalTerm, setProposalTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAllNotices = async () => {
      setIsLoading(true);
      setError(null);
      setAllNotices([]);
      try {
        const data = await fetchNotices();
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllNotices(sortedData);
        setCurrentPage(1);
      } catch (err) {
        setError(err.message || 'Failed to load notices.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllNotices();
  }, []);

  const filteredNotices = useMemo(() => {
    let tempNotices = allNotices;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempNotices = tempNotices.filter(notice =>
        notice.title?.toLowerCase().includes(lowerSearchTerm) ||
        notice.content?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (proposalTerm) {
      const lowerProposalTerm = proposalTerm.toLowerCase();
      tempNotices = tempNotices.filter(notice =>
        notice.proposal?.name?.toLowerCase().includes(lowerProposalTerm)
      );
    }

    return tempNotices;
  }, [allNotices, searchTerm, proposalTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, proposalTerm]);

  const totalPages = Math.ceil(filteredNotices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNotices = filteredNotices.slice(startIndex, endIndex);

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
          « Previous
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
          Next »
        </button>
      </nav>
    );
  };

  return (
    <>
      <h1 className="all-notices-title">Sve obavijesti</h1>

      <div className="filter-controls-container">
        <div className="filter-group">
          <label htmlFor="search-term" className="filter-label">Pretraga obavijesti (Naslov/Sadržaj):</label>
          <input
            type="text"
            id="search-term"
            className="filter-input form-control"
            placeholder="Unesite pojam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="proposal-term" className="filter-label">Povezani natječaj (Naziv):</label>
          <input
            type="text"
            id="proposal-term"
            className="filter-input form-control"
            placeholder="Unesite naziv natječaja..."
            value={proposalTerm}
            onChange={(e) => setProposalTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <div className="alert alert-danger">Error loading data: {error}</div>}

      {!isLoading && !error && (
        <>
          {currentNotices.length > 0 ? (
            <>
              <NoticeList notices={currentNotices} />
              {renderPagination()}
            </>
          ) : (
            <p className="no-notices-message">Nema obavijesti koje odgovaraju zadanim filterima.</p>
          )}
        </>
      )}
    </>
  );
}

export default AllNoticesPage;
