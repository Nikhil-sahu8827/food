import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiHome, FiBookOpen, FiShoppingBag, FiPackage, FiUser, FiArrowRight } from 'react-icons/fi';

export const MobileBottomNav = ({ onOpenCart }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { cartCount, subtotal } = useCart();
  const location = useLocation();

  // Do not show customer bottom nav on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const isCheckoutOrSuccess = location.pathname.startsWith('/checkout') || location.pathname.startsWith('/order-success');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      
      {/* Floating Swiggy/Zomato style Sticky Cart Bar when items are in cart */}
      {cartCount > 0 && !isCheckoutOrSuccess && (
        <div className="px-4 pb-2 pointer-events-auto">
          <button
            onClick={onOpenCart}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between transition-all duration-300 animate-slide-up border border-emerald-500"
          >
            <div className="flex items-center space-x-2.5 text-left">
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                {cartCount}
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
                  Items Added
                </span>
                <span className="text-sm font-black text-white">
                  ₹{Number(subtotal || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-black bg-white/20 px-3 py-1.5 rounded-xl">
              <span>View Cart</span>
              <FiArrowRight className="text-sm" />
            </div>
          </button>
        </div>
      )}

      {/* Main Bottom App Bar */}
      <nav className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg px-2 py-1.5 flex items-center justify-around pointer-events-auto safe-area-bottom">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-xl transition ${
              isActive ? 'text-brand-600 font-extrabold' : 'text-gray-500 hover:text-gray-800'
            }`
          }
        >
          <FiHome className="text-xl" />
          <span className="text-[10px] mt-0.5">Home</span>
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-xl transition ${
              isActive ? 'text-brand-600 font-extrabold' : 'text-gray-500 hover:text-gray-800'
            }`
          }
        >
          <FiBookOpen className="text-xl" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </NavLink>

        {/* Cart Button */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center py-1 px-3 rounded-xl text-gray-500 hover:text-gray-800 transition"
        >
          <div className="relative">
            <FiShoppingBag className="text-xl" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Cart</span>
        </button>

        {/* Orders link (if customer logged in) */}
        {isAuthenticated && !isAdmin && (
          <NavLink
            to="/my-orders"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-xl transition ${
                isActive ? 'text-brand-600 font-extrabold' : 'text-gray-500 hover:text-gray-800'
              }`
            }
          >
            <FiPackage className="text-xl" />
            <span className="text-[10px] mt-0.5">My Orders</span>
          </NavLink>
        )}

        {/* Profile / Login */}
        {isAuthenticated ? (
          <div className="flex flex-col items-center py-1 px-3 text-gray-700">
            <FiUser className="text-xl text-brand-600" />
            <span className="text-[10px] mt-0.5 truncate max-w-[50px] font-bold">
              {user?.fullName?.split(' ')[0] || 'Profile'}
            </span>
          </div>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-xl transition ${
                isActive ? 'text-brand-600 font-extrabold' : 'text-gray-500 hover:text-gray-800'
              }`
            }
          >
            <FiUser className="text-xl" />
            <span className="text-[10px] mt-0.5">Sign In</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
};
