import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchNotices, deleteNotice } from '../../services/noticeService';
import NoticeList from '../../components/NoticeList/NoticeList';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import EditNoticeModal from '../../components/EditNoticeModal/EditNoticeModal';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import './AllNoticesPage.css';

const ITEMS_PER_PAGE = 12;

function AllNoticesPage() {
  const [allNotices, setAllNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [proposalTerm, setProposalTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [noticeToEdit, setNoticeToEdit] = useState(null);
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState({ id: null, title: '' });
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEdit = useCallback((notice) => {
    setNoticeToEdit(notice);
    setIsEditModalOpen(true);
  }, []);

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setNoticeToEdit(null);
  };

  const handleNoticeUpdated = (updatedNotice) => {
    setAllNotices(prevNotices => 
      prevNotices.map(notice => 
        notice.id === updatedNotice.id ? updatedNotice : notice
      )
    );
    setIsEditModalOpen(false);
    setNoticeToEdit(null);
  };

  const handleDelete = useCallback((noticeId, noticeTitle) => {
    setNoticeToDelete({ id: noticeId, title: noticeTitle });
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteModalClose = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setNoticeToDelete({ id: null, title: '' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!noticeToDelete.id) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await deleteNotice(noticeToDelete.id);
      setAllNotices(prevNotices => 
        prevNotices.filter(notice => notice.id !== noticeToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setNoticeToDelete({ id: null, title: '' });
    } catch (err) {
      setError(err.message || 'Brisanje obavijesti nije uspjelo.');
    } finally {
      setIsDeleting(false);
    }
  };

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
              <NoticeList notices={currentNotices} onEdit={handleEdit} onDelete={handleDelete} />
              {renderPagination()}
            </>
          ) : (
            <p className="no-notices-message">Nema obavijesti koje odgovaraju zadanim filterima.</p>
          )}
        </>
      )}

      <EditNoticeModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        notice={noticeToEdit}
        onNoticeUpdated={handleNoticeUpdated}
      />
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleConfirmDelete}
        title="Potvrdi brisanje obavijesti"
        message={`Jeste li sigurni da želite obrisati obavijest "${noticeToDelete.title}"? Ova akcija ne može biti poništena.`}
        confirmText="Obriši"
        cancelText="Odustani"
        isLoading={isDeleting}
      />
    </>
  );
}

export default AllNoticesPage;