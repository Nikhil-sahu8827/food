import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudioAlert } from '../hooks/useAudioAlert';
import {
  FiGrid,
  FiShoppingBag,
  FiBookOpen,
  FiSettings,
  FiDatabase,
  FiArrowLeft,
  FiLogOut,
  FiExternalLink,
  FiMenu,
  FiX
} from 'react-icons/fi';

export const AdminSidebar = ({ pendingOrdersCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { playBellStrike } = useAudioAlert();
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);

  const navItems = [
    {
      to: '/admin/orders',
      label: "Today's Orders",
      icon: <FiShoppingBag />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
    },
    { to: '/admin/menu', label: 'Add & Manage Menu', icon: <FiBookOpen /> },
    { to: '/admin', label: 'Dashboard & Stats', icon: <FiGrid /> },
    { to: '/admin/settings', label: 'Hours & Settings', icon: <FiSettings /> },
    { to: '/admin/monitoring', label: 'Storage & Health', icon: <FiDatabase /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-full md:w-64 bg-gray-900 text-gray-200 md:min-h-screen flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-gray-800">
      <div>
        {/* Header with Mobile Menu Toggle */}
        <div className="p-4 md:p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl md:text-3xl">👨‍🍳</span>
            <div>
              <h1 className="font-extrabold text-white text-sm md:text-base tracking-tight leading-tight">Admin Console</h1>
              <span className="text-[10px] text-brand-400 uppercase tracking-widest font-bold">Kitchen Ops</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <button
              type="button"
              onClick={playBellStrike}
              className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-1 rounded-lg"
              title="Test bell"
            >
              🔔
            </button>
            <button
              onClick={() => setMobileAdminOpen(!mobileAdminOpen)}
              className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-lg text-sm"
              aria-label="Toggle admin navigation"
            >
              {mobileAdminOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className={`p-4 space-y-1.5 ${mobileAdminOpen ? 'block' : 'hidden md:block'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={() => setMobileAdminOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${isActive
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer User Info & Exit */}
      <div className={`p-4 border-t border-gray-800 space-y-2.5 ${mobileAdminOpen ? 'block' : 'hidden md:block'}`}>
        {/* Order Bell Status & Test */}
        <div className="p-2.5 bg-gray-800/80 rounded-xl border border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-gray-300">Order Bell Active</span>
          </div>
          <button
            type="button"
            onClick={playBellStrike}
            className="text-[11px] font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/40 px-2 py-0.5 rounded-lg transition"
            title="Click to test kitchen bell ring"
          >
            🔔 Test Ring
          </button>
        </div>

        <Link
          to="/"
          className="flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <FiArrowLeft />
          <span>Back to Restaurant Site</span>
        </Link>

        <div className="p-3 bg-gray-800/60 rounded-xl flex items-center justify-between">
          <div className="min-w-0">
            <span className="block text-xs font-bold text-white truncate">{user?.fullName}</span>
            <span className="block text-[10px] text-gray-400 capitalize">{user?.role?.toLowerCase()}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-gray-400 hover:text-rose-400 transition"
          >
            <FiLogOut className="text-base" />
          </button>
        </div>
      </div>
    </aside>
  );
};
