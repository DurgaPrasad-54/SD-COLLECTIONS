import React from 'react';
import { FiInbox } from 'react-icons/fi';

function EmptyState({ message = 'Nothing here yet.', icon: Icon = FiInbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 space-y-3">
      <Icon size={56} />
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}

export default EmptyState;
