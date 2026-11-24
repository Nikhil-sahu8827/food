import React from 'react';
import { useCart } from '../context/CartContext';
import { useRestaurantStatus } from '../context/RestaurantStatusContext';
import { FiPlus, FiMinus, FiCheck } from 'react-icons/fi';

export const MenuCard = ({ item }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const { status } = useRestaurantStatus();

  const cartEntry = items.find((i) => i.foodItem.id === item.id);
  const isAvailable = item.available && status?.open;

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${
      !item.available ? 'opacity-70 grayscale-[30%]' : ''
    }`}>
      {/* Food Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />

        {/* Veg / Non-Veg Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md shadow-sm flex items-center space-x-1.5">
          <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${
            item.veg ? 'border-emerald-600' : 'border-rose-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${item.veg ? 'bg-emerald-600' : 'bg-rose-600'}`}></div>
          </div>
          <span className={`text-[11px] font-bold ${item.veg ? 'text-emerald-700' : 'text-rose-700'}`}>
            {item.veg ? 'VEG' : 'NON-VEG'}
          </span>
        </div>

        {/* Availability Badge */}
        {!item.available && (
          <div className="absolute top-3 right-3 bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow">
            SOLD OUT
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">
              {item.name}
            </h3>
            <span className="font-extrabold text-brand-600 text-base sm:text-lg whitespace-nowrap">
              ₹{Number(item.price).toFixed(2)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {item.description || 'Prepared fresh with traditional aromatic spices.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium capitalize">
            {item.categoryName}
          </span>

          {!item.available ? (
            <span className="text-xs font-semibold text-gray-400 italic">Currently Unavailable</span>
          ) : !status?.open ? (
            <span className="text-xs font-semibold text-rose-500">Kitchen Closed</span>
          ) : cartEntry ? (
            <div className="flex items-center space-x-2 bg-brand-50 border border-brand-200 rounded-xl px-2 py-1">
              <button
                onClick={() => updateQuantity(item.id, cartEntry.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm hover:bg-brand-600 hover:text-white transition"
                aria-label="Decrease quantity"
              >
                <FiMinus className="text-sm" />
              </button>
              <span className="text-sm font-bold text-brand-900 w-5 text-center">
                {cartEntry.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, cartEntry.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm hover:bg-brand-600 hover:text-white transition"
                aria-label="Increase quantity"
              >
                <FiPlus className="text-sm" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item, 1)}
              className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition"
            >
              <FiPlus />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
