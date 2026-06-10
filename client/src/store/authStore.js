import { create } from 'zustand';

const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

// Holds the logged-in user, token, permissions and company features.
// Token is mirrored to localStorage so the axios interceptor can read it.
export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: loadUser(),

  setAuth: ({ token, user }) => {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    set((state) => ({ token: token ?? state.token, user: user ?? state.user }));
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
}));
