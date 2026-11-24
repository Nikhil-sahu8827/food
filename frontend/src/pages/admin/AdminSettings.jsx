import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import { restaurantApi } from '../../api/restaurantApi';
import { useRestaurantStatus } from '../../context/RestaurantStatusContext';
import { FiSettings, FiClock, FiCalendar, FiSave, FiPlus, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const AdminSettings = () => {
  const { refreshStatus } = useRestaurantStatus();
  const [loading, setLoading] = useState(true);

  // General Settings Form
  const [settingsForm, setSettingsForm] = useState({
    restaurantName: '',
    restaurantAddress: '',
    whatsappNumber: '',
    timezone: 'Asia/Kolkata',
    minimumOrderAmount: 150,
    manualOverride: 'AUTO',
    overrideExpiryMinutes: 0,
  });

  // Weekly Schedule
  const [schedules, setSchedules] = useState([]);

  // Holidays
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ holidayDate: '', description: '' });

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, schedRes, holRes] = await Promise.all([
        restaurantApi.getSettings(),
        adminApi.getSchedule(),
        adminApi.getHolidays(),
      ]);

      const s = settingsRes.data;
      setSettingsForm({
        restaurantName: s.restaurantName || '',
        restaurantAddress: s.restaurantAddress || '',
        whatsappNumber: s.whatsappNumber || '',
        timezone: s.timezone || 'Asia/Kolkata',
        minimumOrderAmount: s.minimumOrderAmount || 0,
        manualOverride: s.manualOverride || 'AUTO',
        overrideExpiryMinutes: 0,
      });

      setSchedules(schedRes.data || []);
      setHolidays(holRes.data || []);
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error('Failed to load restaurant settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateSettings(settingsForm);
      toast.success('Restaurant settings saved!');
      refreshStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const handleSaveSchedules = async () => {
    try {
      await adminApi.updateSchedule(schedules);
      toast.success('Weekly schedule updated!');
      refreshStatus();
    } catch (err) {
      toast.error('Failed to update weekly schedule');
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday.holidayDate) return;
    try {
      await adminApi.addHoliday(newHoliday);
      toast.success('Holiday added!');
      setNewHoliday({ holidayDate: '', description: '' });
      loadAll();
      refreshStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await adminApi.deleteHoliday(id);
      toast.success('Holiday removed');
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      refreshStatus();
    } catch (err) {
      toast.error('Failed to remove holiday');
    }
  };

  const updateScheduleRow = (index, field, value) => {
    setSchedules((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="p-6 sm:p-8 space-y-10 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Restaurant Settings & Hours</h1>
        <p className="text-xs text-gray-500 mt-1">Configure automated open/close hours, WhatsApp routing, and holiday calendar</p>
      </div>

      {/* 1. General Restaurant Profile & Manual Override */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
          <FiSettings className="text-brand-600 text-lg" />
          <h2 className="text-lg font-extrabold text-gray-900">General Information & Overrides</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-700 uppercase tracking-wider block">Restaurant Name *</label>
              <input
                type="text"
                required
                value={settingsForm.restaurantName}
                onChange={(e) => setSettingsForm({ ...settingsForm, restaurantName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 outline-none text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 uppercase tracking-wider block">
                WhatsApp Phone Number * (e.g. 919876543210)
              </label>
              <input
                type="text"
                required
                value={settingsForm.whatsappNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 outline-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700 uppercase tracking-wider block">Physical Address *</label>
            <textarea
              rows={2}
              required
              value={settingsForm.restaurantAddress}
              onChange={(e) => setSettingsForm({ ...settingsForm, restaurantAddress: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-700 uppercase tracking-wider block">Minimum Order Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={settingsForm.minimumOrderAmount}
                onChange={(e) => setSettingsForm({ ...settingsForm, minimumOrderAmount: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-gray-200 outline-none text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 uppercase tracking-wider block">Timezone</label>
              <input
                type="text"
                readOnly
                value={settingsForm.timezone}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm text-gray-600"
              />
            </div>
          </div>

          {/* Manual Open/Close Override */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-start space-x-2">
              <FiAlertCircle className="text-amber-600 text-base shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 block">Manual Open/Close Override</span>
                <span className="text-[11px] text-amber-800">
                  Allows emergency override of the automatic schedule (e.g. kitchen maintenance or private events).
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">Override Mode</label>
                <select
                  value={settingsForm.manualOverride}
                  onChange={(e) => setSettingsForm({ ...settingsForm, manualOverride: e.target.value })}
                  className="w-full p-2 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                >
                  <option value="AUTO">AUTO (Follow Weekly Schedule & Holidays)</option>
                  <option value="FORCE_OPEN">FORCE OPEN (Override schedule to open)</option>
                  <option value="FORCE_CLOSED">FORCE CLOSED (Temporarily close restaurant)</option>
                </select>
              </div>

              {settingsForm.manualOverride !== 'AUTO' && (
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Override Duration</label>
                  <select
                    value={settingsForm.overrideExpiryMinutes}
                    onChange={(e) => setSettingsForm({ ...settingsForm, overrideExpiryMinutes: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                  >
                    <option value={0}>Until manually reset to AUTO</option>
                    <option value={30}>For 30 Minutes</option>
                    <option value={60}>For 1 Hour</option>
                    <option value={120}>For 2 Hours</option>
                    <option value={240}>For 4 Hours</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow transition"
          >
            Save General Settings
          </button>
        </form>
      </div>

      {/* 2. Weekly Operating Schedule */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <FiClock className="text-brand-600 text-lg" />
            <h2 className="text-lg font-extrabold text-gray-900">Weekly Operating Hours</h2>
          </div>
          <button
            onClick={handleSaveSchedules}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1"
          >
            <FiSave />
            <span>Save Hours</span>
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Supports timings crossing midnight (e.g. 12:00 PM to 01:00 AM next day). Orders are strictly blocked outside these active hours.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Opening Time</th>
                <th className="py-3 px-4">Closing Time</th>
                <th className="py-3 px-4">All-Day Closed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedules.map((row, idx) => (
                <tr key={row.dayOfWeek} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-bold text-gray-800">{row.dayOfWeek}</td>
                  <td className="py-3 px-4">
                    <input
                      type="time"
                      disabled={row.closed}
                      value={row.openingTime?.slice(0, 5) || '11:00'}
                      onChange={(e) => updateScheduleRow(idx, 'openingTime', `${e.target.value}:00`)}
                      className="p-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="time"
                      disabled={row.closed}
                      value={row.closingTime?.slice(0, 5) || '23:30'}
                      onChange={(e) => updateScheduleRow(idx, 'closingTime', `${e.target.value}:00`)}
                      className="p-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={row.closed || false}
                        onChange={(e) => updateScheduleRow(idx, 'closed', e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span className="font-semibold text-rose-700">Closed</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Holiday Calendar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
          <FiCalendar className="text-brand-600 text-lg" />
          <h2 className="text-lg font-extrabold text-gray-900">Upcoming Holiday Closures</h2>
        </div>

        {/* Add Holiday Form */}
        <form onSubmit={handleAddHoliday} className="flex flex-col sm:flex-row gap-3 text-xs items-end">
          <div className="w-full sm:w-48 space-y-1">
            <label className="font-bold text-gray-700 uppercase tracking-wider block">Holiday Date *</label>
            <input
              type="date"
              required
              value={newHoliday.holidayDate}
              onChange={(e) => setNewHoliday({ ...newHoliday, holidayDate: e.target.value })}
              className="w-full p-2 rounded-xl border border-gray-200 outline-none text-xs"
            />
          </div>

          <div className="w-full sm:flex-1 space-y-1">
            <label className="font-bold text-gray-700 uppercase tracking-wider block">Description / Reason</label>
            <input
              type="text"
              required
              placeholder="e.g. Diwali Festival Closure"
              value={newHoliday.description}
              onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
              className="w-full p-2 rounded-xl border border-gray-200 outline-none text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow transition flex items-center justify-center space-x-1"
          >
            <FiPlus />
            <span>Add Holiday</span>
          </button>
        </form>

        {/* Holiday List */}
        <div className="space-y-2 pt-2 divide-y divide-gray-100">
          {holidays.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 italic text-center">No upcoming holidays scheduled.</p>
          ) : (
            holidays.map((h) => (
              <div key={h.id} className="pt-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900">{h.holidayDate}</span>
                  <span className="text-gray-500 ml-2">— {h.description}</span>
                </div>
                <button
                  onClick={() => handleDeleteHoliday(h.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
