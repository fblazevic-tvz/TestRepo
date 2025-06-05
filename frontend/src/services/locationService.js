import { api } from './api';

function isAxiosError(error) { 
  return typeof error === 'object' && error !== null && error.isAxiosError === true;
}

export const fetchLocations = async () => {
  try {
    const response = await api.get('/locations');
    return response.data; 
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    let errorMessage = 'Dogodila se neočekivana greška prilikom dohvaćanja lokacija.';
     if (isAxiosError(error)) {
        if (error.response) {
             errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'Nije moguće uspostaviti vezu sa serverom.';
        }
    }
    throw new Error(errorMessage);
  }
};
