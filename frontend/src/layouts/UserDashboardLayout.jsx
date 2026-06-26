import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { LuUser, LuMapPin, LuShoppingBag, LuHeart, LuLogOut } from 'react-icons/lu';

function UserDashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/profile', icon: LuUser, end: true },
    { label: 'My Orders', to: '/orders', icon: LuShoppingBag },
    { label: 'Address Book', to: '/addresses', icon: LuMapPin },
    { label: 'Wishlist', to: '/wishlist', icon: LuHeart },
  ];

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100'
    }`;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[12px] p-3 shadow-sm">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={getNavLinkClass}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <LuLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white dark:bg-gray-800 min-h-[60vh] rounded-[12px] border border-gray-100 dark:border-gray-700 p-6 lg:p-8 shadow-sm text-gray-800 dark:text-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserDashboardLayout;
