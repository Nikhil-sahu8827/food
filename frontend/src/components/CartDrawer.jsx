import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRestaurantStatus } from '../context/RestaurantStatusContext';
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';

export const CartDrawer = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, cartCount } = useCart();
  const { status } = useRestaurantStatus();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const minOrder = Number(status?.minimumOrderAmount || 0);
  const isBelowMin = subtotal < minOrder;
  const isClosed = !status?.open;

  const handleProceedToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center space-x-2">
              <FiShoppingBag className="text-xl text-brand-600" />
              <h2 className="text-lg font-bold text-gray-900">Your Cart ({cartCount})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              aria-label="Close cart"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <span className="text-6xl block">🍽️</span>
                <p className="text-gray-500 font-medium">Your cart is empty.</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/menu');
                  }}
                  className="bg-brand-50 text-brand-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-brand-100 transition"
                >
                  Explore Food Menu
                </button>
              </div>
            ) : (
              items.map(({ foodItem, quantity }) => (
                <div
                  key={foodItem.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <img
                    src={foodItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                    alt={foodItem.name}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{foodItem.name}</h4>
                    <p className="text-xs text-brand-600 font-semibold">₹{Number(foodItem.price).toFixed(2)} each</p>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(foodItem.id, quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-100"
                      >
                        <FiMinus className="text-xs" />
                      </button>
                      <span className="text-xs font-bold text-gray-800 w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(foodItem.id, quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-100"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-bold text-sm text-gray-900">
                      ₹{(Number(foodItem.price) * quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(foodItem.id)}
                      className="text-gray-400 hover:text-rose-500 text-xs mt-2 transition"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Total */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3">
              {/* COD Badge */}
              <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold text-amber-800">
                <span>Payment Mode</span>
                <span className="bg-amber-200/80 px-2 py-0.5 rounded text-[11px] font-bold">Cash on Delivery (COD)</span>
              </div>

              {/* Minimum Order Warning */}
              {isBelowMin && (
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center space-x-2 text-xs font-medium text-rose-700">
                  <FiAlertTriangle className="shrink-0 text-base" />
                  <span>Minimum order amount is ₹{minOrder.toFixed(2)}. Add ₹{(minOrder - subtotal).toFixed(2)} more.</span>
                </div>
              )}

              {/* Kitchen Closed Warning */}
              {isClosed && (
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center space-x-2 text-xs font-medium text-rose-700">
                  <FiAlertTriangle className="shrink-0 text-base" />
                  <span>Restaurant is currently closed. Ordering is disabled.</span>
                </div>
              )}

              {/* Subtotal & Total */}
              <div className="space-y-1.5 pt-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <span>📍</span>
                  <span>Free doorstep delivery within <strong>2.5 km</strong> radius</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-brand-600">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                disabled={isBelowMin || isClosed}
                onClick={handleProceedToCheckout}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <span>Proceed to Checkout (COD)</span>
                <FiArrowRight className="text-lg" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
