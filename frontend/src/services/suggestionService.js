import { api } from './api'; 

function isAxiosError(error) {
  return typeof error === 'object' && error !== null && error.isAxiosError === true;
}

export const fetchSuggestions = async () => {
  try {
    const response = await api.get('/suggestions');
    return response.data; 
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    let errorMessage = 'An unexpected error occurred while fetching suggestions.';
    if (isAxiosError(error)) {
        if (error.response) {
            errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'Could not connect to the server. Please try again later.';
        }
    }
    throw new Error(errorMessage);
  }
};


export const fetchSuggestionById = async (id) => {
  if (!id || isNaN(parseInt(id, 10))) {
     return Promise.reject(new Error("Invalid Suggestion ID provided."));
  }
  try {
    const response = await api.get(`/suggestions/${id}`);
    return response.data; 
  } catch (error) {
    console.error(`Failed to fetch suggestion with ID ${id}:`, error);
    let errorMessage = `An unexpected error occurred while fetching suggestion ${id}.`;
     if (isAxiosError(error)) {
        if (error.response?.status === 404) {
             errorMessage = `Suggestion with ID ${id} not found.`;
        } else if (error.response) {
            errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'Could not connect to the server. Please try again later.';
        }
    }
    throw new Error(errorMessage);
  }
};

export const fetchSuggestionsByProposalId = async (proposalId) => {
  if (!proposalId || isNaN(parseInt(proposalId, 10))) {
     return Promise.reject(new Error("Invalid Proposal ID provided."));
  }
  try {
    const response = await api.get(`/suggestions/byProposal/${proposalId}`);
    return response.data; 
  } catch (error) {
    console.error(`Failed to fetch suggestions for proposal ID ${proposalId}:`, error);
    let errorMessage = `An unexpected error occurred while fetching suggestions for proposal ${proposalId}.`;
     if (isAxiosError(error)) {
         if (error.response) {
            errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'Could not connect to the server. Please try again later.';
        }
     }
    throw new Error(errorMessage);
  }
};

export const fetchMySuggestions = async () => {
  try {
    const response = await api.get('/suggestions/mySuggestions');
    return response.data; 
  } catch (error) {
    console.error('Failed to fetch my suggestions:', error);
    let errorMessage = 'Dogodila se greška prilikom dohvaćanja vaših prijedloga.';
    if (isAxiosError(error)) {
        if (error.response?.status === 401) {
             errorMessage = "Niste prijavljeni ili vaša sesija nije važeća.";
        } else if (error.response) {
             errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'Nije moguće uspostaviti vezu sa serverom.';
        }
    }
    throw new Error(errorMessage);
  }
};

export const createSuggestion = async (suggestionData) => {
  if (!suggestionData || !suggestionData.name || !suggestionData.description ||
      !suggestionData.estimatedCost || !suggestionData.proposalId || !suggestionData.locationId) {
      return Promise.reject(new Error("Sva polja su obavezna za kreiranje prijedloga.")); 
  }
  try {
    const response = await api.post('/suggestions', suggestionData);
    return response.data; 
  } catch (error) {
    console.error('Failed to create suggestion:', error);
    let errorMessage = 'Dogodila se neočekivana greška prilikom kreiranja prijedloga.'; 
    if (isAxiosError(error) && error.response?.data) {
        errorMessage = error.response.data.message
                    || error.response.data.title
                    || (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
        if (error.response.data.errors) {
            const validationErrors = Object.values(error.response.data.errors).flat().join(' ');
            errorMessage += ` Detalji: ${validationErrors}`;
        }
    } else if (error.message) {
        errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

export const updateSuggestion = async (suggestionId, suggestionData) => {
  if (!suggestionId) {
      return Promise.reject(new Error("Suggestion ID is required for update."));
  }
  if (!suggestionData || Object.keys(suggestionData).length === 0) {
       return Promise.reject(new Error("No update data provided."));
  }

  try {
    await api.put(`/suggestions/${suggestionId}`, suggestionData);
  } catch (error) {
    console.error(`Failed to update suggestion ${suggestionId}:`, error);
    let errorMessage = `Dogodila se greška prilikom ažuriranja prijedloga ${suggestionId}.`;
    if (isAxiosError(error)) {
        if (error.response?.status === 403) { errorMessage = "Niste ovlašteni ažurirati ovaj prijedlog."; }
        else if (error.response?.status === 404) { errorMessage = "Prijedlog nije pronađen."; }
        else if (error.response?.data) { errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data); }
        else if (error.message) { errorMessage = error.message; }
    }
    throw new Error(errorMessage);
  }
};



export const deleteSuggestion = async (suggestionId) => {
   if (!suggestionId || isNaN(parseInt(suggestionId, 10))) {
      return Promise.reject(new Error("Valid Suggestion ID is required for deletion."));
  }
  try {
    await api.delete(`/suggestions/${suggestionId}`);
  } catch (error) {
    console.error(`Failed to delete suggestion ${suggestionId}:`, error);
    let errorMessage = `Dogodila se greška prilikom brisanja prijedloga ${suggestionId}.`;
    if (isAxiosError(error)) {
        if (error.response?.status === 403) { errorMessage = "Niste ovlašteni obrisati ovaj prijedlog."; }
        else if (error.response?.status === 404) { errorMessage = "Prijedlog nije pronađen."; }
        else if (error.response?.data) { errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data); }
        else if (error.message) { errorMessage = error.message; }
    }
    throw new Error(errorMessage);
  }
};