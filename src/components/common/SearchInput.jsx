import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchInput = ({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch, debounceMs]);

  const handleClear = () => {
    setSearchTerm('');
  };

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
