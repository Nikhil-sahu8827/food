import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAudioAlert } from '../../hooks/useAudioAlert';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import {
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
  FiAlertCircle,
  FiRefreshCw,
  FiEye,
  FiXCircle,
  FiCheck,
  FiMapPin,
  FiPlus,
  FiBookOpen
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrderModal, setActiveOrderModal] = useState(null);
  const { playNotificationSound, stopContinuousRing } = useAudioAlert();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getOrders({ page: 0, size: 8 }),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.content || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time WebSocket listener on /topic/admin/orders
  useWebSocket({
    topic: '/topic/admin/orders',
    onMessage: (newOrUpdatedOrder) => {
      playNotificationSound();
      toast.success(
        `Order Update: ${newOrUpdatedOrder.orderNumber} is now ${newOrUpdatedOrder.orderStatus}`,
        { icon: '🔔', duration: 5000 }
      );
      // Reload stats and update recent orders list
      loadData();
    },
    pollingFallbackFn: loadData,
    pollingIntervalMs: 15000,
  });

  const handleUpdateStatus = async (orderId, newStatus, reason = null) => {
    try {
      await adminApi.updateOrderStatus(orderId, { status: newStatus, rejectionReason: reason });
      if (newStatus === 'ACCEPTED' || newStatus === 'REJECTED') {
        stopContinuousRing();
      }
      toast.success(`Order status updated to ${newStatus}`);
      loadData();
      if (activeOrderModal && activeOrderModal.id === orderId) {
        setActiveOrderModal(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update status';
      toast.error(msg);
    }
  };

  const statCards = [
    { label: "Today's Orders", val: stats?.totalOrdersToday || 0, icon: <FiShoppingBag />, color: 'bg-brand-50 text-brand-600' },
    { label: "Today's Sales", val: `₹${Number(stats?.todaySales || 0).toFixed(2)}`, icon: <FiDollarSign />, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Action', val: stats?.pendingOrders || 0, icon: <FiClock />, color: 'bg-amber-50 text-amber-600', highlight: stats?.pendingOrders > 0 },
    { label: 'Accepted / Kitchen', val: stats?.acceptedOrders || 0, icon: <FiCheckCircle />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Preparing', val: stats?.preparingOrders || 0, icon: <FiRefreshCw />, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Ready for Dispatch', val: stats?.readyOrders || 0, icon: <FiShoppingBag />, color: 'bg-teal-50 text-teal-600' },
    { label: 'Delivered Today', val: stats?.completedOrders || 0, icon: <FiCheckCircle />, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Rejected / Cancelled', val: (stats?.rejectedOrders || 0) + (stats?.cancelledOrders || 0), icon: <FiAlertCircle />, color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Kitchen Operations Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time incoming orders, operational stats and quick actions</p>
        </div>
        <div className="flex items-center space-x-2.5 flex-wrap">
          <Link
            to="/admin/menu"
            className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition"
          >
            <FiPlus className="text-sm" />
            <span>Add Menu Item</span>
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center space-x-1.5 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition"
          >
            <FiShoppingBag className="text-sm" />
            <span>Today's Orders</span>
          </Link>

          <button
            onClick={playNotificationSound}
            title="Test audio chime"
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <span>🔔 Test Audio</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition shadow-sm text-sm"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`p-5 rounded-3xl bg-white border shadow-sm transition space-y-2 ${
              card.highlight ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">{card.label}</span>
              <span className={`p-2.5 rounded-xl text-lg ${card.color}`}>{card.icon}</span>
            </div>
            <div className="text-2xl font-black text-gray-900">{card.val}</div>
          </div>
        ))}
      </div>

      {/* Live Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="font-extrabold text-gray-900 text-base">Live Order Stream (COD)</h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">Real-time WebSocket active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Dishes</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">GPS Location</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No active orders found in the database.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-gray-900 whitespace-nowrap">
                      {ord.orderNumber}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-gray-800">{ord.customerName}</div>
                      <div className="text-gray-400 text-[11px]">{ord.customerMobile}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600 line-clamp-1 max-w-[200px]">
                        {ord.items?.map((i) => `${i.foodName} (${i.quantity})`).join(', ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-brand-600 whitespace-nowrap">
                      ₹{Number(ord.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <OrderStatusBadge status={ord.orderStatus} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {ord.locationShared ? (
                        <a
                          href={`https://www.google.com/maps?q=${ord.latitude},${ord.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:bg-emerald-200 transition"
                        >
                          <FiMapPin />
                          <span>View GPS Pin</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-[11px] italic">Not shared</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => setActiveOrderModal(ord)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                        title="View Full Order Details"
                      >
                        <FiEye />
                      </button>

                      {/* Quick Status Action Buttons */}
                      {ord.orderStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'ACCEPTED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              const reason = window.prompt('Enter rejection reason (optional):');
                              handleUpdateStatus(ord.id, 'REJECTED', reason || 'Kitchen capacity full');
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {ord.orderStatus === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] transition"
                        >
                          Mark Preparing
                        </button>
                      )}

                      {ord.orderStatus === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'READY')}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[11px] transition"
                        >
                          Mark Ready
                        </button>
                      )}

                      {ord.orderStatus === 'READY' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'COMPLETED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Order #{activeOrderModal.orderNumber}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(activeOrderModal.createdAt).toLocaleString()}
                </span>
              </div>
              <OrderStatusBadge status={activeOrderModal.orderStatus} />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Customer:</span>
                <p className="font-bold text-gray-900">{activeOrderModal.customerName} ({activeOrderModal.customerMobile})</p>
                <p className="text-gray-600">{activeOrderModal.deliveryAddress}</p>
                {activeOrderModal.locationShared && (
                  <a
                    href={`https://www.google.com/maps?q=${activeOrderModal.latitude},${activeOrderModal.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-emerald-700 font-bold hover:underline mt-1"
                  >
                    <FiMapPin /> <span>Open WhatsApp Shared Location in Google Maps ↗</span>
                  </a>
                )}
              </div>

              <div className="divide-y divide-gray-100 pt-2">
                {activeOrderModal.items?.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between">
                    <span>{item.foodName} × {item.quantity}</span>
                    <span className="font-bold text-gray-900">₹{Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm font-black pt-3 border-t border-gray-200">
                <span>Total Amount (COD):</span>
                <span className="text-brand-600">₹{Number(activeOrderModal.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveOrderModal(null)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
