import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiBarChart2, FiPackage, FiList, FiShoppingBag, FiUser, FiTag, FiImage, FiSettings } from 'react-icons/fi';


function Sidebar({ mobileMode, onLinkClick }) {
  const linkClass = ({ isActive }) =>
    `flex items-center space-x-2 px-4 py-2 rounded-md text-sm ${isActive ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800'}`;

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <FiBarChart2 /> },
    { to: '/admin/products', label: 'Products', icon: <FiPackage /> },
    { to: '/admin/categories', label: 'Categories', icon: <FiList /> },
    { to: '/admin/orders', label: 'Orders', icon: <FiShoppingBag /> },
    { to: '/admin/users', label: 'Users', icon: <FiUser /> },
    { to: '/admin/coupons', label: 'Coupons', icon: <FiTag /> },
    { to: '/admin/banners', label: 'Banners', icon: <FiImage /> },
    { to: '/admin/settings', label: 'Settings', icon: <FiSettings /> },
  ];

  return (
    <aside className={`h-full ${mobileMode ? 'p-4' : 'w-64 border-r border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900'}`}>
      {!mobileMode && (
        <div className="mb-6 px-4">
          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-500">
            SD COLLECTIONS
          </span>
        </div>
      )}
      <nav className="space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={linkClass}
            onClick={onLinkClick}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
