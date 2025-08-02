import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

import { customerAPI, formatDate } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getById(id);
      setCustomer(response.data);
    } catch (error) {
      toast.error('Failed to load customer');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return <PageLoader />;
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Customer not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The customer you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/customers" className="btn-primary">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/customers')}
            className="btn-secondary"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
          <div>
            <h1 className="page-title">{customer.name}</h1>
            <p className="page-subtitle">Customer Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/customers/${customer.id}/edit`}
            className="btn-secondary"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">
                Customer Information
              </h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1">
                    <StatusBadge status={customer.customerType} type="customer" />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-primary-600 hover:text-primary-500"
                    >
                      {customer.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <a
                      href={`tel:${customer.phoneNo}`}
                      className="text-primary-600 hover:text-primary-500"
                    >
                      {customer.phoneNo}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">City</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {customer.city || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(customer.createdTime)}
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
                to={`/transactions/new?customerId=${customer.id}`}
                className="btn-primary w-full justify-center"
              >
                Create Transaction
              </Link>
              <Link
                to={`/transactions?customerId=${customer.id}`}
                className="btn-secondary w-full justify-center"
              >
                View Transactions
              </Link>
              <button className="btn-secondary w-full justify-center">
                Send Email
              </button>
            </div>
          </div>

          {/* Customer Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
            </div>
            <div className="card-body">
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Transactions
                  </dt>
                  <dd className="text-sm text-gray-900">0</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Spent
                  </dt>
                  <dd className="text-sm text-gray-900">$0.00</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Last Transaction
                  </dt>
                  <dd className="text-sm text-gray-900">Never</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
