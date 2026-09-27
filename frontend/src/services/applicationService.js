import api from './api';

export const applicationService = {
  create: (data) => api.post('/applications', data),
  
  getApplications: () => api.get('/applications'),
  
  getApplicationById: (id) => api.get(`/applications/${id}`),

  getNotifications: () => api.get('/applications/notifications'),

  uploadDocument: (id, formData) => api.post(`/applications/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  submit: (id) => api.post(`/applications/${id}/submit`),
};
