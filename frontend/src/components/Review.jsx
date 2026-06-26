import React from 'react';
import Rating from './Rating';

function Review({ review }) {
  const { user, rating, comment, createdAt } = review;
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{user?.name || 'Anonymous'}</p>
          <p className="text-xs text-gray-400">{new Date(createdAt).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto">
          <Rating value={rating} readOnly />
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{comment}</p>
    </div>
  );
}

export default Review;
