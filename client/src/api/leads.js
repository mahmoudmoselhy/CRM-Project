import api from './axios';

export const listLeads = (params) => api.get('/leads', { params }).then((r) => r.data);
export const getLead = (id) => api.get(`/leads/${id}`).then((r) => r.data);
export const createLead = (data) => api.post('/leads', data).then((r) => r.data);
export const updateLead = (id, data) => api.patch(`/leads/${id}`, data).then((r) => r.data);
export const deleteLead = (id) => api.delete(`/leads/${id}`).then((r) => r.data);
export const assignLead = (id, assignedTo) =>
  api.patch(`/leads/${id}/assign`, { assignedTo }).then((r) => r.data);
export const changeLeadStatus = (id, status) =>
  api.patch(`/leads/${id}/status`, { status }).then((r) => r.data);

export const listAssignableUsers = () => api.get('/users/assignable').then((r) => r.data);
