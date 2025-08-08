import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchInput = ({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className = '',
  value = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Update internal state when external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onSearch(searchTerm);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [searchTerm, onSearch, debounceMs]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="form-input pl-10 pr-10"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={handleClear}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
