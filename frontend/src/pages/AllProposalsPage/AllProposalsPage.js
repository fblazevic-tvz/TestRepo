import React, { useState, useEffect, useMemo } from 'react';
import { fetchProposals } from '../../services/proposalService';
import { fetchCities } from '../../services/cityService';
import ProposalList from '../../components/ProposalList/ProposalList';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AllProposalsPage.css';

const ITEMS_PER_PAGE = 8;

function AllProposalsPage() {
  const [allProposals, setAllProposals] = useState([]);
  const [cities, setCities] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [proposalsData, citiesData] = await Promise.all([
          fetchProposals(),
          fetchCities()
        ]);

        const sortedProposals = proposalsData.sort((a, b) =>
          new Date(b.submissionStart) - new Date(a.submissionStart)
        );
        setAllProposals(sortedProposals);
        setCities(citiesData);
        setCurrentPage(1);
      } catch (err) {
        setError(err.message || 'Failed to load initial data.');
        setAllProposals([]);
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const filteredProposals = useMemo(() => {
    let tempProposals = allProposals;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempProposals = tempProposals.filter(proposal =>
        proposal.name?.toLowerCase().includes(lowerSearchTerm) ||
        proposal.description?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (selectedCityId) {
      const cityId = parseInt(selectedCityId, 10);
      tempProposals = tempProposals.filter(proposal =>
        proposal.city?.id === cityId
      );
    }

    if (maxBudget && !isNaN(parseFloat(maxBudget))) {
      const budget = parseFloat(maxBudget);
      tempProposals = tempProposals.filter(proposal =>
        proposal.maxBudget <= budget
      );
    }

    return tempProposals;
  }, [allProposals, searchTerm, selectedCityId, maxBudget]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCityId, maxBudget]);

  const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProposals = filteredProposals.slice(startIndex, endIndex);

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
      <h1 className="all-proposals-title">Svi natječaji</h1>

      <div className="filter-controls-container">
        <div className="filter-group">
          <label htmlFor="search-term" className="filter-label">Pretraga (Naziv/Opis):</label>
          <input
            type="text"
            id="search-term"
            className="filter-input form-control"
            placeholder="Unesite pojam..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="city-select" className="filter-label">Grad:</label>
          <select
            id="city-select"
            className="filter-select form-control"
            value={selectedCityId}
            onChange={e => setSelectedCityId(e.target.value)}
            disabled={isLoading || cities.length === 0}
          >
            <option value="">-- Svi gradovi --</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name} ({city.postcode})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="max-budget" className="filter-label">Maksimalni budžet (EUR):</label>
          <input
            type="number"
            id="max-budget"
            className="filter-input form-control"
            placeholder="npr. 50000"
            min="0"
            value={maxBudget}
            onChange={e => setMaxBudget(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <div className="alert alert-danger">Error loading data: {error}</div>}

      {!isLoading && !error && (
        <>
          {currentProposals.length > 0 ? (
            <>
              <ProposalList proposals={currentProposals} />
              {renderPagination()}
            </>
          ) : (
            <p className="no-proposals-message">Nema natječaja koji odgovaraju zadanim filterima.</p>
          )}
        </>
      )}
    </>
  );
}

export default AllProposalsPage;
