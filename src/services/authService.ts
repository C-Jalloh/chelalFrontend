import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(API_URL + 'token/', {
      email,
      password,
    });
    // The backend returns access and refresh tokens
    const { access, refresh } = response.data;
    // Optionally fetch user profile here if needed
    return { token: access, refresh, user: null };
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

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

// Dummy isTokenExpired function
export const isTokenExpired = (_token?: string): boolean => {
  // For dummy token, always return false (not expired)
  return false;
};

// Dummy refreshAccessToken function
export const refreshAccessToken = async (refreshToken: string) => {
   return new Promise((resolve, reject) => {
    // Simulate a delay
    setTimeout(() => {
       if (refreshToken === 'dummy-refresh-token') { // Assuming a dummy refresh token
         const newDummyToken = 'new-dummy-jwt-token';
         resolve({ token: newDummyToken });
       } else {
         reject(new Error('Invalid refresh token'));
       }
    }, 500); // Simulate network delay
  });
};

// Existing cacheCredentials and getCachedCredentials functions remain
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
