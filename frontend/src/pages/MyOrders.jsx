import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { LocationShareModal } from '../components/LocationShareModal';
import { FiShoppingBag, FiMapPin, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalOrder, setActiveModalOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load my orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 20000); // 20s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Real-time status update for customer's orders
  useWebSocket({
    topic: user?.id ? `/topic/customers/${user.id}/orders` : null,
    onMessage: (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderNumber === updatedOrder.orderNumber ? updatedOrder : o))
      );
      if (updatedOrder.orderStatus === 'ACCEPTED') {
        toast.success(`🎉 Order #${updatedOrder.orderNumber} Confirmed by Restaurant!`, {
          duration: 6000,
        });
      }
    },
    pollingFallbackFn: fetchOrders,
    pollingIntervalMs: 15000,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-xs text-gray-500 mt-1">Track your orders and share delivery locations</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold flex items-center space-x-1.5 transition"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 space-y-4 shadow-sm">
          <span className="text-5xl block">📦</span>
          <h3 className="text-lg font-bold text-gray-800">No orders placed yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Browse our appetizing menu and place your first royal meal with Cash on Delivery.
          </p>
          <Link
            to="/menu"
            className="inline-block bg-brand-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:bg-brand-700 transition"
          >
            Explore Menu Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isAccepted = ['ACCEPTED', 'PREPARING', 'READY'].includes(order.orderStatus);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-brand-600 block">{order.orderNumber}</span>
                    <span className="text-[11px] text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      COD
                    </span>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </div>

                {/* Items summary */}
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-800 font-medium">
                        {item.foodName} <span className="text-gray-400">× {item.quantity}</span>
                      </span>
                      <span className="font-bold text-gray-900">₹{Number(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Address & Total */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-gray-500 max-w-sm truncate">
                    <span className="font-semibold text-gray-700">Delivery To:</span> {order.deliveryAddress}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-[11px] block">Total Amount:</span>
                    <span className="text-lg font-black text-brand-600">₹{Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>

                {/* WhatsApp Location Action Banner (When Accepted) */}
                {isAccepted && (
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80">
                    <div className="text-xs text-emerald-900">
                      <span className="font-bold block">📍 Kitchen Accepted!</span>
                      <span className="text-[11px] text-emerald-700">
                        {order.locationShared
                          ? 'GPS delivery coordinates linked. You can update anytime.'
                          : 'Please share your live GPS delivery pin on WhatsApp.'}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveModalOrder(order)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition whitespace-nowrap"
                    >
                      <FaWhatsapp className="text-base" />
                      <span>{order.locationShared ? 'Re-Share Location' : 'Share WhatsApp Location'}</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Active Modal for Location Sharing */}
      {activeModalOrder && (
        <LocationShareModal
          order={activeModalOrder}
          isOpen={!!activeModalOrder}
          onClose={() => setActiveModalOrder(null)}
          onLocationShared={(lat, lng) => {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === activeModalOrder.id
                  ? { ...o, latitude: lat, longitude: lng, locationShared: true }
                  : o
              )
            );
          }}
        />
      )}

    </div>
  );
};
