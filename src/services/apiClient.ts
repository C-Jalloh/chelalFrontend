import store from '@/store';
import axios, { type AxiosError } from 'axios';

/**
 * Wraps an API call with automatic token refresh logic.
 * If the initial API call fails with a 401 error, it attempts to refresh the access token
 * and then retries the original API call.
 *
 * @param apiCall A function that returns a Promise representing the API call.
 * @returns A Promise that resolves with the API call's response.
 * @throws Throws an error if the API call fails and token refresh is not possible or also fails.
 */
export const callApiWithAuthRetry = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    const axiosError = error as AxiosError;

    // Check if it's an Axios error and a 401 Unauthorized error
    if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
      console.log('API call failed with 401, attempting token refresh...');
      try {
        // The attemptRefreshAndRetry action from the store will try to refresh
        // the token and then re-execute the apiCall.
        // It's important that attemptRefreshAndRetry is designed to call the passed function.
        return await store.dispatch('attemptRefreshAndRetry', apiCall);
      } catch (refreshOrRetryError) {
        // If refresh or the subsequent retry fails, propagate that error.
        // The attemptRefreshAndRetry action should handle logging out if refresh fails.
        console.error('Token refresh or API retry failed:', refreshOrRetryError);
        throw refreshOrRetryError;
      }
    } else {
      // If it's not a 401 error, or not an Axios error, just rethrow it.
      throw error;
    }
  }
};

// You might also want to export a pre-configured Axios instance
// that uses this interceptor logic if you prefer interceptors.
// For now, this wrapper function approach is more explicit per call.

export default axios; // You can still export the base axios if needed elsewhere
