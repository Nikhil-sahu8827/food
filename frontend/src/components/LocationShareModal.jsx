import React, { useState } from 'react';
import { orderApi } from '../api/orderApi';
import { useRestaurantStatus } from '../context/RestaurantStatusContext';
import { FiMapPin, FiX, FiCheck, FiAlertCircle, FiCopy, FiExternalLink } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const LocationShareModal = ({ order, isOpen, onClose, onLocationShared }) => {
  const { status: restaurantStatus } = useRestaurantStatus();
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [coordinates, setCoordinates] = useState(
    order.latitude && order.longitude ? { lat: order.latitude, lng: order.longitude } : null
  );

  if (!isOpen) return null;

  const whatsappNumber = restaurantStatus?.whatsappNumber || '919876543210';

  const constructWhatsAppMessage = (lat, lng) => {
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    return `Hello Restaurant,

My order has been accepted.

Order ID: ${order.orderNumber}

Customer Name: ${order.customerName}

My Delivery Location:
${mapsUrl}

Please deliver my order to this location.`;
  };

  const constructManualWhatsAppMessage = () => {
    return `Hello Restaurant,

My order has been accepted.

Order ID: ${order.orderNumber}

Customer Name: ${order.customerName}

My Delivery Address:
${order.deliveryAddress}

Please deliver my order to this address.`;
  };

  const handleGetLocationAndOpenWhatsApp = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please use manual address delivery.');
      return;
    }

    setLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoordinates({ lat, lng });

        try {
          // 1. Save location to backend
          await orderApi.shareLocation(order.id, { latitude: lat, longitude: lng });
          toast.success('Delivery location linked to your order!');
          if (onLocationShared) onLocationShared(lat, lng);

          // 2. Open WhatsApp with prefilled message
          const msg = constructWhatsAppMessage(lat, lng);
          const encodedMsg = encodeURIComponent(msg);
          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

          window.open(whatsappUrl, '_blank');
        } catch (err) {
          console.error('Failed to save coordinates to backend:', err);
          toast.error('Could not save location to order, opening WhatsApp...');
          const msg = constructWhatsAppMessage(lat, lng);
          window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        console.warn('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission was denied. You can still share your registered delivery address on WhatsApp.');
        } else {
          setGeoError('Unable to retrieve your location: ' + error.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const handleShareManualAddress = () => {
    const msg = constructManualWhatsAppMessage();
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <FiMapPin className="text-xl" />
            </span>
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Share Delivery Location</h3>
              <p className="text-xs text-gray-500">Order #{order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Content notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs sm:text-sm text-emerald-900 leading-relaxed">
          <p className="font-bold text-emerald-800 mb-1">🎉 Order Accepted by Restaurant!</p>
          To ensure accurate and swift delivery to your doorstep, please share your GPS delivery location with our delivery partner on WhatsApp.
        </div>

        {/* Address summary */}
        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
          <span className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">Registered Address:</span>
          <p className="text-gray-800">{order.deliveryAddress}</p>
        </div>

        {/* Permission Denied / Error Alert */}
        {geoError && (
          <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl text-xs text-amber-800 space-y-2">
            <div className="flex items-start space-x-2">
              <FiAlertCircle className="text-base text-amber-600 shrink-0 mt-0.5" />
              <span>{geoError}</span>
            </div>
            <button
              onClick={handleShareManualAddress}
              className="mt-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition flex items-center justify-center space-x-2"
            >
              <FaWhatsapp className="text-base" />
              <span>Send Registered Address via WhatsApp</span>
            </button>
          </div>
        )}

        {/* Location shared already indicator */}
        {order.locationShared && (
          <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-100/60 p-2.5 rounded-xl">
            <FiCheck className="text-emerald-600 font-bold" />
            <span>GPS location is already linked to this order. You can re-share if needed.</span>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="space-y-2 pt-2">
          <button
            disabled={loading}
            onClick={handleGetLocationAndOpenWhatsApp}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="inline-flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Requesting GPS Location...</span>
              </span>
            ) : (
              <>
                <FaWhatsapp className="text-xl" />
                <span>Share Current GPS Location via WhatsApp</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-gray-400 text-center">
            Clicking will request browser location permission and open WhatsApp with prefilled Google Maps coordinates. You will manually press send.
          </p>
        </div>

      </div>
    </div>
  );
};
