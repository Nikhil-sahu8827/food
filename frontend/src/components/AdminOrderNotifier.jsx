import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioAlert } from '../hooks/useAudioAlert';
import { adminApi } from '../api/adminApi';
import { FiBell, FiBellOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const AdminOrderNotifier = () => {
  const navigate = useNavigate();
  const { isRinging, startContinuousRing, stopContinuousRing, playBellStrike } = useAudioAlert();
  const [activeAlert, setActiveAlert] = useState(null);
  const [accepting, setAccepting] = useState(false);

  // WebSocket listener on /topic/admin/orders across all admin pages
  useWebSocket({
    topic: '/topic/admin/orders',
    onMessage: (order) => {
      console.log('Admin received WebSocket order notification:', order);

      // If a customer just placed a new order (status PENDING)
      if (order.orderStatus === 'PENDING') {
        startContinuousRing();
        setActiveAlert({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName || 'Customer',
          totalAmount: order.totalAmount,
          itemCount: order.items?.length || 1,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        toast.custom(
          (t) => (
            <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-2xl flex items-center space-x-3 border-2 border-white animate-bounce">
              <span className="text-3xl">🔔</span>
              <div>
                <div className="font-black text-sm uppercase tracking-wider">New Order Alert!</div>
                <div className="text-xs font-semibold">#{order.orderNumber} • ₹{Number(order.totalAmount || 0).toFixed(2)}</div>
              </div>
            </div>
          ),
          { duration: 8000 }
        );
      } else if (order.orderStatus === 'ACCEPTED' || order.orderStatus === 'REJECTED') {
        // Once restaurant accepts or rejects, stop continuous ringing sound!
        stopContinuousRing();
        setActiveAlert((prev) => (prev?.orderId === order.id ? null : prev));
        playBellStrike();
        toast.success(`Order #${order.orderNumber} ${order.orderStatus.toLowerCase()} successfully!`, {
          icon: order.orderStatus === 'ACCEPTED' ? '✅' : '❌',
          duration: 4000,
        });
      } else {
        // Other transitions (PREPARING, READY, COMPLETED)
        playBellStrike();
        toast.success(`Order #${order.orderNumber} is now ${order.orderStatus}`, {
          icon: '📦',
          duration: 4000,
        });
      }
    },
  });

  const handleQuickAccept = async () => {
    if (!activeAlert?.orderId) return;
    setAccepting(true);
    try {
      await adminApi.updateOrderStatus(activeAlert.orderId, { status: 'ACCEPTED' });
      stopContinuousRing();
      setActiveAlert(null);
      toast.success(`Order #${activeAlert.orderNumber} Accepted! Ringing stopped.`);
    } catch (err) {
      console.error('Failed to accept order:', err);
      toast.error('Failed to accept order. Please try from orders page.');
    } finally {
      setAccepting(false);
    }
  };

  const handleDismiss = () => {
    stopContinuousRing();
    setActiveAlert(null);
  };

  const handleViewOrder = () => {
    stopContinuousRing();
    setActiveAlert(null);
    navigate('/admin/orders');
  };

  return (
    <>
      {/* Persistent Floating Ringing Banner on top of Admin Screen */}
      {activeAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 bg-[length:200%_auto] animate-gradient text-white p-4 sm:p-5 rounded-3xl shadow-2xl border-4 border-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 animate-pulse">
              <FiBell className="text-2xl text-yellow-300 animate-wiggle" />
            </div>
            <div>
              <div className="flex items-center space-x-2 justify-center sm:justify-start">
                <span className="bg-white text-rose-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                  🔔 Incoming Customer Order
                </span>
                <span className="text-xs text-yellow-200 font-bold">{activeAlert.time}</span>
              </div>
              <h4 className="text-lg font-black tracking-tight mt-0.5">
                Order #{activeAlert.orderNumber} • ₹{Number(activeAlert.totalAmount || 0).toFixed(2)}
              </h4>
              <p className="text-xs text-white/90">
                Customer: <strong>{activeAlert.customerName}</strong> ({activeAlert.itemCount} items)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 flex-wrap justify-center">
            {/* Direct 1-Click Accept & Stop Continuous Ringing */}
            <button
              onClick={handleQuickAccept}
              disabled={accepting}
              className="bg-emerald-500 hover:bg-emerald-400 text-white active:scale-95 px-4 py-2.5 rounded-2xl font-black text-xs shadow-lg transition flex items-center space-x-1.5 border border-emerald-300"
            >
              <FiCheckCircle className="text-sm" />
              <span>{accepting ? 'Accepting...' : 'Accept & Stop Ring'}</span>
            </button>

            <button
              onClick={handleViewOrder}
              className="bg-white hover:bg-yellow-100 text-gray-900 active:scale-95 px-3.5 py-2.5 rounded-2xl font-black text-xs shadow-lg transition flex items-center space-x-1"
            >
              <span>View</span>
              <FiArrowRight />
            </button>

            <button
              onClick={handleDismiss}
              className="bg-black/30 hover:bg-black/50 text-white active:scale-95 px-3 py-2.5 rounded-2xl font-bold text-xs transition flex items-center space-x-1"
              title="Stop ringing audio"
            >
              <FiBellOff className="text-base" />
              <span>Mute</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
