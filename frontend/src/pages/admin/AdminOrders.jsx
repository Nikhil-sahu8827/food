import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAudioAlert } from '../../hooks/useAudioAlert';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { FiRefreshCw, FiMapPin, FiChevronLeft, FiChevronRight, FiFilter, FiEye, FiPlus, FiShoppingBag, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { stopContinuousRing, playBellStrike } = useAudioAlert();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, size: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getOrders(params);
      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time WebSocket updates on /topic/admin/orders
  useWebSocket({
    topic: '/topic/admin/orders',
    onMessage: (incomingOrder) => {
      fetchOrders();
    },
    pollingFallbackFn: fetchOrders,
    pollingIntervalMs: 12000,
  });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      let reason = null;
      if (newStatus === 'REJECTED') {
        reason = window.prompt('Enter rejection reason:') || 'Order rejected by restaurant';
      }
      await adminApi.updateOrderStatus(orderId, { status: newStatus, rejectionReason: reason });
      
      // Stop continuous ringing when admin takes action
      if (newStatus === 'ACCEPTED' || newStatus === 'REJECTED') {
        stopContinuousRing();
      }

      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const statuses = [
    { label: 'All Orders', val: '' },
    { label: 'Pending', val: 'PENDING' },
    { label: 'Accepted', val: 'ACCEPTED' },
    { label: 'Preparing', val: 'PREPARING' },
    { label: 'Ready', val: 'READY' },
    { label: 'Completed', val: 'COMPLETED' },
    { label: 'Rejected', val: 'REJECTED' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📅</span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Today's Orders</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Live restaurant kitchen orders, instant continuous sound alerts & lifecycle actions</p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Add Menu Quick Action Button */}
          <Link
            to="/admin/menu"
            className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <FiPlus className="text-sm" />
            <span>Add Menu Item</span>
          </Link>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition shadow-sm text-sm"
            title="Refresh orders"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {statuses.map((s) => (
          <button
            key={s.val}
            onClick={() => {
              setStatusFilter(s.val);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              statusFilter === s.val
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Mobile Orders Card View (visible on mobile screens) */}
      <div className="block lg:hidden space-y-4">
        {loading && orders.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center text-gray-400">
            <FiRefreshCw className="animate-spin text-2xl mx-auto mb-2 text-brand-500" />
            <span>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center text-gray-400">
            <span>No orders matching selected criteria.</span>
          </div>
        ) : (
          orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <span className="font-mono font-black text-gray-900 text-sm block">
                    {ord.orderNumber}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Recent'}
                  </span>
                </div>
                <OrderStatusBadge status={ord.orderStatus} />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">{ord.customerName}</span>
                  <a
                    href={`tel:${ord.customerMobile}`}
                    className="font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg"
                  >
                    📞 {ord.customerMobile}
                  </a>
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">
                  📍 {ord.deliveryAddress}
                </p>
                {ord.locationShared && (
                  <a
                    href={`https://www.google.com/maps?q=${ord.latitude},${ord.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold"
                  >
                    <FiMapPin />
                    <span>View Customer GPS Pin on Map</span>
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Total Amount</span>
                  <span className="text-base font-black text-brand-600">₹{Number(ord.totalAmount).toFixed(2)}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                    title="View details"
                  >
                    <FiEye />
                  </button>

                  {ord.orderStatus === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'ACCEPTED')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-sm transition"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'REJECTED')}
                        className="px-2.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {ord.orderStatus === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      🍳 Preparing
                    </button>
                  )}

                  {ord.orderStatus === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'READY')}
                      className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      🛍️ Ready
                    </button>
                  )}

                  {ord.orderStatus === 'READY' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'COMPLETED')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      🚚 Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Orders Table (hidden on mobile, visible on desktop) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">Order Number</th>
                <th className="py-4 px-4">Date / Time</th>
                <th className="py-4 px-4">Customer & Contact</th>
                <th className="py-4 px-4">Delivery Address</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">GPS Shared</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No orders matching selected criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-gray-900 whitespace-nowrap">
                      {ord.orderNumber}
                    </td>
                    <td className="py-4 px-4 text-gray-500 whitespace-nowrap text-[11px]">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{ord.customerName}</div>
                      <div className="text-gray-400 text-[11px]">{ord.customerMobile}</div>
                    </td>
                    <td className="py-4 px-4 max-w-xs truncate text-gray-600">
                      {ord.deliveryAddress}
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
                          className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold hover:bg-emerald-200"
                        >
                          <FiMapPin />
                          <span>View Map</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                        title="View Full Details"
                      >
                        <FiEye />
                      </button>

                      {ord.orderStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'ACCEPTED')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'REJECTED')}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {ord.orderStatus === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          Preparing
                        </button>
                      )}

                      {ord.orderStatus === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'READY')}
                          className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          Ready
                        </button>
                      )}

                      {ord.orderStatus === 'READY' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'COMPLETED')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
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

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 0}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
            >
              <FiChevronLeft />
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Order #{selectedOrder.orderNumber}</h3>
                <span className="text-xs text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <OrderStatusBadge status={selectedOrder.orderStatus} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Customer:</span>
                <p className="font-bold text-gray-900">{selectedOrder.customerName} ({selectedOrder.customerMobile})</p>
                <p className="text-gray-600">{selectedOrder.deliveryAddress}</p>
                {selectedOrder.locationShared && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedOrder.latitude},${selectedOrder.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-emerald-700 font-bold hover:underline mt-1"
                  >
                    <FiMapPin /> <span>Open WhatsApp Shared Pin in Google Maps ↗</span>
                  </a>
                )}
              </div>

              <div className="divide-y divide-gray-100 pt-1">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between">
                    <span>{item.foodName} × {item.quantity}</span>
                    <span className="font-bold text-gray-900">₹{Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm font-black pt-2 border-t border-gray-200">
                <span>Total Amount (COD):</span>
                <span className="text-brand-600">₹{Number(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
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
