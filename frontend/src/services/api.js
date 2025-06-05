import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn("REACT_APP_API_BASE_URL environment variable not set. Falling back to default, but this might be incorrect.");
}

const api = axios.create({
  baseURL: API_BASE_URL || 'https://localhost:7003/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {

        console.log('401 detected, not a retry, not refresh endpoint. URL:', originalRequest.url);

      if (isRefreshing) {
         console.log('Already refreshing, queuing request:', originalRequest.url);
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
           console.log('Processing queued request with new token:', originalRequest.url);
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest); 
        }).catch(err => {
            console.error('Queued request failed after retry:', originalRequest.url, err);
            return Promise.reject(err)
        });
      }

      console.log('Setting retry flag and starting refresh for:', originalRequest.url);
      originalRequest._retry = true; 
      isRefreshing = true;

      try {
        console.log("Attempting token refresh via interceptor POST /auth/refresh-token...");
        const response = await api.post('/auth/refresh-token'); 

        const { accessToken: newAccessToken } = response.data;
        console.log("Token refresh API call successful.");

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        console.log("Global Axios header updated with new token.");

        try {
             console.log("Fetching user data (/me) after refresh...");
             const userResponse = await api.get('/auth/me', {
                 headers: { 'Authorization': `Bearer ${newAccessToken}` }
             });
             console.log("User data fetched successfully after refresh.");
             window.dispatchEvent(new CustomEvent('token-refreshed', {
                 detail: { accessToken: newAccessToken, user: userResponse.data }
             }));
             console.log("Dispatched token-refreshed event.");

        } catch (meError) {
             console.error("Failed to fetch user data (/me) *after* successful refresh:", meError);
             processQueue(meError, null); 
             isRefreshing = false; 
             throw meError;
        }

        console.log("Processing queue after successful refresh...");
        processQueue(null, newAccessToken);

        console.log("Retrying original request:", originalRequest.url);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest); 

      } catch (refreshError) {
        console.error("Token refresh failed in interceptor:", refreshError.response?.data || refreshError.message);
        processQueue(refreshError, null); 
        
        try {
            console.log("Attempting backend logout after failed refresh...");
            await api.post('/auth/logout');
        } catch (logoutErr) {
            console.error("Backend logout call after failed refresh also failed:", logoutErr);
        }

        delete api.defaults.headers.common['Authorization'];
        return Promise.reject(refreshError);
      } finally {
        console.log("Resetting isRefreshing flag.");
        isRefreshing = false;
      }
    } else if (error.response?.status === 401 && originalRequest?.url === '/auth/refresh-token') {
        console.error("The /auth/refresh-token endpoint returned 401. Refresh token likely invalid or expired.");
         try { await api.post('/auth/logout'); } catch (_) {}
         delete api.defaults.headers.common['Authorization'];
    }
    
    console.log("Interceptor rejecting error (not a 401 needing refresh, or already retried):", error.message);
    return Promise.reject(error);
  }
);

export { api }; 