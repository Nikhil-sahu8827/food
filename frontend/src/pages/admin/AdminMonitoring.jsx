import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import { FiDatabase, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiClock, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const AdminMonitoring = () => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);

  const loadUsage = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDatabaseUsage();
      setUsage(res.data);
    } catch (err) {
      console.error('Failed to load database usage:', err);
      toast.error('Could not fetch storage metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  const handleRunCleanupNow = async () => {
    if (!window.confirm('Execute 30-day retention archival job now? Eligible completed/cancelled orders older than 30 days will be moved to archive.')) {
      return;
    }

    setCleaning(true);
    try {
      const res = await adminApi.triggerRetentionCleanup();
      toast.success(`Cleanup complete! Archived ${res.data.archivedOrdersCount} old orders.`);
      loadUsage();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to execute retention cleanup');
    } finally {
      setCleaning(false);
    }
  };

  const pct = usage?.percentageUsed || 0;
  const isHealthy = usage?.healthStatus === 'HEALTHY';
  const isWarning = usage?.healthStatus === 'WARNING';

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Database Storage & Retention</h1>
          <p className="text-xs text-gray-500 mt-1">
            Optimized for Supabase Free Tier (500 MB limit) with automated 30-day order retention
          </p>
        </div>
        <button
          onClick={loadUsage}
          className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition shadow-sm self-start text-sm"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Storage Gauge Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <FiDatabase className="text-brand-600 text-lg" />
            <h2 className="text-lg font-extrabold text-gray-900">Database Storage Gauge</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isHealthy
              ? 'bg-emerald-100 text-emerald-800'
              : isWarning
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }`}>
            Status: {usage?.healthStatus || 'ANALYZING'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-700">Estimated Allocated Size: {usage?.databaseSizeMB || 0} MB</span>
            <span className="text-gray-500">Supabase Free Limit: {usage?.storageLimitMB || 500} MB</span>
          </div>

          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isHealthy ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            ></div>
          </div>

          <div className="text-right text-[11px] font-semibold text-gray-400">
            {pct}% of quota utilized
          </div>
        </div>

        {/* Recommendation Box */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 leading-relaxed">
          <span className="font-bold text-gray-900 block mb-1">Architecture Note:</span>
          {usage?.recommendation || 'Database storage is within safe limits for 200 orders per day.'}
        </div>
      </div>

      {/* 30-Day Retention Policy Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <FiClock className="text-brand-600 text-lg" />
            <h2 className="text-lg font-extrabold text-gray-900">30-Day Retention Policy Engine</h2>
          </div>
          <button
            disabled={cleaning}
            onClick={handleRunCleanupNow}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl shadow transition"
          >
            {cleaning ? 'Archiving...' : 'Run Retention Cleanup Now'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Active Orders (Last 30 Days)</span>
            <span className="text-2xl font-black text-gray-900">{usage?.totalActiveOrders || 0}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Active Order Line-Items</span>
            <span className="text-2xl font-black text-gray-900">{usage?.totalActiveOrderItems || 0}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Archived Historical Orders</span>
            <span className="text-2xl font-black text-brand-600">{usage?.totalArchivedOrders || 0}</span>
          </div>
        </div>

        {/* Protection Guarantees */}
        <div className="space-y-3 pt-2">
          <h3 className="font-extrabold text-sm text-gray-900">Safety Guarantees Enforced by Spring Scheduler:</h3>
          <ul className="text-xs text-gray-600 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Runs daily at 3:00 AM</strong> automatically via background CRON (`0 0 3 * * *`).</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Excludes pending and active orders</strong>: only completed, cancelled, or rejected orders are purged.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Customer and Admin Accounts are never deleted</strong>. Settings, schedules, and menu items remain permanent.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Line-item pricing snapshots preserved</strong> into `order_archive` and `order_item_archive` for auditing.</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};
