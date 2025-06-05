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