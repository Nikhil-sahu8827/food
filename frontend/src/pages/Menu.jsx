import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuApi } from '../api/menuApi';
import { MenuCard } from '../components/MenuCard';
import { FiSearch, FiFilter, FiCheck } from 'react-icons/fi';

export const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory ? Number(initialCategory) : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState('ALL'); // 'ALL', 'VEG', 'NON_VEG'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, itemsRes] = await Promise.all([
          menuApi.getCategories(),
          menuApi.getMenu(),
        ]);
        setCategories(catsRes.data);
        setMenuItems(itemsRes.data);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(Number(initialCategory));
    }
  }, [initialCategory]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  // Client-side filtering across selected category, search term, and veg/non-veg
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory ? item.categoryId === selectedCategory : true;
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    const matchesVeg =
      vegFilter === 'ALL' ? true : vegFilter === 'VEG' ? item.veg === true : item.veg === false;

    return matchesCategory && matchesSearch && matchesVeg;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Our Food Menu</h1>
          <p className="text-sm text-gray-500 mt-1">Freshly cooked culinary delights ready for delivery</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Veg/Non-Veg & Categories */}
      <div className="space-y-4">
        
        {/* Veg / Non-Veg Toggle Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Filter:</span>
          
          <button
            onClick={() => setVegFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              vegFilter === 'ALL'
                ? 'bg-gray-900 text-white shadow'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Dishes
          </button>

          <button
            onClick={() => setVegFilter('VEG')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              vegFilter === 'VEG'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white border border-gray-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Pure Veg</span>
          </button>

          <button
            onClick={() => setVegFilter('NON_VEG')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              vegFilter === 'NON_VEG'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-white border border-gray-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <span>Non-Veg</span>
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Categories ({menuItems.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.categoryName} ({menuItems.filter((i) => i.categoryId === cat.id).length})
            </button>
          ))}
        </div>

      </div>

      {/* Menu Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-4">
              <div className="aspect-[16/10] bg-gray-200 rounded-xl"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 space-y-3">
          <span className="text-5xl block">🔍</span>
          <h3 className="text-lg font-bold text-gray-800">No food items found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search criteria or clearing filters to view available dishes.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setVegFilter('ALL');
              setSearchParams({});
            }}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wider"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}

    </div>
  );
};
