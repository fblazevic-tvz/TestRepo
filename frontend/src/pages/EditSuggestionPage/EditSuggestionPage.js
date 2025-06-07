import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchSuggestionById, updateSuggestion } from '../../services/suggestionService';
import { fetchSuggestionAttachments, uploadSuggestionAttachments, deleteSuggestionAttachment } from '../../services/suggestionAttachmentService';
import { fetchLocations } from '../../services/locationService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import './EditSuggestionPage.css';

function EditSuggestionPage() {
  const { suggestionId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [locationId, setLocationId] = useState('');

  // Existing attachments
  const [existingAttachments, setExistingAttachments] = useState([]);
  // New attachments to upload
  const [newAttachments, setNewAttachments] = useState([]);
  const [newFileDescriptions, setNewFileDescriptions] = useState([]);

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
      const [suggestionData, locationsData, attachmentsData] = await Promise.all([
        fetchSuggestionById(suggestionId),
        fetchLocations(),
        fetchSuggestionAttachments(suggestionId)
      ]);

      const suggestionAuthorId = suggestionData?.authorId;
      const currentUserIdNum = currentUser?.userId ? parseInt(currentUser.userId, 10) : null;

      if (suggestionAuthorId !== currentUserIdNum) {
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
      setExistingAttachments(attachmentsData);

    } catch (err) {
      setError(err.message || 'Greška pri dohvaćanju podataka za uređivanje.');
      setOriginalSuggestion(null);
      setLocations([]);
      setExistingAttachments([]);
    } finally {
      setIsLoading(false);
    }
  }, [suggestionId, isAuthenticated, navigate, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteExistingAttachment = async (attachmentId) => {
    const confirmDelete = window.confirm('Jeste li sigurni da želite obrisati ovaj prilog?');
    if (!confirmDelete) return;

    try {
      await deleteSuggestionAttachment(attachmentId);
      setExistingAttachments(existingAttachments.filter(att => att.id !== attachmentId));
      setSubmitStatus({ success: true, message: 'Prilog uspješno obrisan.' });
    } catch (err) {
      setSubmitStatus({ success: false, message: err.message || 'Greška pri brisanju priloga.' });
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      if (file.type !== 'application/pdf') {
        setSubmitStatus({ success: false, message: `Datoteka ${file.name} nije PDF format. Samo PDF datoteke su dozvoljene.` });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setSubmitStatus({ success: false, message: `Datoteka ${file.name} prelazi maksimalnu veličinu od 10MB.` });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setNewAttachments([...newAttachments, ...validFiles]);
      const newDescriptions = [...newFileDescriptions];
      validFiles.forEach(() => newDescriptions.push(''));
      setNewFileDescriptions(newDescriptions);
    }
  };

  const handleRemoveNewFile = (index) => {
    const updatedAttachments = newAttachments.filter((_, i) => i !== index);
    const updatedDescriptions = newFileDescriptions.filter((_, i) => i !== index);
    setNewAttachments(updatedAttachments);
    setNewFileDescriptions(updatedDescriptions);
  };

  const handleNewDescriptionChange = (index, value) => {
    const updatedDescriptions = [...newFileDescriptions];
    updatedDescriptions[index] = value;
    setNewFileDescriptions(updatedDescriptions);
  };

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

      // Upload new attachments if any
      if (newAttachments.length > 0) {
        try {
          await uploadSuggestionAttachments(suggestionId, newAttachments, newFileDescriptions);
        } catch (attachmentError) {
          console.error('Failed to upload new attachments:', attachmentError);
          // Continue even if attachments fail
        }
      }

      setSubmitStatus({ success: true, message: 'Prijedlog uspješno ažuriran!' });
      setTimeout(() => {
        navigate(`/suggestions/${suggestionId}`);
      }, 300);
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

        <div className="form-group">
          <label>Postojeći prilozi:</label>
          {existingAttachments.length > 0 ? (
            <div className="existing-attachments-list">
              {existingAttachments.map(att => (
                <div key={att.id} className="existing-attachment-item">
                  <div className="attachment-info">
                    <span className="attachment-name">{att.fileName}</span>
                    {att.description && <span className="attachment-desc">({att.description})</span>}
                    <span className="attachment-size">{(att.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteExistingAttachment(att.id)}
                    disabled={isSubmitting}
                    className="delete-attachment-button"
                    title="Obriši prilog"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-attachments-text">Nema postojećih priloga.</p>
          )}
        </div>

        <div className="form-group">
          <label>Dodaj nove priloge (PDF dokumenti):</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isSubmitting}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="file-upload-button">
              <AttachFileIcon /> Dodaj PDF dokumente
            </label>
            <span className="file-hint">Maksimalna veličina: 10MB po datoteci. Samo PDF format.</span>
          </div>

          {newAttachments.length > 0 && (
            <div className="attachments-list">
              <h4>Novi dokumenti:</h4>
              {newAttachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <div className="attachment-info">
                    <span className="attachment-name">{file.name}</span>
                    <span className="attachment-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Opis dokumenta (opcionalno)"
                    value={newFileDescriptions[index]}
                    onChange={(e) => handleNewDescriptionChange(index, e.target.value)}
                    className="attachment-description"
                    disabled={isSubmitting}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveNewFile(index)}
                    disabled={isSubmitting}
                    className="remove-attachment-button"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
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