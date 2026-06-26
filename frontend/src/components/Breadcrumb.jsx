import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

function Breadcrumb({ crumbs }) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mb-4" aria-label="Breadcrumb">
      {crumbs.map((crumb, idx) => (
        <span key={idx} className="flex items-center space-x-1">
          {idx > 0 && <FiChevronRight size={14} />}
          {crumb.to ? (
            <Link to={crumb.to} className="hover:text-blue-600 transition-colors">{crumb.label}</Link>
          ) : (
            <span className="text-gray-800 dark:text-gray-100 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumb;
