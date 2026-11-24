import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuApi } from '../api/menuApi';
import { useRestaurantStatus } from '../context/RestaurantStatusContext';
import { MenuCard } from '../components/MenuCard';
import { FiArrowRight, FiClock, FiMapPin, FiTruck, FiShield, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export const Home = () => {
  const { status } = useRestaurantStatus();
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catsRes, itemsRes] = await Promise.all([
          menuApi.getCategories(),
          menuApi.getMenu(),
        ]);
        setCategories(catsRes.data);
        // Pick first 6 items as featured
        setFeaturedItems(itemsRes.data.slice(0, 6));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-brand-100/80 text-brand-800 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                <span>✨ Single-Restaurant Authentic Kitchen</span>
                <span>•</span>
                <span className="text-brand-900">COD Only</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
                Royal Flavors Delivered Fresh to Your Doorstep.
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Handcrafted biryanis, slow-simmered rich curries, and clay tandoor delicacies. Prepared with pride and delivered with precise WhatsApp live location tracking.
              </p>

              {/* Status & CTA Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-brand-500/25 transition flex items-center justify-center space-x-2 text-base"
                >
                  <span>Order Now</span>
                  <FiArrowRight className="text-lg" />
                </Link>

                {status?.whatsappNumber && (
                  <a
                    href={`https://wa.me/${status.whatsappNumber}?text=Hi,%20I'd%20like%20to%20inquire%20about%20ordering%20food.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold px-6 py-4 rounded-2xl shadow-sm transition flex items-center justify-center space-x-2 text-base"
                  >
                    <FaWhatsapp className="text-emerald-500 text-xl" />
                    <span>WhatsApp Order</span>
                  </a>
                )}
              </div>

              {/* Timing Micro Banner */}
              <div className="pt-4 flex items-center justify-center lg:justify-start space-x-4 text-xs font-semibold text-gray-500">
                <div className="flex items-center space-x-1.5">
                  <FiClock className="text-brand-600 text-sm" />
                  <span>Daily 11:00 AM - 11:30 PM</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1.5">
                  <FiShield className="text-emerald-600 text-sm" />
                  <span>100% Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80"
                    alt="Royal Dum Biryani"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <div className="text-white">
                      <span className="bg-brand-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        Chef's Signature
                      </span>
                      <h4 className="text-xl font-extrabold mt-1">Royal Hyderabadi Dum Biryani</h4>
                      <p className="text-xs text-gray-200 mt-0.5">Slow-cooked handi preparation with desi ghee</p>
                    </div>
                  </div>
                </div>

                {/* Floating micro card */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 hidden sm:flex items-center space-x-3 max-w-xs">
                  <span className="text-3xl p-2 bg-emerald-50 rounded-xl">📍</span>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">WhatsApp GPS Sharing</h5>
                    <p className="text-[11px] text-gray-500">Share your exact pin after kitchen acceptance for effortless delivery.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Explore Our Menu</h2>
            <p className="text-sm text-gray-500 mt-1">Authentic culinary specialties prepared fresh to order</p>
          </div>
          <Link
            to="/menu"
            className="text-brand-600 hover:text-brand-700 font-bold text-sm inline-flex items-center space-x-1"
          >
            <span>View Full Menu</span>
            <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${cat.id}`}
              className="group p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-500 hover:shadow-md transition text-center space-y-2"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition duration-300">
                🍽️
              </div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition">
                {cat.categoryName}
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">
                {cat.itemCount ? `${cat.itemCount} items` : 'Specials'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Items Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Customer Favorites</h2>
            <p className="text-sm text-gray-500 mt-1">Most loved dishes ordered daily by our patrons</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-4">
                <div className="aspect-[16/10] bg-gray-200 rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us & Operational Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Built For Real Restaurant Ops</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Seamless Dining & Delivery Experience</h2>
            <p className="text-sm text-gray-400">Engineered with robust business rules, cash on delivery convenience, and WhatsApp integration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700 space-y-3">
              <span className="text-3xl">💵</span>
              <h3 className="font-bold text-lg text-white">100% Cash on Delivery</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Pay safely in cash when your hot food arrives at your door. No online payment gateway hassles or failed bank charges.
              </p>
            </div>

            <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700 space-y-3">
              <span className="text-3xl">📍</span>
              <h3 className="font-bold text-lg text-white">WhatsApp Live Location Drop</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                As soon as the chef accepts your order, share your exact GPS pin on WhatsApp with one click for pinpoint delivery accuracy.
              </p>
            </div>

            <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700 space-y-3">
              <span className="text-3xl">⏰</span>
              <h3 className="font-bold text-lg text-white">Live Kitchen Timings</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Automatic opening and closing schedules guarantee orders are only accepted when the kitchen is operating and fresh.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
