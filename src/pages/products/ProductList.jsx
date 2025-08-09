import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { productAPI, createSearchCriteria, SEARCH_OPERATIONS, formatDate, formatCurrency } from '../../services/api';
import { LoadingOverlay } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

import FieldSearchInput from '../../components/common/FieldSearchInput';
import { FilterBuilder } from '../../components/filters';
import { PRODUCT_FILTER_FIELDS, PRODUCT_SEARCH_FIELDS } from '../../config/filterConfigs';

const ProductList = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name'); // Default to name field

  const abortControllerRef = useRef(null);

  // Search field options
  const searchFieldOptions = [
    { value: 'name', label: 'Product Name' },
    { value: 'brand', label: 'Brand' },
    { value: 'category', label: 'Category' }
  ];

  const loadProducts = useCallback(async () => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const response = await productAPI.getAll({
        signal: abortControllerRef.current.signal
      });

      // Check if component is still mounted and request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setProducts(response.data);
      }
    } catch (error) {
      // Don't handle aborted requests
      if (error.name === 'AbortError') {
        return;
      }


      // Only show error toast if it's not a network error (backend not running)
      if (error.code !== 'ERR_NETWORK') {
        toast.error('Failed to load products');
      } else {

      }
    } finally {
      // Always set loading to false, regardless of abort status
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load products when component mounts
    loadProducts();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadProducts]);

  const handleSearch = useCallback(async (term, selectedField, searchCriteria = []) => {
    setSearchTerm(term);

    // Cancel previous search request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for search
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);

      let response;
      const requestConfig = { signal: abortControllerRef.current.signal };

      if (searchCriteria.length > 0) {
        // Advanced filter search
        response = await productAPI.search(searchCriteria, requestConfig);
      } else if (term && term.trim()) {
        // Simple search on selected field only
        const fieldToSearch = selectedField || searchField || 'name';
        const searchCriteriaForField = [
          createSearchCriteria(fieldToSearch, term.trim(), SEARCH_OPERATIONS.CONTAINS)
        ];
        response = await productAPI.search(searchCriteriaForField, requestConfig);
      } else {
        // Load all products
        response = await productAPI.getAll(requestConfig);
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

      toast.error('Search failed: ' + (error.response?.data?.message || error.message));
      
    } finally {
      // Always set loading to false, regardless of abort status
      setLoading(false);
    }
  }, [searchField]);

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

  const handleFilterSearch = (criteria) => {
    handleSearch(searchTerm, searchField, criteria);
  };



  return (
    <div className="space-y-6">
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
          {products.length === 0 ? (
            <EmptyState
              type={searchTerm ? 'search' : 'products'}
              onAction={() => window.location.href = '/products/new'}
            />
          ) : (
            <div className="overflow-hidden">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Product</th>
                    <th className="table-header-cell">Brand</th>
                    <th className="table-header-cell">Category</th>
                    <th className="table-header-cell">Stock</th>
                    <th className="table-header-cell">Price</th>
                    <th className="table-header-cell">MRP</th>
                    <th className="table-header-cell">Created</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
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
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">{product.brand}</div>
                      </td>
                      <td className="table-cell">
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
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(product.mrp)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {formatDate(product.createdTime)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/products/${product.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            to={`/products/${product.id}/edit`}
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

export default ProductList;
