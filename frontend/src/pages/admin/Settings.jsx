import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import { FiMoon, FiSun, FiGlobe, FiShield } from 'react-icons/fi';

function Settings() {
  const dispatch = useDispatch();
  const { mode } = useSelector((s) => s.theme);
  const { user } = useSelector((s) => s.auth);

  return (
    <>
      <Helmet><title>Settings – SD COLLECTIONS Admin</title></Helmet>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            {mode === 'dark' ? <FiMoon className="text-blue-600" /> : <FiSun className="text-yellow-500" />}
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</p>
              <p className="text-xs text-gray-400">Toggle between light and dark theme</p>
            </div>
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mode === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}
              aria-label="Toggle dark mode"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mode === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <FiGlobe className="text-blue-600" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Store Information</h2>
          </div>
          <div className="space-y-3 text-sm">
            {[
              ['Store Name', 'SD COLLECTIONS'],
              ['Store Email', 'support@sdcollections.com'],
              ['Support Phone', '+91 98765 43210'],
              ['Currency', 'INR (₹)'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <FiShield className="text-purple-600" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Admin Account</h2>
          </div>
          <div className="space-y-3 text-sm">
            {[
              ['Name', user?.name || '—'],
              ['Email', user?.email || '—'],
              ['Role', user?.role || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
