import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiLock, FiAlertCircle, FiShield, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [roleTab, setRoleTab] = useState('CUSTOMER'); // 'CUSTOMER' or 'ADMIN'

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleTabChange = (role) => {
    setRoleTab(role);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Password and confirm password do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        role: roleTab,
      };

      const user = await register(payload);
      toast.success(`Account created successfully! Welcome, ${user.fullName}`);
      
      if (user.role === 'ADMIN') {
        // Admin gets redirected to Today's Orders / Live Kitchen
        navigate('/admin/orders');
      } else {
        // Customer gets redirected straight to Food Menu
        navigate('/menu');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
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
            <span>Customer</span>
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
            <span>Restaurant Admin</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-4xl block">{roleTab === 'ADMIN' ? '👨‍🍳' : '🍛'}</span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {roleTab === 'ADMIN' ? 'Create Admin Account' : 'Create Customer Account'}
          </h2>
          <p className="text-xs text-gray-500">
            {roleTab === 'ADMIN'
              ? 'Manage food menu, add dishes & handle today\'s incoming live orders'
              : 'Browse delicious food menu, place orders & live order tracking'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-xl flex items-center space-x-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              {roleTab === 'ADMIN' ? 'Admin Full Name' : 'Full Name'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder={roleTab === 'ADMIN' ? 'Restaurant Manager' : 'Aarav Sharma'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={roleTab === 'ADMIN' ? 'admin@restaurant.com' : 'aarav@example.com'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Mobile Number (10 digits) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="mobileNumber"
                required
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="+919876543210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Password (min. 6 characters) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full active:scale-95 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm ${
              roleTab === 'ADMIN' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>{roleTab === 'ADMIN' ? 'Create Admin Account' : 'Create Customer Account'}</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};
