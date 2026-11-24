import axiosClient from './axiosClient';

export const orderApi = {
  placeOrder: (orderData) => axiosClient.post('/orders', orderData),
  getMyOrders: () => axiosClient.get('/orders/my-orders'),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
  shareLocation: (id, locationData) => axiosClient.post(`/orders/${id}/share-location`, locationData),
};
