import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  FunnelIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import FilterGroup from './FilterGroup';
import SearchInput from '../common/SearchInput';
import { createSearchCriteria } from '../../services/api';

// Generate unique IDs more efficiently
let idCounter = 0;
const generateId = () => `filter_${++idCounter}_${Date.now()}`;

const FilterBuilder = ({
  availableFields = [],
  defaultSearchFields = [],
  onSearch,
  searchPlaceholder = "Search...",
  showSimpleSearch = true,
  showAdvancedFilters = true,
  className = ""
}) => {
  const [showAdvanced, setShowAdvanced] = useState(!showSimpleSearch);
  const [userClosedAdvanced, setUserClosedAdvanced] = useState(false);
  const [filterGroups, setFilterGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Create initial filter group - memoized to prevent recreation
  const createInitialGroup = useCallback(() => ({
    id: generateId(),
    logic: 'AND',
    conditions: [{
      id: generateId(),
      field: '',
      operator: '',
      value: ''
    }]
  }), []);

  // Auto-add initial filter group when advanced filters are shown by default
  React.useEffect(() => {
    if (!showSimpleSearch && showAdvancedFilters && filterGroups.length === 0 && !userClosedAdvanced) {
      setFilterGroups([createInitialGroup()]);
    }
  }, [showSimpleSearch, showAdvancedFilters, filterGroups.length, createInitialGroup, userClosedAdvanced]);

  const addFilterGroup = useCallback(() => {
    setFilterGroups(prev => [...prev, createInitialGroup()]);
  }, [createInitialGroup]);

  const updateFilterGroup = useCallback((groupId, updatedGroup) => {
    setFilterGroups(prev =>
      prev.map(group => group.id === groupId ? updatedGroup : group)
    );
  }, []);

  const removeFilterGroup = useCallback((groupId) => {
    setFilterGroups(prev => prev.filter(group => group.id !== groupId));
  }, []);

  // Convert filter groups to search criteria
  const convertToSearchCriteria = useCallback(() => {
    const criteria = [];

    console.log('Converting filter groups to criteria:', filterGroups);

    filterGroups.forEach(group => {
      group.conditions.forEach(condition => {
        console.log('Processing condition:', condition);
        if (condition.field && condition.operator && condition.value) {
          const searchCriteria = createSearchCriteria(
            condition.field,
            condition.value,
            condition.operator
          );
          console.log('Created search criteria:', searchCriteria);
          criteria.push(searchCriteria);
        } else {
          console.log('Condition incomplete:', {
            field: condition.field,
            operator: condition.operator,
            value: condition.value
          });
        }
      });
    });

    console.log('Final criteria array:', criteria);
    return criteria;
  }, [filterGroups]);

  // Handle simple search
  const handleSimpleSearch = useCallback((term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      onSearch('', []);
      return;
    }

    // Create search criteria for default fields
    const searchCriteria = defaultSearchFields.map(field =>
      createSearchCriteria(field, term.trim(), 'CONTAINS')
    );
    
    onSearch(term, searchCriteria);
  }, [defaultSearchFields, onSearch]);

  // Handle advanced filter search
  const handleAdvancedSearch = useCallback(() => {
    console.log('Apply Filters button clicked!');
    const searchCriteria = convertToSearchCriteria();
    console.log('Advanced search criteria:', searchCriteria);
    console.log('Calling onSearch with:', { term: '', criteria: searchCriteria });
    onSearch('', searchCriteria);

    // Close the advanced filters panel after applying filters
    if (!showSimpleSearch) {
      setShowAdvanced(false);
      setUserClosedAdvanced(true);
    }
  }, [convertToSearchCriteria, onSearch, showSimpleSearch]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterGroups([]);
    setSearchTerm('');
    onSearch('', []);
  }, [onSearch]);

  // Check if there are active filters - memoized for performance
  const hasActiveFilters = useMemo(() =>
    filterGroups.length > 0 || searchTerm.trim().length > 0,
    [filterGroups.length, searchTerm]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Simple Search */}
      {showSimpleSearch && (
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <SearchInput
              placeholder={searchPlaceholder}
              onSearch={handleSimpleSearch}
              value={searchTerm}
            />
          </div>
          
          {showAdvancedFilters && (
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-md transition-colors ${
                showAdvanced || filterGroups.length > 0
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              <span className="text-sm">Filters</span>
              {filterGroups.length > 0 && (
                <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                  {filterGroups.length}
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* Filters Toggle for when simple search is disabled */}
      {!showSimpleSearch && showAdvancedFilters && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setShowAdvanced(!showAdvanced);
              setUserClosedAdvanced(false);
            }}
            className={`flex items-center space-x-2 px-3 py-2 border rounded-md transition-colors ${
              showAdvanced || filterGroups.length > 0
                ? 'border-primary-500 text-primary-600 bg-primary-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            <span className="text-sm">Advanced Filters</span>
            {filterGroups.length > 0 && (
              <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {filterGroups.length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {(showAdvanced || (!showSimpleSearch && !userClosedAdvanced)) && showAdvancedFilters && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
            <button
              type="button"
              onClick={() => {
                setShowAdvanced(false);
                setUserClosedAdvanced(true);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Filter Groups */}
          <div className="space-y-4">
            {filterGroups.map((group, index) => (
              <div key={group.id}>
                {index > 0 && (
                  <div className="flex justify-center py-2">
                    <span className="px-3 py-1 bg-gray-200 text-sm font-medium text-gray-700 rounded">
                      AND
                    </span>
                  </div>
                )}
                <FilterGroup
                  group={group}
                  availableFields={availableFields}
                  onChange={(updatedGroup) => updateFilterGroup(group.id, updatedGroup)}
                  onRemove={() => removeFilterGroup(group.id)}
                  showRemove={filterGroups.length > 1}
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={addFilterGroup}
              className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add filter group</span>
            </button>

            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={handleAdvancedSearch}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initialize with one filter group when advanced is first opened */}
      {showAdvanced && filterGroups.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No filters added yet</p>
          <button
            type="button"
            onClick={addFilterGroup}
            className="flex items-center space-x-2 mx-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add your first filter</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(FilterBuilder);
