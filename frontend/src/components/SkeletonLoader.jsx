import React from 'react';

export default function SkeletonLoader({ type = 'text', width = '100%', height = '1rem' }) {
  const baseClass = 'bg-gray-300 dark:bg-gray-600 animate-pulse rounded';
  if (type === 'text') {
    return <div className={baseClass} style={{ width, height }} />;
  }
  if (type === 'avatar') {
    return <div className={`${baseClass} rounded-full`} style={{ width, height }} />;
  }
  // generic rectangle
  return <div className={baseClass} style={{ width, height }} />;
}
