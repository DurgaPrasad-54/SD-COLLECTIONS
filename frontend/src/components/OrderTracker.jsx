import React from 'react';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const STEPS = [
  { key: 'Pending', label: 'Pending', icon: FiClock },
  { key: 'Processing', label: 'Processing', icon: FiPackage },
  { key: 'Shipped', label: 'Shipped', icon: FiTruck },
  { key: 'Delivered', label: 'Delivered', icon: FiCheckCircle },
];

function OrderTracker({ status }) {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <FiXCircle size={20} />
        <span className="font-medium">Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center space-x-2 overflow-x-auto">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = idx <= currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center min-w-[70px]">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${done ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                <Icon size={18} />
              </div>
              <span className={`text-xs mt-1 text-center ${done ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-1 rounded ${idx < currentIdx ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default OrderTracker;
