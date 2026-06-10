import api from './axios';

export const registerCompany = (data) =>
  api.post('/auth/register', data).then((r) => r.data);

export const login = (data) => api.post('/auth/login', data).then((r) => r.data);

export const getMe = () => api.get('/auth/me').then((r) => r.data);
