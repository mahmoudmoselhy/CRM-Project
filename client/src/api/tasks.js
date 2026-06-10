import api from './axios';

export const listTasks = (params) => api.get('/tasks', { params }).then((r) => r.data);
export const createTask = (data) => api.post('/tasks', data).then((r) => r.data);
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data).then((r) => r.data);
export const changeTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status }).then((r) => r.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then((r) => r.data);

// A task is overdue when its due date passed and it is not completed yet.
export const isOverdue = (task) =>
  task.status !== 'COMPLETED' && new Date(task.dueDate) < new Date();
