import { createStore } from 'vuex';
import { getProfile, isTokenExpired, refreshAccessToken, login as loginService } from '../services/authService';

interface State {
  token: string | null;
  refreshToken: string | null;
  user: Record<string, any> | null;
}

const store = createStore({
  state: (): State => ({
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: null,
  }),
  mutations: {
    setToken(state: State, token: string) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    setRefreshToken(state: State, refreshToken: string) {
      state.refreshToken = refreshToken;
      localStorage.setItem('refreshToken', refreshToken);
    },
    setUser(state: State, user: Record<string, any>) {
      state.user = user;
    },
    logout(state: State) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
  },
  actions: {
    async fetchUser({ commit, state }: { commit: (mutation: string, payload?: any) => void; state: State }) {
      if (state.token) {
        try {
          const user = await getProfile(state.token);
          commit('setUser', user);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    },
    async loginAndFetchUser(context: any, { email, password }: { email: string, password: string }) {
      // Call login, then fetch user profile
      const { token, refresh } = await loginService(email, password);
      context.commit('setToken', token);
      context.commit('setRefreshToken', refresh);
      const user = await getProfile(token);
      context.commit('setUser', user);
    },
    async attemptRefreshAndRetry<T>(
      { commit, state }: { commit: (mutation: string, payload?: any) => void; state: State },
      requestFn: () => Promise<T>
    ): Promise<T | null> {
      if (!state.refreshToken) {
        commit('logout');
        throw new Error('No refresh token available.');
      }
      try {
        console.log('Attempting to refresh token...');
        const { token: newToken } = await refreshAccessToken(state.refreshToken);
        commit('setToken', newToken);
        // Fetch and commit user profile after token refresh
        try {
          const user = await getProfile(newToken);
          commit('setUser', user);
        } catch (profileError) {
          console.error('Failed to fetch user profile after token refresh:', profileError);
          commit('logout');
          throw new Error('Session expired. Please log in again.');
        }
        console.log('Token refreshed and user profile updated successfully.');
        return await requestFn();
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        commit('logout');
        throw new Error('Session expired. Please log in again.');
      }
    },
    initializeSessionTimeout({ commit }: { commit: (mutation: string) => void }) {
      const duration = 30 * 60 * 1000; // 30 minutes
      startSessionTimeout(commit, duration);
      window.addEventListener('mousemove', () => resetSessionTimeout(commit, duration));
      window.addEventListener('keydown', () => resetSessionTimeout(commit, duration));
    },
  },
  getters: {
    isAuthenticated: (state: State) => !!state.token && !isTokenExpired(state.token),
    getUser: (state: State) => state.user,
    getToken: (state: State) => state.token,
    getRefreshToken: (state: State) => state.refreshToken,
    getUserRole: (state: State) => state.user?.role?.name || null,
  },
});

let timeoutId: number | null = null;

const startSessionTimeout = (commit: (mutation: string) => void, duration: number) => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    commit('logout');
    alert('Session expired. Please log in again.');
  }, duration);
};

const resetSessionTimeout = (commit: (mutation: string) => void, duration: number) => {
  if (timeoutId) clearTimeout(timeoutId);
  startSessionTimeout(commit, duration);
};

export default store;