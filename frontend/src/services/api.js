import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getUsers: (params) => api.get('/auth/users', { params }),
};

export const equipmentAPI = {
  getEquipment: (params) => api.get('/equipment', { params }),
  getEquipmentById: (id) => api.get(`/equipment/${id}`),
  createEquipment: (data) => api.post('/equipment', data),
  updateEquipment: (id, data) => api.put(`/equipment/${id}`, data),
  deleteEquipment: (id) => api.delete(`/equipment/${id}`),
  getEquipmentMaintenance: (id, params) => api.get(`/equipment/${id}/maintenance`, { params }),
};

export const maintenanceTeamAPI = {
  getTeams: (params) => api.get('/maintenance-teams', { params }),
  getTeamById: (id) => api.get(`/maintenance-teams/${id}`),
  createTeam: (data) => api.post('/maintenance-teams', data),
  updateTeam: (id, data) => api.put(`/maintenance-teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/maintenance-teams/${id}`),
  addTeamMember: (id, data) => api.post(`/maintenance-teams/${id}/members`, data),
  removeTeamMember: (id, userId) => api.delete(`/maintenance-teams/${id}/members/${userId}`),
  getTeamRequests: (id, params) => api.get(`/maintenance-teams/${id}/requests`, { params }),
};

export const maintenanceRequestAPI = {
  getRequests: (params) => api.get('/maintenance-requests', { params }),
  getRequestById: (id) => api.get(`/maintenance-requests/${id}`),
  createRequest: (data) => api.post('/maintenance-requests', data),
  updateRequest: (id, data) => api.put(`/maintenance-requests/${id}`, data),
  deleteRequest: (id) => api.delete(`/maintenance-requests/${id}`),
  updateRequestStage: (id, data) => api.patch(`/maintenance-requests/${id}/stage`, data),
  addRequestNote: (id, data) => api.post(`/maintenance-requests/${id}/notes`, data),
  getKanbanData: (params) => api.get('/maintenance-requests/kanban', { params }),
  getCalendarData: (params) => api.get('/maintenance-requests/calendar', { params }),
  getDashboardStats: () => api.get('/maintenance-requests/stats/dashboard'),
};

export default api;