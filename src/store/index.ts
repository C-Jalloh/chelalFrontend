import { createStore } from 'vuex';
import { getProfile } from '../services/authService';

interface State {
  token: string | null;
  user: Record<string, any> | null;
}

const store = createStore({
  state: {
    token: localStorage.getItem('token'),
    user: null,
  },
  mutations: {
    setToken(state: State, token: string) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    setUser(state: State, user: Record<string, any>) {
      state.user = user;
    },
    logout(state: State) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
  actions: {
    async fetchUser({ commit }: { commit: (mutation: string, payload?: any) => void }, token: string) {
      try {
        const user = await getProfile(token);
        commit('setUser', user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
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
    isAuthenticated: (state: State) => !!state.token,
    getUser: (state: State) => state.user,
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