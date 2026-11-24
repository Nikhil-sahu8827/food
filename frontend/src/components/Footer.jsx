import React from 'react';
import { Link } from 'react-router-dom';
import { useRestaurantStatus } from '../context/RestaurantStatusContext';
import { FiMapPin, FiClock, FiShield, FiPhoneCall } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export const Footer = () => {
  const { status } = useRestaurantStatus();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🍛</span>
              <span className="text-xl font-extrabold text-white tracking-tight">
                {status?.restaurantName || 'Royal Spice Kitchen'}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Serving royal culinary recipes crafted with hand-picked ground spices, authentic clay tandoor cooking, and slow dum preparations.
            </p>
            <div className="inline-block bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400">
              💵 Payment: Cash on Delivery (COD) Only
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-brand-400 transition">Full Menu</Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-brand-400 transition">Track Orders</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition">Customer Login</Link>
              </li>
              <li>
                <Link to="/admin" className="text-amber-400 hover:text-amber-300 font-semibold transition flex items-center space-x-1.5">
                  <span>🛡️</span>
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours & Location */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Location & Hours</h4>
            <div className="flex items-start space-x-2 text-sm text-gray-400">
              <FiMapPin className="text-brand-500 text-lg mt-0.5 shrink-0" />
              <span>{status?.restaurantAddress || '88 Gourmet Boulevard, Indiranagar, Bengaluru'}</span>
            </div>
            <div className="flex items-start space-x-2 text-sm text-gray-400">
              <FiClock className="text-brand-500 text-lg mt-0.5 shrink-0" />
              <div>
                <span className="block font-medium text-gray-300">Daily Operations:</span>
                <span className="text-xs text-gray-400">11:00 AM – 11:30 PM (Asia/Kolkata)</span>
              </div>
            </div>
          </div>

          {/* Contact & WhatsApp Location */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Direct Contact</h4>
            <p className="text-xs text-gray-400">
              Have queries or special dietary requests? Chat directly with our manager on WhatsApp.
            </p>
            {status?.whatsappNumber && (
              <a
                href={`https://wa.me/${status.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md w-full justify-center"
              >
                <FaWhatsapp className="text-lg" />
                <span>WhatsApp Kitchen (+{status.whatsappNumber})</span>
              </a>
            )}
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {status?.restaurantName || 'Royal Spice Kitchen'}. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Powered by Spring Boot & React</span>
            <span>•</span>
            <span>Supabase PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
