import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import { customerAPI, CUSTOMER_TYPES } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CustomerForm = () => {
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
  } = useForm({
    defaultValues: {
      name: '',
      customerType: CUSTOMER_TYPES.INDIVIDUAL,
      phoneNo: '',
      email: '',
      city: '',
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadCustomer();
    }
  }, [id, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCustomer = async () => {
    try {
      setInitialLoading(true);
      const response = await customerAPI.getById(id);
      const customer = response.data;
      
      // Set form values
      Object.keys(customer).forEach((key) => {
        if (customer[key] !== null && customer[key] !== undefined) {
          setValue(key, customer[key]);
        }
      });
    } catch (error) {
      toast.error('Failed to load customer');
      navigate('/customers');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (isEdit) {
        await customerAPI.update(id, data);
        toast.success('Customer updated successfully');
      } else {
        const response = await customerAPI.create(data);
        toast.success('Customer created successfully');
      }

      navigate('/customers');
    } catch (error) {
      
      
      const message = error.response?.data?.message || error.message || 'Operation failed';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/customers')}
          className="btn-secondary"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        <div>
          <h1 className="page-title">
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </h1>
          <p className="page-subtitle">
            {isEdit ? 'Update customer information' : 'Create a new customer profile'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="form-label">
                  Name <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'border-danger-300' : ''}`}
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Name must not exceed 100 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z\s.'-]+$/,
                      message: 'Name can only contain letters, spaces, dots, apostrophes, and hyphens',
                    },
                  })}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              {/* Customer Type */}
              <div>
                <label className="form-label">Customer Type</label>
                <select
                  className={`form-select ${errors.customerType ? 'border-danger-300' : ''}`}
                  {...register('customerType')}
                >
                  <option value={CUSTOMER_TYPES.INDIVIDUAL}>Individual</option>
                  <option value={CUSTOMER_TYPES.BUSINESS}>Business</option>
                </select>
                {errors.customerType && (
                  <p className="form-error">{errors.customerType.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="form-label">
                  Phone Number <span className="text-danger-500">*</span>
                </label>
                <input
                  type="tel"
                  className={`form-input ${errors.phoneNo ? 'border-danger-300' : ''}`}
                  {...register('phoneNo', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\d{10}$/,
                      message: 'Phone number must be exactly 10 digits',
                    },
                  })}
                />
                {errors.phoneNo && (
                  <p className="form-error">{errors.phoneNo.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="form-label">
                  Email <span className="text-danger-500">*</span>
                </label>
                <input
                  type="email"
                  className={`form-input ${errors.email ? 'border-danger-300' : ''}`}
                  {...register('email', {
                    required: 'Email is required',
                    maxLength: {
                      value: 100,
                      message: 'Email must not exceed 100 characters',
                    },
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              {/* City */}
              <div className="md:col-span-2">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className={`form-input ${errors.city ? 'border-danger-300' : ''}`}
                  {...register('city', {
                    maxLength: {
                      value: 50,
                      message: 'City name must not exceed 50 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z\s.'-]*$/,
                      message: 'City name can only contain letters, spaces, dots, apostrophes, and hyphens',
                    },
                  })}
                />
                {errors.city && (
                  <p className="form-error">{errors.city.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/customers')}
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
                  isEdit ? 'Update Customer' : 'Create Customer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
