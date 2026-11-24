import React from 'react';
import { useRestaurantStatus } from '../context/RestaurantStatusContext';
import { FiClock, FiAlertCircle } from 'react-icons/fi';

export const OpenStatusBanner = () => {
  const { status, loading } = useRestaurantStatus();

  if (loading || status?.open) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2">
        <div className="flex items-center space-x-2">
          <FiAlertCircle className="text-xl shrink-0 text-amber-200" />
          <span className="text-sm font-bold tracking-wide">
            {status?.message || 'Restaurant is currently closed.'}
          </span>
        </div>
        {status?.nextOpeningTime && (
          <div className="inline-flex items-center space-x-1.5 text-xs bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
            <FiClock className="text-amber-200" />
            <span>Next Opening: <strong className="text-amber-200 font-bold">{status.nextOpeningTime}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
