import React from 'react';

function LoadingSpinner({ size = 40, color = '#4F46E5' }) {
  return (
    <div className="flex justify-center items-center py-4">
      <svg
        className="animate-spin"
        style={{ width: size, height: size, color }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.415, 31.415"
          transform="rotate(90 12 12)"
        />
      </svg>
    </div>
  );
}

export default LoadingSpinner;
