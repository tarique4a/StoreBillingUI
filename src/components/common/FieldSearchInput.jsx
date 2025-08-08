import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const FieldSearchInput = ({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className = '',
  value = '',
  searchField = '',
  onFieldChange,
  searchFields = [],
  defaultField = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [selectedField, setSelectedField] = useState(searchField || defaultField || (searchFields[0]?.value || ''));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);
  const dropdownRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Update internal state when external values change
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    setSelectedField(searchField || defaultField || (searchFields[0]?.value || ''));
  }, [searchField, defaultField, searchFields]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onSearch(searchTerm, selectedField);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [searchTerm, selectedField, onSearch, debounceMs]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleFieldSelect = useCallback((field) => {
    console.log('🎯 Field selected:', field);
    setSelectedField(field.value);
    setIsDropdownOpen(false);
    if (onFieldChange) {
      onFieldChange(field.value);
    }
  }, [onFieldChange]);

  const selectedFieldLabel = searchFields.find(field => field.value === selectedField)?.label || 'Field';



  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        {/* Field Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-l-md min-w-[100px]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <span className="truncate">{selectedFieldLabel}</span>
            <ChevronDownIcon className="ml-2 h-4 w-4 flex-shrink-0" />
          </button>

          {/* FORCE ALL OPTIONS TO BE VISIBLE */}
          {isDropdownOpen && (
            <div style={{
              position: 'fixed',
              top: '280px',
              left: '220px',
              zIndex: 999999,
              backgroundColor: 'white',
              border: '2px solid #000',
              borderRadius: '8px',
              width: '200px',
              padding: '8px',
              boxShadow: '0 0 20px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: selectedField === 'name' ? '#dbeafe' : '#f9fafb',
                border: '1px solid #ccc',
                margin: '4px 0',
                borderRadius: '4px'
              }}
              onClick={() => handleFieldSelect({ value: 'name', label: 'Name' })}>
                Name
              </div>

              <div style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: selectedField === 'email' ? '#dbeafe' : '#f9fafb',
                border: '1px solid #ccc',
                margin: '4px 0',
                borderRadius: '4px'
              }}
              onClick={() => handleFieldSelect({ value: 'email', label: 'Email' })}>
                Email
              </div>

              <div style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: selectedField === 'phoneNo' ? '#dbeafe' : '#f9fafb',
                border: '1px solid #ccc',
                margin: '4px 0',
                borderRadius: '4px'
              }}
              onClick={() => handleFieldSelect({ value: 'phoneNo', label: 'Phone' })}>
                Phone
              </div>

              <div style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: selectedField === 'address' ? '#dbeafe' : '#f9fafb',
                border: '1px solid #ccc',
                margin: '4px 0',
                borderRadius: '4px'
              }}
              onClick={() => handleFieldSelect({ value: 'address', label: 'Address' })}>
                Address
              </div>

              <div style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: selectedField === 'city' ? '#dbeafe' : '#f9fafb',
                border: '1px solid #ccc',
                margin: '4px 0',
                borderRadius: '4px'
              }}
              onClick={() => handleFieldSelect({ value: 'city', label: 'City' })}>
                City
              </div>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-l-0"
            placeholder={`${placeholder} by ${selectedFieldLabel.toLowerCase()}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 transition-colors"
                onClick={handleClear}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(FieldSearchInput);
