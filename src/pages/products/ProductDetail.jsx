import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  PencilIcon,
  CubeIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

import { productAPI, formatDate, formatCurrency } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadProduct();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error loading product:', error);

      let message = 'Failed to load product';
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          message = 'Product not found';
        } else if (status >= 500) {
          message = 'Server error. Please try again later.';
        } else {
          message = error.response.data?.message || `Error: ${status}`;
        }
      } else if (error.request) {
        message = 'Network error. Please check your connection.';
      } else {
        message = error.message || 'An unexpected error occurred.';
      }

      toast.error(message);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return <PageLoader />;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Product not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The product you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const profitMargin = product.unitSalePrice && product.unitCostPrice 
    ? ((product.unitSalePrice - product.unitCostPrice) / product.unitCostPrice * 100).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/products')}
            className="btn-secondary"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
          <div>
            <h1 className="page-title">{product.name}</h1>
            <p className="page-subtitle">Product Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/products/${product.id}/edit`}
            className="btn-secondary"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </Link>

        </div>
      </div>

      {/* Product Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">
                Product Information
              </h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Product Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Brand</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.brand}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Stock Status</dt>
                  <dd className="mt-1">
                    <StatusBadge status={product.quantity} type="stock" />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <CubeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {product.quantity} units
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(product.createdTime)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="card mt-6">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">
                Pricing Information
              </h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cost Price</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {formatCurrency(product.unitCostPrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sale Price</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {formatCurrency(product.unitSalePrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">MRP</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <TagIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {formatCurrency(product.mrp)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Profit Margin</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profitMargin}%
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="card-body space-y-3">
              <Link
                to={`/transactions/new?productId=${product.id}`}
                className="btn-primary w-full justify-center"
              >
                Create Sale
              </Link>
              <Link
                to={`/products/${product.id}/edit`}
                className="btn-secondary w-full justify-center"
              >
                Update Stock
              </Link>
              <button className="btn-secondary w-full justify-center">
                View History
              </button>
            </div>
          </div>

          {/* Product Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
            </div>
            <div className="card-body">
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Sold
                  </dt>
                  <dd className="text-sm text-gray-900">0 units</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Revenue Generated
                  </dt>
                  <dd className="text-sm text-gray-900">$0.00</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Last Sold
                  </dt>
                  <dd className="text-sm text-gray-900">Never</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Reorder Level
                  </dt>
                  <dd className="text-sm text-gray-900">10 units</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Inventory Alert */}
          {product.quantity < 10 && (
            <div className="card border-warning-200 bg-warning-50">
              <div className="card-body">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CubeIcon className="h-5 w-5 text-warning-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-warning-800">
                      Low Stock Alert
                    </h3>
                    <p className="mt-1 text-sm text-warning-700">
                      This product is running low on stock. Consider restocking soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default ProductDetail;
