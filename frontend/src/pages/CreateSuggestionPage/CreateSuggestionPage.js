import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createSuggestion } from '../../services/suggestionService';
import { uploadSuggestionAttachments } from '../../services/suggestionAttachmentService';
import { fetchProposalById } from '../../services/proposalService';
import { fetchLocations } from '../../services/locationService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import './CreateSuggestionPage.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function CreateSuggestionPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const proposalId = query.get('proposalId');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [locationId, setLocationId] = useState('');

  // File attachment states
  const [attachments, setAttachments] = useState([]);
  const [fileDescriptions, setFileDescriptions] = useState([]);

  const [proposal, setProposal] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });

  useEffect(() => {
    if (!proposalId || isNaN(parseInt(proposalId))) {
      setError('Nije pronađen važeći ID natječaja u URL-u.');
      setIsLoading(false);
      return;
    }
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/create-suggestion?proposalId=${proposalId}` } });
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [proposalData, locationsData] = await Promise.all([
          fetchProposalById(proposalId),
          fetchLocations()
        ]);
        setProposal(proposalData);
        setLocations(locationsData);
      } catch (err) {
        setError(err.message || 'Greška pri dohvaćanju podataka za formu.');
        setProposal(null);
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [proposalId, isAuthenticated, navigate]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      // Check file type (only PDFs allowed based on backend)
      if (file.type !== 'application/pdf') {
        setSubmitStatus({ success: false, message: `Datoteka ${file.name} nije PDF format. Samo PDF datoteke su dozvoljene.` });
        return false;
      }
      // Check file size (10MB limit based on backend)
      if (file.size > 10 * 1024 * 1024) {
        setSubmitStatus({ success: false, message: `Datoteka ${file.name} prelazi maksimalnu veličinu od 10MB.` });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setAttachments([...attachments, ...validFiles]);
      // Add empty descriptions for new files
      const newDescriptions = [...fileDescriptions];
      validFiles.forEach(() => newDescriptions.push(''));
      setFileDescriptions(newDescriptions);
    }
  };

  const handleRemoveFile = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    const newDescriptions = fileDescriptions.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    setFileDescriptions(newDescriptions);
  };

  const handleDescriptionChange = (index, value) => {
    const newDescriptions = [...fileDescriptions];
    newDescriptions[index] = value;
    setFileDescriptions(newDescriptions);
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

    const suggestionData = {
      name: name.trim(),
      description: description.trim(),
      estimatedCost: cost,
      proposalId: parseInt(proposalId, 10),
      locationId: parseInt(locationId, 10)
    };

    try {
      // First create the suggestion
      const createdSuggestion = await createSuggestion(suggestionData);
      
      // Then upload attachments if any
      if (attachments.length > 0) {
        try {
          await uploadSuggestionAttachments(createdSuggestion.id, attachments, fileDescriptions);
        } catch (attachmentError) {
          console.error('Failed to upload attachments:', attachmentError);
          // Continue even if attachments fail
        }
      }

      setSubmitStatus({ success: true, message: 'Prijedlog uspješno kreiran!' });
      setName('');
      setDescription('');
      setEstimatedCost('');
      setLocationId('');
      setAttachments([]);
      setFileDescriptions([]);
      
      setTimeout(() => {
        navigate(`/proposals/${proposalId}`);
      }, 300);
    } catch (err) {
      setSubmitStatus({ success: false, message: err.message || 'Greška pri kreiranju prijedloga.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger form-container">Greška: {error} <Link to="/">Povratak</Link></div>;
  if (!proposal) return <div className="alert alert-danger form-container">Natječaj nije pronađen. <Link to="/">Povratak</Link></div>;

  return (
    <div className="create-suggestion-container form-container">
      <h1 className="form-title">Stvori prijedlog za ovaj natječaj:</h1>
      <h2 className="form-subtitle">{proposal.name}</h2>

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
            {locations.length === 0 && <option disabled>Nema dostupnih lokacija</option>}
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.address ? `(${loc.address})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Prilozi (PDF dokumenti):</label>
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

          {attachments.length > 0 && (
            <div className="attachments-list">
              <h4>Odabrani dokumenti:</h4>
              {attachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <div className="attachment-info">
                    <span className="attachment-name">{file.name}</span>
                    <span className="attachment-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Opis dokumenta (opcionalno)"
                    value={fileDescriptions[index]}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    className="attachment-description"
                    disabled={isSubmitting}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
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
            {isSubmitting ? 'Slanje...' : 'Pošalji prijedlog'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/proposals/${proposalId}`)}
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

export default CreateSuggestionPage;