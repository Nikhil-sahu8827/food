import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { restaurantApi } from '../api/restaurantApi';

const RestaurantStatusContext = createContext(null);

export const RestaurantStatusProvider = ({ children }) => {
  const [status, setStatus] = useState({
    open: true,
    message: 'Loading restaurant hours...',
    openingTime: null,
    closingTime: null,
    nextOpeningTime: null,
    minimumOrderAmount: 150,
    whatsappNumber: '919876543210',
    restaurantName: 'Royal Spice Kitchen',
    restaurantAddress: '88 Gourmet Boulevard, Indiranagar, Bengaluru, Karnataka 560038',
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await restaurantApi.getStatus();
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch restaurant status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll every 45 seconds for automatic open/close updates
    const interval = setInterval(fetchStatus, 45000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <RestaurantStatusContext.Provider value={{ status, loading, refreshStatus: fetchStatus }}>
      {children}
    </RestaurantStatusContext.Provider>
  );
};

export const useRestaurantStatus = () => {
  const context = useContext(RestaurantStatusContext);
  if (!context) {
    throw new Error('useRestaurantStatus must be used within RestaurantStatusProvider');
  }
  return context;
};
