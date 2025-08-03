import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { productAPI, createSearchCriteria, SEARCH_OPERATIONS, formatDate, formatCurrency } from '../../services/api';
import { LoadingOverlay } from '../../components/common/LoadingSpinner';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ProductList = () => {
  console.log('ProductList component rendered');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, product: null });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    console.log('loadProducts called, hasLoaded:', hasLoaded, 'isLoading:', isLoading);

    // Prevent multiple simultaneous calls
    if (hasLoaded || isLoading) {
      console.log('Skipping loadProducts - already loaded or loading');
      return;
    }

    try {
      setIsLoading(true);
      setLoading(true);
      console.log('Making API call to productAPI.search([])');
      const response = await productAPI.search([]);
      console.log('API call successful, response:', response.data);
      setProducts(response.data);
      setHasLoaded(true);
    } catch (error) {
      console.error('loadProducts error:', error);
      // Only show error toast if it's not a network error (backend not running)
      if (error.code !== 'ERR_NETWORK') {
        toast.error('Failed to load products');
      } else {
        console.warn('Backend server not running. Please start the backend server.');
      }
      console.error('Error loading products:', error);
      setHasLoaded(true); // Prevent infinite retries
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [hasLoaded, isLoading]);

  useEffect(() => {
    console.log('ProductList useEffect triggered, hasLoaded:', hasLoaded, 'isLoading:', isLoading);
    if (!hasLoaded && !isLoading) {
      loadProducts();
    }
  }, [hasLoaded, isLoading, loadProducts]);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      const searchCriteria = [
        createSearchCriteria('name', term, SEARCH_OPERATIONS.CONTAINS),
        createSearchCriteria('brand', term, SEARCH_OPERATIONS.CONTAINS),
        createSearchCriteria('category', term, SEARCH_OPERATIONS.CONTAINS),
      ];
      const response = await productAPI.search(searchCriteria);
      setProducts(response.data);
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    try {
      await productAPI.delete(product.id);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Delete error:', error);
    }
  };

  const openDeleteDialog = (product) => {
    setDeleteDialog({ isOpen: true, product });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, product: null });
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
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search products by name, brand, or category..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <button className="btn-secondary">
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
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
                          <button
                            onClick={() => openDeleteDialog(product)}
                            className="text-danger-600 hover:text-danger-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => handleDelete(deleteDialog.product)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.product?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default ProductList;
