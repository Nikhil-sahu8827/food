import React from 'react';
import { FiClock, FiCheckCircle, FiPackage, FiTruck, FiXCircle, FiSlash } from 'react-icons/fi';

export const OrderStatusBadge = ({ status }) => {
  const configs = {
    PENDING: {
      label: 'Pending Confirmation',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: <FiClock className="animate-spin text-amber-700" style={{ animationDuration: '3s' }} />,
    },
    ACCEPTED: {
      label: 'Accepted by Kitchen',
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      icon: <FiCheckCircle className="text-blue-700" />,
    },
    PREPARING: {
      label: 'Preparing in Kitchen',
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      border: 'border-indigo-300',
      icon: <FiPackage className="text-indigo-700 animate-pulse" />,
    },
    READY: {
      label: 'Ready for Delivery',
      bg: 'bg-teal-100',
      text: 'text-teal-800',
      border: 'border-teal-300',
      icon: <FiTruck className="text-teal-700" />,
    },
    COMPLETED: {
      label: 'Delivered & Completed',
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      icon: <FiCheckCircle className="text-emerald-700" />,
    },
    REJECTED: {
      label: 'Order Rejected',
      bg: 'bg-rose-100',
      text: 'text-rose-800',
      border: 'border-rose-300',
      icon: <FiXCircle className="text-rose-700" />,
    },
    CANCELLED: {
      label: 'Order Cancelled',
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      icon: <FiSlash className="text-gray-600" />,
    },
  };

  const config = configs[status] || configs.PENDING;

  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};
