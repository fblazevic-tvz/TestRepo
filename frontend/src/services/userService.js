import { api } from './api';

function isAxiosError(error) {
  return typeof error === 'object' && error !== null && error.isAxiosError === true;
}

export const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    let errorMessage = 'An unexpected error occurred while fetching users.';
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

export const fetchUserById = async (id) => {
  if (!id || isNaN(parseInt(id, 10))) {
     return Promise.reject(new Error("Invalid User ID provided."));
  }
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user with ID ${id}:`, error);
    let errorMessage = `An unexpected error occurred while fetching user ${id}.`;
     if (isAxiosError(error)) {
        if (error.response?.status === 404) {
             errorMessage = `User with ID ${id} not found.`;
        } else if (error.response) {
            errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'Could not connect to the server. Please try again later.';
        }
    }
    throw new Error(errorMessage);
  }
};