import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

function AdminLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden relative">
      {/* Desktop Sidebar (static, no collapse) */}
      <div className="hidden lg:block w-64 h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar (Drawer Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer content */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-white dark:bg-gray-900 shadow-xl z-10">
            {/* Close button at the top of drawer */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <span className="font-semibold text-gray-800 dark:text-gray-100">SD COLLECTIONS</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto">
              <Sidebar mobileMode={true} onLinkClick={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiMenu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4 relative">
            {/* Profile Dropdown Trigger */}
            <div
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name || 'Admin'}</span>
            </div>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <>
                {/* Invisible backdrop to close on click outside */}
                <div onClick={() => setProfileMenuOpen(false)} className="fixed inset-0 z-40" />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-150 dark:border-gray-700 py-1 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 sm:hidden">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{user?.name || 'Admin'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center space-x-2"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
