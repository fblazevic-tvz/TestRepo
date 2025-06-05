import { api } from './api';

function isAxiosError(error) {
  return typeof error === 'object' && error !== null && error.isAxiosError === true;
}

export const fetchCities = async () => {
  try {
    const response = await api.get('/cities'); 
    return response.data; 
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    let errorMessage = 'An unexpected error occurred while fetching cities.';
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