import { api } from './api';

function isAxiosError(error) {
  return typeof error === 'object' && error !== null && error.isAxiosError === true;
}

export const toggleVote = async (suggestionId) => {
   if (!suggestionId || isNaN(parseInt(suggestionId, 10))) {
      return Promise.reject(new Error("Valid Suggestion ID is required to toggle vote."));
  }
  try {
    const response = await api.post(`/votes/toggle/${suggestionId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to toggle vote for suggestion ${suggestionId}:`, error);
    let errorMessage = `Dogodila se greška prilikom glasanja za prijedlog ${suggestionId}.`;
    if (isAxiosError(error)) {
        if (error.response?.status === 401) { errorMessage = "Morate biti prijavljeni da biste glasali."; }
        else if (error.response?.status === 404) { errorMessage = "Prijedlog nije pronađen."; }
        else if (error.response?.data) { errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data); }
        else if (error.message) { errorMessage = error.message; }
    }
    throw new Error(errorMessage);
  }
};

export const fetchMyVotedSuggestionIds = async () => {
    try {
        const response = await api.get('/votes/myVotes');
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Failed to fetch user votes:', error);
        let errorMessage = 'Dogodila se greška prilikom dohvaćanja vaših glasova.';
         if (isAxiosError(error)) {
            if (error.response?.status === 401) { errorMessage = "Morate biti prijavljeni."; }
            else if (error.response) {errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`; }
            else if (error.request) { errorMessage = 'Could not connect to the server. Please try again later.'; }
         }
        return [];
    }
};