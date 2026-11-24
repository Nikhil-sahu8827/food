import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiUser, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/menu';

  const [roleTab, setRoleTab] = useState('CUSTOMER'); // 'CUSTOMER' or 'ADMIN'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleTabChange = (role) => {
    setRoleTab(role);
    setErrorMsg('');
    if (role === 'ADMIN') {
      setEmail('admin@restaurant.com');
      setPassword('AdminPassword@123');
    } else {
      setEmail('customer@restaurant.com');
      setPassword('AdminPassword@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName}!`);
      if (user.role === 'ADMIN') {
        // Admin gets redirected to Today's Live Orders
        navigate('/admin/orders');
      } else {
        // Customer goes directly to Food Menu
        navigate('/menu', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
        
        {/* Role Selection Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => handleRoleTabChange('CUSTOMER')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              roleTab === 'CUSTOMER'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FiUser className="text-sm" />
            <span>Customer Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('ADMIN')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              roleTab === 'ADMIN'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FiShield className="text-sm" />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <span className="text-4xl block">{roleTab === 'ADMIN' ? '👨‍🍳' : '🍛'}</span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {roleTab === 'ADMIN' ? 'Kitchen & Admin Login' : 'Customer Sign In'}
          </h2>
          <p className="text-xs text-gray-500">
            {roleTab === 'ADMIN'
              ? 'Real-time order bell alerts, live kitchen orders & settings'
              : 'Browse food menu, place orders & live order tracking'}
          </p>
        </div>

        {/* Quick Credentials Auto-Fill Box */}
        {roleTab === 'ADMIN' ? (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>🛡️</span> Admin Credentials
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@restaurant.com');
                  setPassword('AdminPassword@123');
                  toast.success('Admin credentials loaded!');
                }}
                className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
              >
                Auto-Fill Admin
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-lg font-mono">
              <span>admin@restaurant.com</span>
              <span>AdminPassword@123</span>
            </div>
          </div>
        ) : (
          <div className="bg-brand-50/90 border border-brand-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-950 flex items-center gap-1.5">
                <span>👤</span> Demo Customer Account
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('customer@restaurant.com');
                  setPassword('AdminPassword@123');
                  toast.success('Customer credentials loaded!');
                }}
                className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
              >
                Auto-Fill Customer
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-brand-800 bg-brand-100/60 px-2.5 py-1 rounded-lg font-mono">
              <span>customer@restaurant.com</span>
              <span>AdminPassword@123</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-xl flex items-center space-x-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full active:scale-95 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm ${
              roleTab === 'ADMIN'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/25'
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>{roleTab === 'ADMIN' ? 'Enter Admin Console' : 'Sign In as Customer'}</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Create Customer Account
          </Link>
        </div>

      </div>
    </div>
  );
};
