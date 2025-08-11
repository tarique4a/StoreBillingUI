import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { customerAPI, createSearchCriteria, SEARCH_OPERATIONS, formatDate } from '../../services/api';
import { LoadingOverlay } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { FilterBuilder } from '../../components/filters';
import { CUSTOMER_FILTER_FIELDS, CUSTOMER_SEARCH_FIELDS } from '../../config/filterConfigs';
const CustomerList = () => {

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Refs for cleanup and performance
  const abortControllerRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Performance tracking utility
  const trackAPIPerformance = useCallback(async (apiCall, operation) => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      console.log(`${operation} took ${endTime - startTime} milliseconds`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      console.error(`${operation} failed after ${endTime - startTime} milliseconds:`, error);
      throw error;
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (hasLoaded || loading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await trackAPIPerformance(
        () => customerAPI.search([]),
        'loadAllCustomers'
      );
      setCustomers(response.data);
      setHasLoaded(true);
    } catch (error) {
      setError(error);
      // Only show error toast if it's not a network error (backend not running)
      if (error.code !== 'ERR_NETWORK') {
        toast.error('Failed to load customers');
      } else {
        console.warn('Backend server not running - customers will be empty');
      }
      setHasLoaded(true); // Prevent infinite retries
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoaded, loading, trackAPIPerformance]);

  useEffect(() => {
    if (!hasLoaded && !loading) {
      loadCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoaded, loading, loadCustomers]);

  const handleSearch = useCallback(async (term, searchCriteria = []) => {
    setSearchTerm(term);

    // Cancel previous search request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for search
    abortControllerRef.current = new AbortController();

    try {
      // Debounce loading state to prevent flickering
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(true);
      }, 100);

      let response;
      const requestConfig = { signal: abortControllerRef.current.signal };

      if (searchCriteria.length > 0) {
        // Advanced filter search
        response = await trackAPIPerformance(
          () => customerAPI.search(searchCriteria, requestConfig),
          'advancedSearch'
        );
      } else if (term && term.trim()) {
        // Simple search on name field only
        const searchCriteriaForField = [
          createSearchCriteria('name', term.trim(), SEARCH_OPERATIONS.CONTAINS)
        ];
        response = await trackAPIPerformance(
          () => customerAPI.search(searchCriteriaForField, requestConfig),
          'simpleSearch'
        );
      } else {
        // Load all customers
        response = await trackAPIPerformance(
          () => customerAPI.search([], requestConfig),
          'loadAllCustomers'
        );
      }

      setCustomers(response.data);
      setError(null);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Search request was cancelled');
        return;
      }

      setError(error);
      toast.error('Search failed: ' + (error.response?.data?.message || error.message));
    } finally {
      // Clear loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setLoading(false);
    }
  }, [trackAPIPerformance]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear timeouts
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Retry handler for error states
  const handleRetry = useCallback(() => {
    setError(null);
    if (searchTerm || advancedFilters.length > 0) {
      // Retry current search
      let combinedCriteria = [...advancedFilters];
      if (searchTerm && searchTerm.trim()) {
        const nameSearchCriteria = createSearchCriteria('name', searchTerm.trim(), SEARCH_OPERATIONS.CONTAINS);
        combinedCriteria.push(nameSearchCriteria);
      }
      handleSearch(searchTerm, combinedCriteria);
    } else {
      // Retry loading all customers
      setHasLoaded(false);
      loadCustomers();
    }
  }, [searchTerm, advancedFilters, handleSearch, loadCustomers]);

  // Effect to trigger initial load or retry
  useEffect(() => {
    if (!hasLoaded && !loading && !error) {
      loadCustomers();
    }
  }, [loadCustomers, error, hasLoaded, loading, handleRetry]);

  // Debounced search handler
  const handleSimpleSearch = useCallback((term) => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      // Combine simple search with existing advanced filters
      let combinedCriteria = [...advancedFilters];

      if (term && term.trim()) {
        // Add simple search criteria for name field
        const nameSearchCriteria = createSearchCriteria('name', term.trim(), SEARCH_OPERATIONS.CONTAINS);
        combinedCriteria.push(nameSearchCriteria);
      }

      handleSearch(term, combinedCriteria);
    }, 300);
  }, [handleSearch, advancedFilters]);

  const handleFilterSearch = useCallback((term, criteria) => {
    console.log('Filter search called with:', { term, criteria });

    // Update advanced filters state
    setAdvancedFilters(criteria);

    // Combine advanced filters with current simple search term
    let combinedCriteria = [...criteria];

    if (searchTerm && searchTerm.trim()) {
      // Add simple search criteria for name field
      const nameSearchCriteria = createSearchCriteria('name', searchTerm.trim(), SEARCH_OPERATIONS.CONTAINS);
      combinedCriteria.push(nameSearchCriteria);
    }

    handleSearch(term, combinedCriteria);
  }, [handleSearch, searchTerm]);

  // Clear all filters and search
  const handleClearAll = useCallback(() => {
    setAdvancedFilters([]);
    handleSimpleSearch('');
  }, [handleSimpleSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">
            Manage your customer database and relationships
          </p>
        </div>
        <Link to="/customers/new" className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Customer
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card relative overflow-visible">
        <div className="card-body">
          {/* Search and Filter Controls - Side by Side */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6 space-y-4 lg:space-y-0 mb-4">
            {/* Simple Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Customers
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search customers by name"
                  value={searchTerm}
                  onChange={(e) => handleSimpleSearch(e.target.value)}
                />
                {searchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                      onClick={() => handleSimpleSearch('')}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Filters Button */}
            <div className="flex-shrink-0 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advanced Filters
              </label>
              <FilterBuilder
                availableFields={CUSTOMER_FILTER_FIELDS}
                defaultSearchFields={CUSTOMER_SEARCH_FIELDS}
                onSearch={handleFilterSearch}
                searchPlaceholder="Search customers..."
                showSimpleSearch={false}
                showAdvancedFilters={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="card">
        <LoadingOverlay isLoading={loading}>
          {error && !loading ? (
            <EmptyState
              type="error"
              title="Failed to load customers"
              description={error.code === 'ERR_NETWORK'
                ? 'Unable to connect to server. Please check your connection and try again.'
                : 'An error occurred while loading customers. Please try again.'
              }
              onAction={handleRetry}
              actionLabel="Try Again"
            />
          ) : customers.length === 0 ? (
            <EmptyState
              type={searchTerm ? 'search' : 'customers'}
              onAction={() => window.location.href = '/customers/new'}
            />
          ) : (
            <div className="overflow-hidden">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Type</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell">Phone Number</th>
                    <th className="table-header-cell">City</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-700">
                                {customer.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={customer.customerType} type="customer" />
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">{customer.phoneNo}</div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">{customer.city}</div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/customers/${customer.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            to={`/customers/${customer.id}/edit`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </LoadingOverlay>
      </div>
    </div>
  );
};

export default CustomerList;
