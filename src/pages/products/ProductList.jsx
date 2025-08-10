import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  CubeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { productAPI, createSearchCriteria, SEARCH_OPERATIONS, formatDate, formatCurrency } from '../../services/api';
import { LoadingOverlay } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

import FieldSearchInput from '../../components/common/FieldSearchInput';
import { FilterBuilder } from '../../components/filters';
import { PRODUCT_FILTER_FIELDS, PRODUCT_SEARCH_FIELDS } from '../../config/filterConfigs';
import { useRenderPerformance, trackAPIPerformance } from '../../utils/performance';

// Memoized ProductRow component to prevent unnecessary re-renders
const ProductRow = React.memo(({ product }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = `/products/${product.id}`;
    }
  };

  return (
    <tr
      key={product.id}
      className="hover:bg-gray-50 focus:bg-gray-100 cursor-pointer"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => window.location.href = `/products/${product.id}`}
      role="button"
      aria-label={`View details for ${product.name}`}
    >
    <td className="table-cell">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <CubeIcon className="h-6 w-6 text-primary-600" />
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {product.name}
          </div>
          {/* Show brand and category on mobile */}
          <div className="text-xs text-gray-500 sm:hidden">
            {product.brand} • {product.category}
          </div>
        </div>
      </div>
    </td>
    <td className="table-cell hidden sm:table-cell">
      <div className="text-sm text-gray-900">{product.brand}</div>
    </td>
    <td className="table-cell hidden md:table-cell">
      <div className="text-sm text-gray-900">{product.category}</div>
    </td>
    <td className="table-cell">
      <div className="flex items-center">
        <StatusBadge status={product.quantity} type="stock" />
        <span className="ml-2 text-sm text-gray-600">
          ({product.quantity})
        </span>
      </div>
    </td>
    <td className="table-cell">
      <div className="text-sm font-medium text-gray-900">
        {formatCurrency(product.unitSalePrice)}
      </div>
      <div className="text-xs text-gray-500">
        Cost: {formatCurrency(product.unitCostPrice)}
      </div>
    </td>
    <td className="table-cell hidden lg:table-cell">
      <div className="text-sm text-gray-900">
        {formatCurrency(product.mrp)}
      </div>
    </td>
    <td className="table-cell hidden xl:table-cell">
      <div className="text-sm text-gray-900">
        {formatDate(product.createdTime)}
      </div>
    </td>
    <td className="table-cell">
      <div className="flex items-center space-x-2">
        <Link
          to={`/products/${product.id}`}
          className="text-primary-600 hover:text-primary-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          title="View product details"
          aria-label={`View details for ${product.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <EyeIcon className="h-5 w-5" />
        </Link>
        <Link
          to={`/products/${product.id}/edit`}
          className="text-gray-600 hover:text-gray-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
          title="Edit product"
          aria-label={`Edit ${product.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <PencilIcon className="h-5 w-5" />
        </Link>
      </div>
    </td>
  </tr>
  );
});

ProductRow.displayName = 'ProductRow';

