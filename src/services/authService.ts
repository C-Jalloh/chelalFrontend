import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

export const login = async (email: string, password: string) => {
  try {
    // If your backend uses username, change this to username; if it uses email, keep as email
    const response = await axios.post(API_URL, {
      username: email, // Change to 'email' if your backend expects 'email'
      password,
    });
    const { access, refresh } = response.data;
    return { token: access, refresh, user: null };
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

// Helper to always use the correct access token for authenticated requests
export const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const getProfile = async (token: string) => {
  try {
    const response = await axios.get('http://localhost:8000/api/users/me/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch profile');
  }
};

// Update isTokenExpired to decode JWT and check expiration
export const isTokenExpired = (token?: string): boolean => {
  if (!token || token.split('.').length !== 3) {
    return true;
  }
  try {
    // Pad base64url if needed
    let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jwtPayload = JSON.parse(atob(base64));
    const expirationTime = jwtPayload.exp * 1000; // Convert to milliseconds
    return Date.now() > expirationTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If token is malformed, consider it expired
  }
};

// Update refreshAccessToken to call the backend refresh endpoint
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(API_URL + 'refresh/', {
      refresh: refreshToken,
    });
    // The backend returns a new access token
    const { access } = response.data;
    return { token: access };
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to refresh token');
  }
};

// Dummy cacheCredentials and getCachedCredentials functions
// export const cacheCredentials = (email: string, password: string) => {
//   localStorage.setItem('cachedEmail', email);
//   localStorage.setItem('cachedPassword', password);
// };

// export const getCachedCredentials = (): { email: string; password: string } | null => {
//   const email = localStorage.getItem('cachedEmail');
//   const password = localStorage.getItem('cachedPassword');
//   if (email && password) {
//     return { email, password };
//   }
//   return null;
// };
