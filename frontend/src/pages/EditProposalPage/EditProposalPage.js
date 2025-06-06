import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProposalById, updateProposal } from '../../services/proposalService';
import { fetchCities } from '../../services/cityService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
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
            const [proposalData, citiesData] = await Promise.all([
                fetchProposalById(proposalId),
                fetchCities()
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

        } catch (err) {
            setError(err.message || 'Greška pri dohvaćanju podataka za uređivanje.');
            setOriginalProposal(null);
            setCities([]);
        } finally {
            setIsLoading(false);
        }
    }, [proposalId, isAuthenticated, navigate, user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
            setSubmitStatus({ success: true, message: 'Natječaj uspješno ažuriran!' });
            setTimeout(() => {
                navigate(`/proposals/${proposalId}`);
            }, 1500);
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