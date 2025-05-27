// import axios from 'axios'; // Commented out axios
// import { jwtDecode } from 'jwt-decode'; // Commented out jwtDecode

// const API_URL = 'https://api.example.com/auth'; // Commented out API_URL

// interface DecodedToken {
//   exp: number; // Expiry time in seconds since epoch
// } // Commented out interface

// Commented out handleError function
// export const handleError = (error: unknown): string => {
//   if (axios.isAxiosError(error)) {
//     return error.response?.data?.message || 'An unexpected error occurred';
//   }
//   return 'An unexpected error occurred';
// };

// Dummy login function
export const login = async (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    // Simulate a delay
    setTimeout(() => {
      if (email === 'test@example.com' && password === 'password123') {
        // Simulate successful login with a dummy token and user data
        const dummyToken = 'dummy-jwt-token';
        const dummyUser = { name: 'Test User', role: 'admin' };
        // cacheCredentials(email, password); // Optional: cache dummy credentials
        resolve({ token: dummyToken, user: dummyUser });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500); // Simulate network delay
  });
};

// Dummy getProfile function
export const getProfile = async (token: string) => {
   return new Promise((resolve, reject) => {
    // Simulate a delay
    setTimeout(() => {
      // Accept the token set by LoginView.vue or the older dummy token
      if (token === 'dummy-test-token' || token === 'dummy-jwt-token') { 
        const dummyUser = { name: 'Test User', role: 'admin' };
        resolve(dummyUser);
      } else {
        reject(new Error('Invalid token for getProfile'));
      }
    }, 500); // Simulate network delay
  });
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
