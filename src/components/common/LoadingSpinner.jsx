import React, { memo } from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`}></div>
  );
};

export const LoadingOverlay = memo(({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
});

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default memo(LoadingSpinner);
