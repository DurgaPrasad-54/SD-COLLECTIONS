import React from 'react';
import { FiStar } from 'react-icons/fi';

function Rating({ value = 0, max = 5, onChange, readOnly = false }) {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => !readOnly && onChange && onChange(i + 1)}
            disabled={readOnly}
            className={`focus:outline-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            aria-label={`${i + 1} stars`}
          >
            <FiStar
              size={20}
              className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
              style={{ fill: filled ? 'currentColor' : 'none' }}
            />
          </button>
        );
      })}
      {readOnly && <span className="text-sm text-gray-500 ml-1">({value?.toFixed(1)})</span>}
    </div>
  );
}

export default Rating;
