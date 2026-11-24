import axiosClient from './axiosClient';

export const adminApi = {
  // Orders
  getOrders: (params) => axiosClient.get('/admin/orders', { params }),
  getOrderById: (id) => axiosClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => axiosClient.patch(`/admin/orders/${id}/status`, data),

  // Dashboard & Monitoring
  getDashboardStats: () => axiosClient.get('/admin/dashboard/statistics'),
  getDatabaseUsage: () => axiosClient.get('/admin/monitoring/database-usage'),
  triggerRetentionCleanup: () => axiosClient.post('/admin/monitoring/retention-cleanup'),

  // Menu Management
  getMenuItems: (params) => axiosClient.get('/admin/menu/items', { params }),
  createMenuItem: (data) => axiosClient.post('/admin/menu', data),
  updateMenuItem: (id, data) => axiosClient.put(`/admin/menu/${id}`, data),
  deleteMenuItem: (id) => axiosClient.delete(`/admin/menu/${id}`),
  toggleAvailability: (id, available) =>
    axiosClient.patch(`/admin/menu/${id}/availability`, null, { params: { available } }),
  uploadImage: (formData) =>
    axiosClient.post('/admin/menu/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Categories
  getAllCategories: () => axiosClient.get('/admin/menu/categories'),
  createCategory: (data) => axiosClient.post('/admin/menu/categories', data),
  updateCategory: (id, data) => axiosClient.put(`/admin/menu/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/admin/menu/categories/${id}`),

  // Restaurant Settings & Schedule
  updateSettings: (data) => axiosClient.put('/admin/restaurant/settings', data),
  getSchedule: () => axiosClient.get('/admin/restaurant/schedule'),
  updateSchedule: (data) => axiosClient.put('/admin/restaurant/schedule', data),
  getHolidays: () => axiosClient.get('/admin/restaurant/holidays'),
  addHoliday: (data) => axiosClient.post('/admin/restaurant/holidays', data),
  deleteHoliday: (id) => axiosClient.delete(`/admin/restaurant/holidays/${id}`),
};
