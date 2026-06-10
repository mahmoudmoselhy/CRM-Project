import api from './axios';

export const getOverview = () => api.get('/reports/overview').then((r) => r.data);
export const getLeadsByStatus = () => api.get('/reports/leads-by-status').then((r) => r.data);
export const getAgentPerformance = () => api.get('/reports/agents').then((r) => r.data);
export const getSourcePerformance = () => api.get('/reports/sources').then((r) => r.data);
