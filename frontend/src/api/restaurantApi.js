import axiosClient from './axiosClient';

export const restaurantApi = {
  getStatus: () => axiosClient.get('/restaurant/status'),
  getSettings: () => axiosClient.get('/restaurant/settings'),
};
