import { api } from '../services/api';

function isAxiosError(error) {
  return typeof error === 'object' && error !== null && error.isAxiosError === true;
}

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data; 
  } catch (error) {
    console.error('Login failed:', error);
    if (isAxiosError(error) && error.response?.data) {
        const message = typeof error.response.data === 'string' ? error.response.data : (error.response.data.message || error.response.data.title || 'Login failed.');
        throw new Error(message);
    }
    throw new Error('An unexpected error occurred during login.');
  }
};

export const registerUser = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      if (isAxiosError(error) && error.response?.data) {
         const message = typeof error.response.data === 'string'
                         ? error.response.data 
                         : (error.response.data.message || error.response.data.title || 'Registration failed.');
         throw new Error(message); 
      }
      throw new Error('An unexpected error occurred during registration.');
    }
  };

export const checkAuthStatus = async () => {
    try {
        console.log("Checking auth status (/me)...");
        const response = await api.get('/auth/me');
        const currentAccessToken = api.defaults.headers.common['Authorization']?.split(' ')[1];
         if (!currentAccessToken) {
             throw new Error("Access token missing after auth check.");
         }
        return { accessToken: currentAccessToken, user: response.data }; 
    } catch (error) {
        console.error("Auth status check failed:", error);
        throw error; 
    }
};

 export const logoutUser = async () => {
    try {
         await api.post('/auth/logout');
    } catch (error) {
         console.error("Backend logout API call failed:", error);
    }
};