const ProductList = () => {
  // Performance tracking
  const { renderCount } = useRenderPerformance('ProductList');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name'); // Default to name field
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const abortControllerRef = useRef(null);
  const loadingTimeoutRef = useRef(null);

  // Memoized search field options to prevent unnecessary re-renders
  const searchFieldOptions = useMemo(() => [
    { value: 'name', label: 'Product Name' },
    { value: 'brand', label: 'Brand' },
    { value: 'category', label: 'Category' }
  ], []);

  const loadProducts = useCallback(async () => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Debounce loading state to prevent flickering
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(true);
      }, 100);

      const response = await trackAPIPerformance(
        () => productAPI.getAll({
          signal: abortControllerRef.current.signal
        }),
        'loadProducts'
      );

      // Check if component is still mounted and request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setProducts(response.data);
      }
    } catch (error) {
      // Don't handle aborted requests
      if (error.name === 'AbortError') {
        return;
      }

      console.error('Error loading products:', error);
      setError(error);

      // Auto-retry for network errors (up to 3 times)
      if (error.code === 'ERR_NETWORK' && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadProducts();
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        // Show error toast for other errors or after max retries
        const message = error.code === 'ERR_NETWORK'
          ? 'Unable to connect to server. Please check your connection.'
          : 'Failed to load products';
        toast.error(message);
      }
    } finally {
      // Clear loading timeout and set loading to false
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setLoading(false);
    }
  }, []); // No dependencies needed as this function doesn't use any state or props

  const handleRetry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    // Load products when component mounts
    loadProducts();

    // Add offline/online event listeners
    const handleOnline = () => {
      setIsOffline(false);
      if (error && error.code === 'ERR_NETWORK') {
        handleRetry();
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadProducts, error, handleRetry]);

  const handleSearch = useCallback(async (term, selectedField, searchCriteria = []) => {
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
          () => productAPI.search(searchCriteria, requestConfig),
          'advancedSearch'
        );
      } else if (term && term.trim()) {
        // Simple search on selected field only
        const fieldToSearch = selectedField || 'name'; // Use selectedField directly instead of state
        const searchCriteriaForField = [
          createSearchCriteria(fieldToSearch, term.trim(), SEARCH_OPERATIONS.CONTAINS)
        ];
        response = await trackAPIPerformance(
          () => productAPI.search(searchCriteriaForField, requestConfig),
          'simpleSearch'
        );
      } else {
        // Load all products
        response = await trackAPIPerformance(
          () => productAPI.getAll(requestConfig),
          'loadAllProducts'
        );
      }

      // Check if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setProducts(response.data);
      }
    } catch (error) {
      // Don't handle aborted requests
      if (error.name === 'AbortError') {
        return;
      }

      console.error('Error searching products:', error);

      // Handle different types of errors
      let message = 'Search failed';
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          message = data?.message || 'Invalid search criteria.';
        } else if (status >= 500) {
          message = 'Server error. Please try again later.';
        } else {
          message = data?.message || `Search failed: ${status}`;
        }
      } else if (error.request) {
        message = 'Network error. Please check your connection.';
      } else {
        message = error.message || 'An unexpected error occurred.';
      }

      toast.error(message);

    } finally {
      // Clear loading timeout and set loading to false
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setLoading(false);
    }
  }, []); // Remove searchField dependency to prevent unnecessary re-renders

  const handleFieldSearchInput = useCallback((term, field) => {
    handleSearch(term, field);
  }, [handleSearch]);

  const handleFieldChange = useCallback((field) => {
    setSearchField(field);
    // Re-trigger search with new field if there's a current search term
    if (searchTerm) {
      handleSearch(searchTerm, field);
    }
  }, [searchTerm, handleSearch]);

  const handleFilterSearch = useCallback((term, criteria) => {
    console.log('Filter search called with:', { term, criteria });
    handleSearch(term, searchField, criteria);
  }, [handleSearch, searchField]);



  return (
    <div className="space-y-6">
      {/* Offline Indicator */}
      {isOffline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                You're currently offline. Some features may not be available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">
            Manage your product inventory and catalog
          </p>
        </div>
        <Link to="/products/new" className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body space-y-4">
          {/* Simple Search with Field Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <FieldSearchInput
              placeholder="Search products"
              onSearch={handleFieldSearchInput}
              value={searchTerm}
              searchField={searchField}
              onFieldChange={handleFieldChange}
              searchFields={searchFieldOptions}
              defaultField="name"
              className="w-full max-w-md"
            />
          </div>

          {/* Advanced Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Advanced Filters
            </label>
            <FilterBuilder
              availableFields={PRODUCT_FILTER_FIELDS}
              defaultSearchFields={PRODUCT_SEARCH_FIELDS}
              onSearch={handleFilterSearch}
              searchPlaceholder="Search products..."
              showSimpleSearch={false}
              showAdvancedFilters={true}
            />
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="card">
        <LoadingOverlay isLoading={loading}>
          {error && !loading ? (
            <EmptyState
              type="error"
              title="Failed to load products"
              description={error.code === 'ERR_NETWORK'
                ? 'Unable to connect to server. Please check your connection and try again.'
                : 'An error occurred while loading products. Please try again.'
              }
              actionText="Retry"
              onAction={handleRetry}
            />
          ) : !loading && products.length === 0 ? (
            <EmptyState
              type={searchTerm ? 'search' : 'products'}
              onAction={() => window.location.href = '/products/new'}
            />
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Product</th>
                    <th className="table-header-cell hidden sm:table-cell">Brand</th>
                    <th className="table-header-cell hidden md:table-cell">Category</th>
                    <th className="table-header-cell">Stock</th>
                    <th className="table-header-cell">Price</th>
                    <th className="table-header-cell hidden lg:table-cell">MRP</th>
                    <th className="table-header-cell hidden xl:table-cell">Created</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {products.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </LoadingOverlay>
      </div>


    </div>
  );
};

export default ProductList;
