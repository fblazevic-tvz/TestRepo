import { api } from './api'; 

function isAxiosError(error) {
  return typeof error === 'object' && error !== null && error.isAxiosError === true;
}

export const fetchNotices = async () => {
  try {
    const response = await api.get('/notices'); 
    return response.data; 
  } catch (error) {
    console.error('Failed to fetch notices:', error);
    let errorMessage = 'An unexpected error occurred while fetching notices.';
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


export const fetchNoticeById = async (id) => {
  if (!id || isNaN(parseInt(id, 10))) {
     return Promise.reject(new Error("Invalid Notice ID provided."));
  }
  try {
    const response = await api.get(`/notices/${id}`);
    return response.data; 
  } catch (error) {
    console.error(`Failed to fetch notice with ID ${id}:`, error);
    let errorMessage = `An unexpected error occurred while fetching notice ${id}.`;
     if (isAxiosError(error)) {
        if (error.response?.status === 404) {
             errorMessage = `Notice with ID ${id} not found.`;
        } else if (error.response) {
            errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'Could not connect to the server. Please try again later.';
        }
    }
    throw new Error(errorMessage);
  }
};

export const fetchNoticesByProposalId = async (proposalId) => {
  if (!proposalId || isNaN(parseInt(proposalId, 10))) {
     return Promise.reject(new Error("Invalid Proposal ID provided."));
  }
  try {
    const response = await api.get(`/notices/byProposal/${proposalId}`);
    return response.data; 
  } catch (error) {
    console.error(`Failed to fetch notices for proposal ID ${proposalId}:`, error);
    let errorMessage = `An unexpected error occurred while fetching notices for proposal ${proposalId}.`;
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

export const createNotice = async (noticeData) => {
  if (!noticeData || !noticeData.title || !noticeData.content || 
      !noticeData.proposalId || !noticeData.moderatorId) {
      return Promise.reject(new Error("Sva polja su obavezna za kreiranje obavijesti."));
  }
  try {
    const response = await api.post('/notices', noticeData);
    return response.data;
  } catch (error) {
    console.error('Failed to create notice:', error);
    let errorMessage = 'Dogodila se neočekivana greška prilikom kreiranja obavijesti.';
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

export const updateNotice = async (noticeId, noticeData) => {
  if (!noticeId) {
      return Promise.reject(new Error("Notice ID is required for update."));
  }
  if (!noticeData || Object.keys(noticeData).length === 0) {
       return Promise.reject(new Error("No update data provided."));
  }

  try {
    await api.put(`/notices/${noticeId}`, noticeData);
  } catch (error) {
    console.error(`Failed to update notice ${noticeId}:`, error);
    let errorMessage = `Dogodila se greška prilikom ažuriranja obavijesti ${noticeId}.`;
    if (isAxiosError(error)) {
        if (error.response?.status === 403) { errorMessage = "Niste ovlašteni ažurirati ovu obavijest."; }
        else if (error.response?.status === 404) { errorMessage = "Obavijest nije pronađena."; }
        else if (error.response?.data) { errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data); }
        else if (error.message) { errorMessage = error.message; }
    }
    throw new Error(errorMessage);
  }
};

export const deleteNotice = async (noticeId) => {
   if (!noticeId || isNaN(parseInt(noticeId, 10))) {
      return Promise.reject(new Error("Valid Notice ID is required for deletion."));
  }
  try {
    await api.delete(`/notices/${noticeId}`);
  } catch (error) {
    console.error(`Failed to delete notice ${noticeId}:`, error);
    let errorMessage = `Dogodila se greška prilikom brisanja obavijesti ${noticeId}.`;
    if (isAxiosError(error)) {
        if (error.response?.status === 403) { errorMessage = "Niste ovlašteni obrisati ovu obavijest."; }
        else if (error.response?.status === 404) { errorMessage = "Obavijest nije pronađena."; }
        else if (error.response?.data) { errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data); }
        else if (error.message) { errorMessage = error.message; }
    }
    throw new Error(errorMessage);
  }
};