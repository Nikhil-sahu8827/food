import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioAlert } from '../hooks/useAudioAlert';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { LocationShareModal } from '../components/LocationShareModal';
import { FiCheckCircle, FiClock, FiMapPin, FiArrowRight, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { playNotificationSound } = useAudioAlert();

  const fetchOrder = useCallback(async () => {
    try {
      const res = await orderApi.getMyOrders();
      const found = res.data.find((o) => o.orderNumber === orderNumber);
      if (found) {
        setOrder(found);
      }
    } catch (err) {
      console.error('Failed to fetch order status:', err);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    if (!order) {
      fetchOrder();
    }
  }, [order, fetchOrder]);

  // Subscribe to real-time status updates via WebSocket
  useWebSocket({
    topic: `/topic/orders/${orderNumber}`,
    onMessage: (updatedOrder) => {
      setOrder((prev) => {
        if (!prev) return updatedOrder;
        // If status changed from PENDING to ACCEPTED, trigger chime and toast!
        if (prev.orderStatus === 'PENDING' && updatedOrder.orderStatus === 'ACCEPTED') {
          playNotificationSound();
          toast.success('Your order was accepted! Share your WhatsApp delivery location now.', {
            duration: 6000,
            icon: '🎉',
          });
          setShareModalOpen(true);
        }
        return updatedOrder;
      });
    },
    pollingFallbackFn: fetchOrder,
    pollingIntervalMs: 10000,
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <span className="text-4xl block">🔍</span>
        <h2 className="text-lg font-bold text-gray-800">Order Not Found</h2>
        <p className="text-xs text-gray-500">We could not locate order details for {orderNumber}.</p>
        <Link to="/my-orders" className="inline-block text-xs font-bold text-brand-600 hover:text-brand-700">
          View All My Orders →
        </Link>
      </div>
    );
  }

  const isAccepted = ['ACCEPTED', 'PREPARING', 'READY'].includes(order.orderStatus);
  const isPending = order.orderStatus === 'PENDING';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm text-center space-y-3">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl transition-all duration-500 ${
            isAccepted
              ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-300 scale-110'
              : 'bg-amber-100 text-amber-600 animate-pulse'
          }`}
        >
          {isAccepted ? '✓' : '⏳'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {isAccepted ? '🎉 Order Confirmed by Restaurant!' : 'Order Placed — Waiting for Acceptance...'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
          {isAccepted
            ? 'The restaurant kitchen has accepted and confirmed your order! Your delicious meal is being prepared.'
            : 'Your order was sent to the kitchen and the bell is currently ringing. As soon as the manager accepts, your order will be confirmed.'}
        </p>
        <p className="text-xs sm:text-sm text-gray-400">
          Order Number: <strong className="text-gray-900 font-mono text-sm sm:text-base">{order.orderNumber}</strong>
        </p>

        <div className="pt-2 flex justify-center">
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* WHATSAPP LOCATION SHARING CALLOUT (CRITICAL FEATURE) */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Delivery Location Sharing
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              {isAccepted
                ? 'Kitchen Accepted! Share WhatsApp GPS Pin'
                : 'Waiting for Restaurant Confirmation'}
            </h3>
          </div>
          <span className="text-4xl p-2 bg-white/10 rounded-2xl shrink-0">📍</span>
        </div>

        <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
          {isAccepted
            ? 'Your order has been officially accepted by our kitchen team. Click below to share your exact browser GPS location with our delivery riders on WhatsApp.'
            : 'As per restaurant policy, location sharing opens automatically once the kitchen accepts your order. Please keep this screen open.'}
        </p>

        <div className="pt-2">
          {isAccepted ? (
            <button
              onClick={() => setShareModalOpen(true)}
              className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-900 font-black px-6 py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 text-sm active:scale-95 animate-ring-pulse"
            >
              <FaWhatsapp className="text-xl text-emerald-600" />
              <span>{order.locationShared ? 'Re-Share / Update WhatsApp Location' : 'Share Current Location via WhatsApp'}</span>
            </button>
          ) : (
            <div className="inline-flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2.5 rounded-xl text-xs font-bold text-white border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>Awaiting acceptance by manager... Location button will illuminate shortly.</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900 text-base">Ordered Dishes</h3>
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            Payment: Cash on Delivery (COD)
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-center text-sm">
              <div>
                <span className="font-bold text-gray-900">{item.foodName}</span>
                <span className="block text-xs text-gray-400">Qty: {item.quantity} × ₹{Number(item.unitPrice).toFixed(2)}</span>
              </div>
              <span className="font-extrabold text-gray-900">₹{Number(item.subtotal).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Payment Mode</span>
            <span className="font-bold text-gray-900">Cash on Delivery</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Destination</span>
            <span className="font-semibold text-gray-900 max-w-xs text-right truncate">{order.deliveryAddress}</span>
          </div>
          <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-200">
            <span>Total Payable Amount</span>
            <span className="text-brand-600">₹{Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to="/my-orders"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 text-center rounded-xl text-xs transition"
          >
            Track in My Orders
          </Link>
          <Link
            to="/menu"
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 text-center rounded-xl text-xs transition"
          >
            Order More Dishes
          </Link>
        </div>
      </div>

      {/* Location Share Modal Component */}
      <LocationShareModal
        order={order}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onLocationShared={(lat, lng) => {
          setOrder((prev) => ({ ...prev, latitude: lat, longitude: lng, locationShared: true }));
        }}
      />

    </div>
  );
};
