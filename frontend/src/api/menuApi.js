import axiosClient from './axiosClient';

export const menuApi = {
  getMenu: (params) => axiosClient.get('/menu', { params }),
  getCategories: () => axiosClient.get('/menu/categories'),
  getMenuItem: (id) => axiosClient.get(`/menu/${id}`),
};
