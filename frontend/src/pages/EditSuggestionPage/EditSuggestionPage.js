import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchSuggestionById, updateSuggestion } from '../../services/suggestionService';
import { fetchLocations } from '../../services/locationService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './EditSuggestionPage.css';

function EditSuggestionPage() {
  const { suggestionId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [locationId, setLocationId] = useState('');

  const [originalSuggestion, setOriginalSuggestion] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });

  const loadData = useCallback(async () => {
    if (!suggestionId || isNaN(parseInt(suggestionId))) {
      setError('Nevažeći ID prijedloga.');
      setIsLoading(false);
      return;
    }
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/suggestions/edit/${suggestionId}` } });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [suggestionData, locationsData] = await Promise.all([
        fetchSuggestionById(suggestionId),
        fetchLocations()
      ]);

      const suggestionAuthorId = suggestionData?.authorId;
      const currentUserIdNum = currentUser?.userId ? parseInt(currentUser.userId, 10) : null;
      const isAdminOrMod = currentUser?.role === 'Admin' || currentUser?.role === 'Moderator';

      if (suggestionAuthorId !== currentUserIdNum && !isAdminOrMod) {
        setError('Nemate dozvolu za uređivanje ovog prijedloga.');
        setOriginalSuggestion(null);
        setIsLoading(false);
        return;
      }

      setOriginalSuggestion(suggestionData);
      setName(suggestionData.name || '');
      setDescription(suggestionData.description || '');
      setEstimatedCost(suggestionData.estimatedCost?.toString() || '');
      setLocationId(suggestionData.locationId?.toString() || '');
      setLocations(locationsData);

    } catch (err) {
      setError(err.message || 'Greška pri dohvaćanju podataka za uređivanje.');
      setOriginalSuggestion(null);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  }, [suggestionId, isAuthenticated, navigate, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitStatus({ success: false, message: '' });

    if (!name.trim() || !description.trim() || !estimatedCost || !locationId) {
      setSubmitStatus({ success: false, message: 'Sva polja su obavezna.' });
      return;
    }
    const cost = parseFloat(estimatedCost);
    if (isNaN(cost) || cost <= 0) {
      setSubmitStatus({ success: false, message: 'Procijenjeni trošak mora biti pozitivan broj.' });
      return;
    }

    setIsSubmitting(true);

    const updateData = {
      name: name.trim(),
      description: description.trim(),
      estimatedCost: cost,
      locationId: parseInt(locationId, 10),
    };

    try {
      await updateSuggestion(suggestionId, updateData);
      setSubmitStatus({ success: true, message: 'Prijedlog uspješno ažuriran!' });
      setTimeout(() => {
        navigate(`/suggestions/${suggestionId}`);
      }, 1500);
    } catch (err) {
      setSubmitStatus({ success: false, message: err.message || 'Greška pri ažuriranju prijedloga.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger form-container">Greška: {error} <Link to="/dashboard">Povratak na dashboard</Link></div>;
  if (!originalSuggestion) return <div className="alert alert-warning form-container">Nije moguće učitati podatke prijedloga. <Link to="/dashboard">Povratak</Link></div>;

  return (
    <div className="edit-suggestion-container form-container">
      <h1 className="form-title">Uredi prijedlog</h1>
      <h2 className="form-subtitle">{originalSuggestion?.name || 'Prijedlog'}</h2>

      <form onSubmit={handleSubmit} noValidate>
        {submitStatus.message && (
          <div className={`alert ${submitStatus.success ? 'alert-success' : 'alert-danger'}`}>
            {submitStatus.message}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="suggestion-name">Naziv prijedloga:</label>
          <input
            type="text"
            id="suggestion-name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={150}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="suggestion-description">Opis:</label>
          <textarea
            id="suggestion-description"
            className="form-control"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="suggestion-cost">Procijenjeni trošak (EUR):</label>
          <input
            type="number"
            id="suggestion-cost"
            className="form-control"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            required
            min="0.01"
            step="0.01"
            placeholder="npr. 1500.50"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="suggestion-location">Lokacija:</label>
          <select
            id="suggestion-location"
            className="form-control"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
            disabled={isSubmitting || locations.length === 0}
          >
            <option value="" disabled>-- Odaberi lokaciju --</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.address ? `(${loc.address})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="button-primary form-submit-button"
            disabled={isSubmitting || submitStatus.success}
          >
            {isSubmitting ? 'Spremanje...' : 'Spremi Promjene'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/suggestions/${suggestionId}`)}
            className="button-secondary form-cancel-button"
            disabled={isSubmitting}
          >
            Odustani
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditSuggestionPage;
