import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import { productAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      brand: '',
      category: '',
      quantity: 0,
      unitSalePrice: 0,
      unitCostPrice: 0,
      mrp: 0,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [id, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProduct = async () => {
    try {
      setInitialLoading(true);
      const response = await productAPI.getById(id);
      const product = response.data;
      
      // Set form values
      Object.keys(product).forEach((key) => {
        if (product[key] !== null && product[key] !== undefined) {
          setValue(key, product[key]);
        }
      });
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Convert string numbers to actual numbers
      const formattedData = {
        ...data,
        quantity: parseInt(data.quantity),
        unitSalePrice: parseFloat(data.unitSalePrice),
        unitCostPrice: parseFloat(data.unitCostPrice),
        mrp: parseFloat(data.mrp),
      };
      
      if (isEdit) {
        await productAPI.update(id, formattedData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(formattedData);
        toast.success('Product created successfully');
      }
      
      navigate('/products');
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const profitMargin = watchedValues.unitSalePrice && watchedValues.unitCostPrice 
    ? ((watchedValues.unitSalePrice - watchedValues.unitCostPrice) / watchedValues.unitCostPrice * 100).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/products')}
          className="btn-secondary"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        <div>
          <h1 className="page-title">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="page-subtitle">
            {isEdit ? 'Update product information' : 'Add a new product to your inventory'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Product Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="form-label">
                  Product Name <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'border-danger-300' : ''}`}
                  {...register('name', {
                    required: 'Product name is required',
                    pattern: {
                      value: /^[^\s]+$/,
                      message: 'Product name cannot contain spaces',
                    },
                    minLength: {
                      value: 2,
                      message: 'Product name must be at least 2 characters',
                    },
                  })}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Product name cannot contain spaces
                </p>
              </div>

              {/* Brand */}
              <div>
                <label className="form-label">
                  Brand <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.brand ? 'border-danger-300' : ''}`}
                  {...register('brand', {
                    required: 'Brand is required',
                  })}
                />
                {errors.brand && (
                  <p className="form-error">{errors.brand.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="form-label">
                  Category <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.category ? 'border-danger-300' : ''}`}
                  {...register('category', {
                    required: 'Category is required',
                  })}
                />
                {errors.category && (
                  <p className="form-error">{errors.category.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="form-label">
                  Quantity <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className={`form-input ${errors.quantity ? 'border-danger-300' : ''}`}
                  {...register('quantity', {
                    required: 'Quantity is required',
                    min: {
                      value: 0,
                      message: 'Quantity must be positive',
                    },
                  })}
                />
                {errors.quantity && (
                  <p className="form-error">{errors.quantity.message}</p>
                )}
              </div>

              {/* Unit Cost Price */}
              <div>
                <label className="form-label">
                  Unit Cost Price <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.unitCostPrice ? 'border-danger-300' : ''}`}
                  {...register('unitCostPrice', {
                    required: 'Unit cost price is required',
                    min: {
                      value: 0,
                      message: 'Unit cost price must be positive',
                    },
                  })}
                />
                {errors.unitCostPrice && (
                  <p className="form-error">{errors.unitCostPrice.message}</p>
                )}
              </div>

              {/* Unit Sale Price */}
              <div>
                <label className="form-label">
                  Unit Sale Price <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.unitSalePrice ? 'border-danger-300' : ''}`}
                  {...register('unitSalePrice', {
                    required: 'Unit sale price is required',
                    min: {
                      value: 0,
                      message: 'Unit sale price must be positive',
                    },
                  })}
                />
                {errors.unitSalePrice && (
                  <p className="form-error">{errors.unitSalePrice.message}</p>
                )}
                {profitMargin > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Profit margin: {profitMargin}%
                  </p>
                )}
              </div>

              {/* MRP */}
              <div className="md:col-span-2">
                <label className="form-label">
                  MRP (Maximum Retail Price) <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.mrp ? 'border-danger-300' : ''}`}
                  {...register('mrp', {
                    required: 'MRP is required',
                    min: {
                      value: 0,
                      message: 'MRP must be positive',
                    },
                  })}
                />
                {errors.mrp && (
                  <p className="form-error">{errors.mrp.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update Product' : 'Create Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
