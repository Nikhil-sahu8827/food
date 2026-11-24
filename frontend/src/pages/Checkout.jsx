import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRestaurantStatus } from '../context/RestaurantStatusContext';
import { orderApi } from '../api/orderApi';
import { FiCheckCircle, FiShield, FiAlertTriangle, FiArrowLeft, FiShoppingBag, FiMapPin, FiCrosshair } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { status } = useRestaurantStatus();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 2.5 km Geofencing delivery configuration & state
  const restaurantLat = Number(status?.restaurantLatitude || 12.9716);
  const restaurantLng = Number(status?.restaurantLongitude || 77.6412);
  const maxRadiusKm = Number(status?.maxDeliveryRadiusKm || 2.5);

  const [coords, setCoords] = useState(null); // { lat, lng }
  const [distanceKm, setDistanceKm] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's mean radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  };

  const handleDetectGPS = () => {
    setIsLocating(true);
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        const dist = calculateDistance(restaurantLat, restaurantLng, lat, lng);
        setDistanceKm(dist);
        setIsLocating(false);
        if (dist <= maxRadiusKm) {
          toast.success(`Location verified! ${dist} km from kitchen (Within ${maxRadiusKm} km range).`);
        } else {
          toast.error(`Out of delivery range (${dist} km away). Max allowed radius is ${maxRadiusKm} km.`);
        }
      },
      (err) => {
        console.warn(err);
        setIsLocating(false);
        setGeoError('GPS permission denied or timed out. Please choose a sample demo location below to test.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSetSampleLocation = (lat, lng, addressSample) => {
    setCoords({ lat, lng });
    const dist = calculateDistance(restaurantLat, restaurantLng, lat, lng);
    setDistanceKm(dist);
    setGeoError('');
    if (addressSample && !deliveryAddress.trim()) {
      setDeliveryAddress(addressSample);
    }
    if (dist <= maxRadiusKm) {
      toast.success(`Location set: ${dist} km away (Deliverable)`);
    } else {
      toast.error(`Location set: ${dist} km away (Exceeds ${maxRadiusKm} km radius)`);
    }
  };

  const minOrder = Number(status?.minimumOrderAmount || 0);
  const isBelowMin = subtotal < minOrder;
  const isClosed = !status?.open;
  const isOutOfRange = distanceKm !== null && distanceKm > maxRadiusKm;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu');
    }
  }, [items, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-100 shadow-xl text-center space-y-4">
        <span className="text-5xl block">🔐</span>
        <h2 className="text-xl font-black text-gray-900">Sign in to complete order</h2>
        <p className="text-xs text-gray-500">
          Please log in or create an account to proceed with Cash on Delivery checkout and order tracking.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            to="/login?redirect=/checkout"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition"
          >
            Sign In
          </Link>
          <Link
            to="/register?redirect=/checkout"
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!deliveryAddress.trim()) {
      setErrorMsg('Please enter your full delivery address.');
      return;
    }

    if (isClosed) {
      setErrorMsg('Restaurant is currently closed. Orders cannot be accepted.');
      return;
    }

    if (isBelowMin) {
      setErrorMsg(`Cart total must be at least ₹${minOrder.toFixed(2)}.`);
      return;
    }

    if (isOutOfRange) {
      setErrorMsg(`Delivery is only available within ${maxRadiusKm} km of our kitchen. Your selected location is ${distanceKm} km away.`);
      toast.error(`Out of delivery range (${distanceKm} km). Max ${maxRadiusKm} km allowed.`);
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        deliveryAddress: deliveryAddress.trim(),
        latitude: coords ? coords.lat : null,
        longitude: coords ? coords.lng : null,
        items: items.map((i) => ({
          foodItemId: i.foodItem.id,
          quantity: i.quantity,
        })),
      };

      const res = await orderApi.placeOrder(orderPayload);
      const placedOrder = res.data;

      // Clear local cart
      clearCart();
      toast.success('Order placed successfully! Cash on Delivery.');

      // Redirect to Order Confirmation page
      navigate(`/order-success/${placedOrder.orderNumber}`, { state: { order: placedOrder } });
    } catch (err) {
      console.error('Failed to place order:', err);
      const msg = err.response?.data?.message || 'Could not place order. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <Link
        to="/menu"
        className="inline-flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-brand-600 transition"
      >
        <FiArrowLeft />
        <span>Back to Food Menu</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Checkout Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Checkout</h1>
            <p className="text-xs text-gray-500 mt-1">Cash on Delivery (COD) exclusively</p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium p-3.5 rounded-xl flex items-center space-x-2">
              <FiAlertTriangle className="text-base shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="space-y-5">
            {/* Customer Details Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200/70 text-xs">
              <div>
                <span className="block text-gray-400 font-semibold uppercase text-[10px]">Customer Name</span>
                <span className="font-bold text-gray-900 text-sm">{user?.fullName}</span>
              </div>
              <div>
                <span className="block text-gray-400 font-semibold uppercase text-[10px]">Mobile Contact</span>
                <span className="font-bold text-gray-900 text-sm">{user?.mobileNumber}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Full Delivery Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="House/Flat number, Building name, Street, Landmark, Area, City, Pincode"
                className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
              />
              <span className="text-[11px] text-gray-400 block">
                After the restaurant accepts your order, you can also share your exact GPS pin on WhatsApp.
              </span>
            </div>

            {/* 2.5 km Geofencing Delivery Location Verification */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <FiMapPin className="text-brand-600 text-lg shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Delivery Zone Verification (Max {maxRadiusKm} km)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      We deliver within {maxRadiusKm} km to ensure hot, fresh food.
                    </p>
                  </div>
                </div>
                {distanceKm !== null && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                      distanceKm <= maxRadiusKm
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {distanceKm <= maxRadiusKm
                      ? `✓ ${distanceKm} km (In Delivery Zone)`
                      : `✕ ${distanceKm} km (Out of Range)`}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isLocating}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-xs font-bold rounded-xl transition shadow-sm active:scale-95"
                >
                  <FiCrosshair className={isLocating ? 'animate-spin' : ''} />
                  <span>{isLocating ? 'Detecting Location...' : '📍 Auto-Detect My Location'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetSampleLocation(12.9750, 77.6430, '100 Feet Rd, Indiranagar, Bengaluru, 560038')}
                  className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 text-[11px] font-semibold rounded-xl border border-gray-200 transition"
                >
                  🎯 Test: Near (~0.5 km)
                </button>

                <button
                  type="button"
                  onClick={() => handleSetSampleLocation(12.9200, 77.6100, '5th Block Koramangala, Bengaluru, 560095')}
                  className="px-2.5 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 text-gray-700 text-[11px] font-semibold rounded-xl border border-gray-200 transition"
                >
                  🚫 Test: Far (~6.5 km)
                </button>
              </div>

              {/* Feedback Alert Banners */}
              {distanceKm !== null && distanceKm <= maxRadiusKm && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-800 font-medium">
                  <FiCheckCircle className="text-emerald-600 text-lg shrink-0" />
                  <span>
                    Great! Your location is <strong>{distanceKm} km</strong> from the kitchen (within <strong>{maxRadiusKm} km</strong> radius). Order can be placed.
                  </span>
                </div>
              )}

              {distanceKm !== null && distanceKm > maxRadiusKm && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center space-x-2 text-xs text-rose-800 font-medium">
                  <FiAlertTriangle className="text-rose-600 text-lg shrink-0" />
                  <span>
                    Sorry! Your location is <strong>{distanceKm} km</strong> away. We only deliver within <strong>{maxRadiusKm} km</strong> to maintain food temperature.
                  </span>
                </div>
              )}

              {geoError && (
                <p className="text-[11px] text-amber-700 font-medium">⚠️ {geoError}</p>
              )}
            </div>

            {/* Payment Mode Selector (COD Only) */}
            <div className="space-y-2 pt-2">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Select Payment Method
              </span>
              
              <div className="p-4 rounded-2xl border-2 border-brand-500 bg-brand-50/40 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full border-4 border-brand-600 bg-white"></div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-gray-500">Pay cash upon delivery at your doorstep.</p>
                  </div>
                </div>
                <span className="text-2xl">💵</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl text-[11px] text-amber-800 flex items-center space-x-2">
                <FiShield className="text-base text-amber-600 shrink-0" />
                <span>Online payment gateways (Cards/UPI) are disabled as per restaurant operational policy. COD only.</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || isClosed || isBelowMin || isOutOfRange}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 text-base active:scale-[0.99]"
            >
              {submitting ? (
                <span className="inline-flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Placing Order in Database...</span>
                </span>
              ) : isOutOfRange ? (
                <>
                  <FiAlertTriangle className="text-xl text-rose-300" />
                  <span>Out of Delivery Range ({distanceKm} km - Max {maxRadiusKm} km)</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="text-xl" />
                  <span>Place Order (₹{subtotal.toFixed(2)} COD)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Order Summary */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <FiShoppingBag className="text-brand-600 text-lg" />
            <h3 className="text-base font-extrabold text-gray-900">Order Summary ({items.length})</h3>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map(({ foodItem, quantity }) => (
              <div key={foodItem.id} className="flex justify-between items-start text-xs">
                <div>
                  <span className="font-bold text-gray-800">{foodItem.name}</span>
                  <span className="text-gray-400 block">x{quantity} @ ₹{Number(foodItem.price).toFixed(2)}</span>
                </div>
                <span className="font-extrabold text-gray-900">
                  ₹{(Number(foodItem.price) * quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total Payable</span>
              <span className="text-brand-600">₹{subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 text-center">
            Prices are calculated and snapshot strictly on server for accounting integrity.
          </div>
        </div>

      </div>

    </div>
  );
};
