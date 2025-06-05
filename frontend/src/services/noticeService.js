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