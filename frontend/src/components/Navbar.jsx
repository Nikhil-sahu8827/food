import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRestaurantStatus } from '../context/RestaurantStatusContext';
import { FiShoppingBag, FiUser, FiLogOut, FiMenu, FiX, FiClock, FiShield } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export const Navbar = ({ onOpenCart }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { status } = useRestaurantStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Status Badge */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-3xl sm:text-4xl">🍛</span>
              <div>
                <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-gray-900 block leading-tight">
                  {status?.restaurantName || 'Royal Spice'}
                </span>
                <span className="text-xs font-medium text-brand-600 block uppercase tracking-wider">
                  Artisanal Kitchen
                </span>
              </div>
            </Link>

            {/* Restaurant Open/Closed Pill */}
            <div className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              status?.open 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-1.5 ${status?.open ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              {status?.open ? 'OPEN NOW' : 'CLOSED'}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">
              Home
            </Link>
            <Link to="/menu" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">
              Food Menu
            </Link>
            
            {/* Customer Role Navigation */}
            {isAuthenticated && !isAdmin && (
              <Link 
                to="/my-orders" 
                className="inline-flex items-center text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-xl shadow-xs transition"
              >
                <span>📦 My Orders</span>
              </Link>
            )}

            {/* Admin Role Navigation */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="inline-flex items-center text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs transition"
              >
                <FiShield className="mr-1.5 text-amber-600 text-base" /> Admin Console
              </Link>
            )}
          </nav>

          {/* Action Buttons: Cart, Auth, WhatsApp */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* WhatsApp Contact */}
            {status?.whatsappNumber && (
              <a
                href={`https://wa.me/${status.whatsappNumber}?text=Hi,%20I%20have%20an%20inquiry%20regarding%20Royal%20Spice%20Kitchen.`}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp"
                className="hidden sm:flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <FaWhatsapp className="text-base" />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition focus:outline-none"
              aria-label="Shopping Cart"
            >
              <FiShoppingBag className="text-2xl text-gray-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-gray-200">
                <div className="text-right">
                  <span className="block text-xs font-semibold text-gray-900 leading-tight">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <span className="block text-[10px] text-gray-500 font-medium capitalize">
                    {user?.role?.toLowerCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <FiLogOut className="text-lg" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-brand-600 px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500">Status</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
              status?.open ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {status?.open ? 'OPEN NOW' : 'CLOSED'}
            </span>
          </div>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 hover:bg-brand-50"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 hover:bg-brand-50"
          >
            Food Menu
          </Link>
          {isAuthenticated && !isAdmin && (
            <Link
              to="/my-orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 hover:bg-brand-50"
            >
              My Orders
            </Link>
          )}
          {/* Admin link only for Admin user */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-bold text-amber-700 bg-amber-50"
            >
              🛡️ Admin Console
            </Link>
          )}

          <div className="pt-2 border-t border-gray-100 space-y-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-gray-900">{user?.fullName}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
