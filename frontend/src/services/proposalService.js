import { api } from './api';


function isAxiosError(error) {
  return typeof error === 'object' && error !== null && error.isAxiosError === true;
}


export const fetchProposals = async () => {
  try {
    const response = await api.get('/proposals');
    return response.data; 
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    let errorMessage = 'An unexpected error occurred while fetching proposals.';
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

export const fetchProposalById = async (id) => {
  if (!id || isNaN(parseInt(id, 10))) {
     return Promise.reject(new Error("Invalid Proposal ID provided."));
  }
  try {
    const response = await api.get(`/proposals/${id}`);
    return response.data; 
  } catch (error) {
    console.error(`Failed to fetch proposal with ID ${id}:`, error);
    let errorMessage = `An unexpected error occurred while fetching proposal ${id}.`;
     if (isAxiosError(error)) {
        if (error.response?.status === 404) {
             errorMessage = `Proposal with ID ${id} not found.`;
        } else if (error.response) {
            errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'Could not connect to the server. Please try again later.';
        }
    }
    throw new Error(errorMessage);
  }
};

export const fetchMyProposals = async (moderatorId) => {
  if (!moderatorId || isNaN(parseInt(moderatorId, 10))) {
    return Promise.reject(new Error("Invalid Moderator ID provided."));
  }
  try {
    const response = await api.get(`/proposals/moderator/${moderatorId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch moderator proposals:', error);
    let errorMessage = 'Dogodila se greška prilikom dohvaćanja vaših natječaja.';
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        errorMessage = "Niste prijavljeni ili vaša sesija nije važeća.";
      } else if (error.response?.status === 404) {
        errorMessage = "Nema natječaja za ovog moderatora.";
      } else if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Nije moguće uspostaviti vezu sa serverom.';
      }
    }
    throw new Error(errorMessage);
  }
};

export const createProposal = async (proposalData) => {
  if (!proposalData || !proposalData.name || !proposalData.description ||
      !proposalData.maxBudget || !proposalData.submissionStart || !proposalData.submissionEnd ||
      !proposalData.status || !proposalData.cityId || !proposalData.moderatorId) {
    return Promise.reject(new Error("Sva polja su obavezna za kreiranje natječaja."));
  }
  try {
    const response = await api.post('/proposals', proposalData);
    return response.data;
  } catch (error) {
    console.error('Failed to create proposal:', error);
    let errorMessage = 'Dogodila se neočekivana greška prilikom kreiranja natječaja.';
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

export const updateProposal = async (proposalId, proposalData) => {
  if (!proposalId) {
    return Promise.reject(new Error("Proposal ID is required for update."));
  }
  if (!proposalData || Object.keys(proposalData).length === 0) {
    return Promise.reject(new Error("No update data provided."));
  }

  try {
    await api.put(`/proposals/${proposalId}`, proposalData);
  } catch (error) {
    console.error(`Failed to update proposal ${proposalId}:`, error);
    let errorMessage = `Dogodila se greška prilikom ažuriranja natječaja ${proposalId}.`;
    if (isAxiosError(error)) {
      if (error.response?.status === 403) { 
        errorMessage = "Niste ovlašteni ažurirati ovaj natječaj."; 
      } else if (error.response?.status === 404) { 
        errorMessage = "Natječaj nije pronađen."; 
      } else if (error.response?.data) { 
        errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data); 
      } else if (error.message) { 
        errorMessage = error.message; 
      }
    }
    throw new Error(errorMessage);
  }
};

export const deleteProposal = async (proposalId) => {
  if (!proposalId || isNaN(parseInt(proposalId, 10))) {
    return Promise.reject(new Error("Valid Proposal ID is required for deletion."));
  }
  try {
    await api.delete(`/proposals/${proposalId}`);
  } catch (error) {
    console.error(`Failed to delete proposal ${proposalId}:`, error);
    let errorMessage = `Dogodila se greška prilikom brisanja natječaja ${proposalId}.`;
    if (isAxiosError(error)) {
      if (error.response?.status === 403) { 
        errorMessage = "Niste ovlašteni obrisati ovaj natječaj."; 
      } else if (error.response?.status === 404) { 
        errorMessage = "Natječaj nije pronađen."; 
      } else if (error.response?.data) { 
        errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data); 
      } else if (error.message) { 
        errorMessage = error.message; 
      }
    }
    throw new Error(errorMessage);
  }
};