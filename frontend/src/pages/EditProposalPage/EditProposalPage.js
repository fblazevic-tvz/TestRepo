import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProposalById, updateProposal } from '../../services/proposalService';
import { fetchProposalAttachments, uploadProposalAttachments, deleteProposalAttachment } from '../../services/proposalAttachmentService';
import { fetchCities } from '../../services/cityService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import './EditProposalPage.css';

function EditProposalPage() {
    const { proposalId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [submissionStartDate, setSubmissionStartDate] = useState('');
    const [submissionStartTime, setSubmissionStartTime] = useState('00:00');
    const [submissionEndDate, setSubmissionEndDate] = useState('');
    const [submissionEndTime, setSubmissionEndTime] = useState('23:59');
    const [status, setStatus] = useState('');
    const [cityId, setCityId] = useState('');

    // Existing attachments
    const [existingAttachments, setExistingAttachments] = useState([]);
    // New attachments to upload
    const [newAttachments, setNewAttachments] = useState([]);
    const [newFileDescriptions, setNewFileDescriptions] = useState([]);

    const [originalProposal, setOriginalProposal] = useState(null);
    const [cities, setCities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });

    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return { date: '', time: '00:00' };
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return {
            date: `${year}-${month}-${day}`,
            time: `${hours}:${minutes}`
        };
    };

    const loadData = useCallback(async () => {
        if (!proposalId || isNaN(parseInt(proposalId))) {
            setError('Nevažeći ID natječaja.');
            setIsLoading(false);
            return;
        }
        if (!isAuthenticated || user?.role !== 'Moderator') {
            navigate('/dashboard');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const [proposalData, citiesData, attachmentsData] = await Promise.all([
                fetchProposalById(proposalId),
                fetchCities(),
                fetchProposalAttachments(proposalId)
            ]);

            const proposalModeratorId = proposalData?.moderatorId;
            const currentUserIdNum = user?.userId ? parseInt(user.userId, 10) : null;

            if (proposalModeratorId !== currentUserIdNum) {
                setError('Nemate dozvolu za uređivanje ovog natječaja.');
                setOriginalProposal(null);
                setIsLoading(false);
                return;
            }

            setOriginalProposal(proposalData);
            setName(proposalData.name || '');
            setDescription(proposalData.description || '');
            setMaxBudget(proposalData.maxBudget?.toString() || '');

            const startDateTime = formatDateTimeLocal(proposalData.submissionStart);
            setSubmissionStartDate(startDateTime.date);
            setSubmissionStartTime(startDateTime.time);

            const endDateTime = formatDateTimeLocal(proposalData.submissionEnd);
            setSubmissionEndDate(endDateTime.date);
            setSubmissionEndTime(endDateTime.time);

            setStatus(proposalData.status || 'Active');
            setCityId(proposalData.cityId?.toString() || '');
            setCities(citiesData);
            setExistingAttachments(attachmentsData);

        } catch (err) {
            setError(err.message || 'Greška pri dohvaćanju podataka za uređivanje.');
            setOriginalProposal(null);
            setCities([]);
            setExistingAttachments([]);
        } finally {
            setIsLoading(false);
        }
    }, [proposalId, isAuthenticated, navigate, user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDeleteExistingAttachment = async (attachmentId) => {
        const confirmDelete = window.confirm('Jeste li sigurni da želite obrisati ovaj prilog?');
        if (!confirmDelete) return;

        try {
            await deleteProposalAttachment(attachmentId);
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

        if (!name.trim() || !description.trim() || !maxBudget || !submissionStartDate || !submissionEndDate || !cityId) {
            setSubmitStatus({ success: false, message: 'Sva polja su obavezna.' });
            return;
        }

        const budget = parseFloat(maxBudget);
        if (isNaN(budget) || budget <= 0) {
            setSubmitStatus({ success: false, message: 'Maksimalni budžet mora biti pozitivan broj.' });
            return;
        }

        // Combine date and time
        const startDateTime = new Date(`${submissionStartDate}T${submissionStartTime}:00`);
        const endDateTime = new Date(`${submissionEndDate}T${submissionEndTime}:59`);

        if (endDateTime <= startDateTime) {
            setSubmitStatus({ success: false, message: 'Datum završetka mora biti nakon datuma početka.' });
            return;
        }

        setIsSubmitting(true);

        const updateData = {
            name: name.trim(),
            description: description.trim(),
            maxBudget: budget,
            submissionStart: startDateTime.toISOString(),
            submissionEnd: endDateTime.toISOString(),
            status: status,
            cityId: parseInt(cityId, 10)
        };

        try {
            await updateProposal(proposalId, updateData);

            // Upload new attachments if any
            if (newAttachments.length > 0) {
                try {
                    await uploadProposalAttachments(proposalId, newAttachments, newFileDescriptions);
                } catch (attachmentError) {
                    console.error('Failed to upload new attachments:', attachmentError);
                    // Continue even if attachments fail
                }
            }

            setSubmitStatus({ success: true, message: 'Natječaj uspješno ažuriran!' });
            setTimeout(() => {
                navigate(`/proposals/${proposalId}`);
            }, 300);
        } catch (err) {
            setSubmitStatus({ success: false, message: err.message || 'Greška pri ažuriranju natječaja.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger form-container">Greška: {error} <Link to="/dashboard">Povratak na dashboard</Link></div>;
    if (!originalProposal) return <div className="alert alert-warning form-container">Nije moguće učitati podatke natječaja. <Link to="/dashboard">Povratak</Link></div>;

    return (
        <div className="edit-proposal-container form-container">
            <h1 className="form-title">Uredi natječaj</h1>
            <h2 className="form-subtitle">{originalProposal?.name || 'Natječaj'}</h2>

            <form onSubmit={handleSubmit} noValidate>
                {submitStatus.message && (
                    <div className={`alert ${submitStatus.success ? 'alert-success' : 'alert-danger'}`}>
                        {submitStatus.message}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="proposal-name">Naziv natječaja:</label>
                    <input
                        type="text"
                        id="proposal-name"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={150}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="proposal-description">Opis:</label>
                    <textarea
                        id="proposal-description"
                        className="form-control"
                        rows="5"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="proposal-budget">Maksimalni budžet (EUR):</label>
                    <input
                        type="number"
                        id="proposal-budget"
                        className="form-control"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        required
                        min="0.01"
                        step="0.01"
                        placeholder="npr. 50000.00"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="submission-start-date">Početak prijava - datum:</label>
                        <input
                            type="date"
                            id="submission-start-date"
                            className="form-control"
                            value={submissionStartDate}
                            onChange={(e) => setSubmissionStartDate(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="submission-start-time">Početak prijava - vrijeme:</label>
                        <input
                            type="time"
                            id="submission-start-time"
                            className="form-control"
                            value={submissionStartTime}
                            onChange={(e) => setSubmissionStartTime(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="submission-end-date">Kraj prijava - datum:</label>
                        <input
                            type="date"
                            id="submission-end-date"
                            className="form-control"
                            value={submissionEndDate}
                            onChange={(e) => setSubmissionEndDate(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="submission-end-time">Kraj prijava - vrijeme:</label>
                        <input
                            type="time"
                            id="submission-end-time"
                            className="form-control"
                            value={submissionEndTime}
                            onChange={(e) => setSubmissionEndTime(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="city-select">Grad:</label>
                        <select
                            id="city-select"
                            className="form-control"
                            value={cityId}
                            onChange={(e) => setCityId(e.target.value)}
                            required
                            disabled={isSubmitting || cities.length === 0}
                        >
                            <option value="" disabled>-- Odaberi grad --</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>
                                    {city.name} ({city.postcode})
                                </option>
                            ))}
                        </select>
                    </div>
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
                        {isSubmitting ? 'Spremanje...' : 'Spremi promjene'}
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

export default EditProposalPage;