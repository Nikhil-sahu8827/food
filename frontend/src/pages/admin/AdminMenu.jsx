import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiCheck, FiX, FiRefreshCw, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const AdminMenu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    veg: true,
    available: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    categoryName: '',
    description: '',
    active: true,
    displayOrder: 0,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes] = await Promise.all([
        adminApi.getMenuItems(),
        adminApi.getAllCategories(),
      ]);
      setItems(itemsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error('Failed to load menu data:', err);
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Toggle Availability
  const handleToggleAvailability = async (id, currentAvailable) => {
    try {
      await adminApi.toggleAvailability(id, !currentAvailable);
      toast.success('Availability updated!');
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, available: !currentAvailable } : i))
      );
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  // Handle Item Save
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: itemForm.name.trim(),
        description: itemForm.description.trim(),
        price: Number(itemForm.price),
        imageUrl: itemForm.imageUrl.trim(),
        categoryId: Number(itemForm.categoryId),
        veg: itemForm.veg,
        available: itemForm.available,
      };

      if (editingItem) {
        await adminApi.updateMenuItem(editingItem.id, payload);
        toast.success('Food item updated!');
      } else {
        await adminApi.createMenuItem(payload);
        toast.success('Food item created!');
      }
      setItemModalOpen(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save item');
    }
  };

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size cannot exceed 2MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(formData);
      setItemForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Item Delete
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      await adminApi.deleteMenuItem(id);
      toast.success('Item deleted');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete item');
    }
  };

  // Handle Category Save
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, categoryForm);
        toast.success('Category updated!');
      } else {
        await adminApi.createCategory(categoryForm);
        toast.success('Category created!');
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save category');
    }
  };

  // Handle Category Delete
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success('Category deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete category containing dishes');
    }
  };

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      categoryId: categories[0]?.id || '',
      veg: true,
      available: true,
    });
    setItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      imageUrl: item.imageUrl || '',
      categoryId: item.categoryId,
      veg: item.veg,
      available: item.available,
    });
    setItemModalOpen(true);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Menu & Categories</h1>
          <p className="text-xs text-gray-500 mt-1">Add, update prices, toggle availability, and upload photos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ categoryName: '', description: '', active: true, displayOrder: 0 });
              setCategoryModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition"
          >
            Manage Categories
          </button>
          <button
            onClick={openAddItemModal}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <FiPlus className="text-base" />
            <span>Add Food Item</span>
          </button>
        </div>
      </div>

      {/* Food Items Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">Dish Details</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Dietary</th>
                <th className="py-4 px-4">Availability</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                        <div className="text-gray-400 text-[11px] line-clamp-1 max-w-xs">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-gray-600 font-medium">
                    {item.categoryName}
                  </td>
                  <td className="py-4 px-4 font-black text-brand-600 text-sm whitespace-nowrap">
                    ₹{Number(item.price).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.veg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.veg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleAvailability(item.id, item.available)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        item.available
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {item.available ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => openEditItemModal(item)}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                      title="Edit Dish"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                      title="Delete Dish"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Food Item Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-lg">
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase tracking-wider">Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Mutton Rogan Josh"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    placeholder="320.00"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-500 outline-none text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Category *</label>
                  <select
                    required
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-500 outline-none text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase tracking-wider">Description</label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Brief description of flavors and ingredients..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-500 outline-none text-sm"
                />
              </div>

              {/* Image Input & File Upload */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700 uppercase tracking-wider">Food Image</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={itemForm.imageUrl}
                    onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or upload"
                    className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:border-brand-500 outline-none text-xs"
                  />
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-2.5 rounded-xl flex items-center space-x-1">
                    <FiUpload />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadingImage && <span className="text-[11px] text-brand-600 block">Uploading image...</span>}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.veg}
                    onChange={(e) => setItemForm({ ...itemForm, veg: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-gray-700">Pure Vegetarian</span>
                </label>

                <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.available}
                    onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="font-bold text-gray-700">In Stock (Available)</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-base">Categories</h3>
              <button onClick={() => setCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <FiX className="text-lg" />
              </button>
            </div>

            {/* List of existing categories */}
            <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-gray-100">
              {categories.map((cat) => (
                <div key={cat.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-800">{cat.categoryName}</span>
                    <span className="text-gray-400 block text-[10px]">{cat.itemCount || 0} dishes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryForm({
                          categoryName: cat.categoryName,
                          description: cat.description || '',
                          active: cat.active,
                          displayOrder: cat.displayOrder || 0,
                        });
                      }}
                      className="p-1 hover:text-brand-600"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 hover:text-rose-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form to Add / Edit Category */}
            <form onSubmit={handleSaveCategory} className="pt-2 border-t border-gray-100 space-y-3 text-xs">
              <span className="font-bold text-gray-700 block">
                {editingCategory ? `Edit: ${editingCategory.categoryName}` : 'Add New Category'}
              </span>
              <input
                type="text"
                required
                value={categoryForm.categoryName}
                onChange={(e) => setCategoryForm({ ...categoryForm, categoryName: e.target.value })}
                placeholder="Category Name (e.g. Starters)"
                className="w-full p-2 rounded-xl border border-gray-200 outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
