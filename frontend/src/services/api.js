import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User API calls
export const userApi = {
  // Authentication
  login: (credentials) => api.post('/user/login', credentials),
  register: (userData) => api.post('/user/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // User profile
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),

  // Admin user management
  getUsers: (params) => api.get('/user/admin/users', { params }),
  createUser: (userData) => api.post('/user/admin/users', userData),
  updateUser: (userId, data) => api.put(`/user/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/user/admin/users/${userId}`), // Soft delete (deactivate)
  deleteUserPermanent: (userId) => api.delete(`/user/admin/users/${userId}/permanent`), // Hard delete
  changeUserRole: (userId, role) => api.put(`/user/admin/users/${userId}/role`, { role }),
  activateUser: (userId) => api.put(`/user/admin/users/${userId}/activate`),
  rejectUser: (userId) => api.put(`/user/admin/users/${userId}/reject`),
  resetUserPassword: (userId, newPassword) => api.post(`/user/admin/users/${userId}/reset-password`, { newPassword }),

  // Roles and permissions
  getRoles: () => api.get('/user/admin/roles'),
  getUserStats: () => api.get('/user/admin/stats'),
  getAuditLogs: (params) => api.get('/user/admin/audit-logs', { params }),
  exportAuditLogs: () => api.get('/user/admin/audit-logs/export', { responseType: 'blob' }),
  clearAuditLogs: () => api.delete('/user/admin/audit-logs'),
};

// Notification API calls
export const notificationApi = {
  // User notifications
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAsUnread: (notificationId) => api.put(`/notifications/${notificationId}/unread`),
  archiveNotification: (notificationId) => api.put(`/notifications/${notificationId}/archive`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),

  // Notification preferences
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),

  // Admin notifications
  createNotification: (data) => api.post('/notifications/admin/create', data),
  getAllNotifications: (params) => api.get('/notifications/admin/all', { params }),
  getNotificationStats: () => api.get('/notifications/admin/stats'),
  cleanupExpired: () => api.delete('/notifications/admin/cleanup-expired'),
  bulkOperation: (data) => api.put('/notifications/admin/bulk-read', data),
};

// Projects API calls
export const projectsApi = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  assignUser: (projectId, userId) => api.put(`/projects/${projectId}/assign-user`, { userId }),
  removeUser: (projectId, userId) => api.put(`/projects/${projectId}/remove-user`, { userId }),
};

// Tasks API calls
export const tasksApi = {
  getTasks: (projectId) => api.get('/tasks', { params: { projectId } }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  assignTask: (taskId, userId) => api.put(`/tasks/${taskId}/assign`, { userId }),
  completeTask: (taskId) => api.put(`/tasks/${taskId}/complete`),
  updateStatus: (taskId, status) => api.put(`/tasks/${taskId}/status`, { status }),
};

// Materials API calls
export const materialsApi = {
  getMaterials: (projectId) => api.get('/materials', { params: { projectId } }),
  getMaterial: (id) => api.get(`/materials/${id}`),
  createMaterial: (data) => api.post('/materials', data),
  updateMaterial: (id, data) => api.put(`/materials/${id}`, data),
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
  updateStock: (id, stock) => api.put(`/materials/${id}/stock`, { stock }),
};

// Costs API calls
export const costsApi = {
  getCosts: (projectId) => api.get('/costs', { params: { projectId } }),
  getCost: (id) => api.get(`/costs/${id}`),
  createCost: (data) => api.post('/costs', data),
  updateCost: (id, data) => api.put(`/costs/${id}`, data),
  deleteCost: (id) => api.delete(`/costs/${id}`),
};

// Payments API calls
export const paymentsApi = {
  getPayments: (projectId) => api.get('/payments', { params: { projectId } }),
  getPayment: (id) => api.get(`/payments/${id}`),
  createPayment: (data) => api.post('/payments', data),
  updatePayment: (id, data) => api.put(`/payments/${id}`, data),
  deletePayment: (id) => api.delete(`/payments/${id}`),
  approvePayment: (id) => api.put(`/payments/${id}/approve`),
  rejectPayment: (id) => api.put(`/payments/${id}/reject`),
};

// Issues API calls
export const issuesApi = {
  getIssues: (projectId) => api.get('/issues', { params: { projectId } }),
  getIssue: (id) => api.get(`/issues/${id}`),
  createIssue: (data) => api.post('/issues', data),
  updateIssue: (id, data) => api.put(`/issues/${id}`, data),
  deleteIssue: (id) => api.delete(`/issues/${id}`),
  resolveIssue: (id) => api.put(`/issues/${id}/resolve`),
  assignIssue: (issueId, userId) => api.put(`/issues/${issueId}/assign`, { userId }),
};

// Workers API calls
export const workersApi = {
  getWorkers: (projectId) => api.get('/workers', { params: { projectId } }),
  getWorker: (id) => api.get(`/workers/${id}`),
  createWorker: (data) => api.post('/workers', data),
  updateWorker: (id, data) => api.put(`/workers/${id}`, data),
  deleteWorker: (id) => api.delete(`/workers/${id}`),
  assignWorker: (workerId, projectId) => api.put(`/workers/${workerId}/assign`, { projectId }),
};

// AI API calls
export const aiApi = {
  analyzeProject: (projectId) => api.get(`/ai/analyze-project/${projectId}`),
  predictCosts: (projectId) => api.get(`/ai/predict-costs/${projectId}`),
  suggestTasks: (projectId) => api.get(`/ai/suggest-tasks/${projectId}`),
  optimizeSchedule: (projectId) => api.get(`/ai/optimize-schedule/${projectId}`),
};

export default api;
