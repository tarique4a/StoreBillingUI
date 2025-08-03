import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { customerAPI, createSearchCriteria, SEARCH_OPERATIONS, formatDate } from '../../services/api';
import { LoadingOverlay } from '../../components/common/LoadingSpinner';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
const CustomerList = () => {
  console.log('CustomerList component rendered');

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadCustomers = useCallback(async () => {
    console.log('loadCustomers called, hasLoaded:', hasLoaded, 'isLoading:', isLoading);

    // Prevent multiple simultaneous calls
    if (hasLoaded || isLoading) {
      console.log('Skipping loadCustomers - already loaded or loading');
      return;
    }

    try {
      setIsLoading(true);
      setLoading(true);
      // Since there's no getAll endpoint, we'll search with empty criteria
      console.log('Making API call to customerAPI.search([])');
      const response = await customerAPI.search([]);
      console.log('API call successful, response:', response.data);
      setCustomers(response.data);
      setHasLoaded(true);
    } catch (error) {
      console.error('loadCustomers error:', error);
      // Only show error toast if it's not a network error (backend not running)
      if (error.code !== 'ERR_NETWORK') {
        toast.error('Failed to load customers');
      } else {
        console.warn('Backend server not running. Please start the backend server.');
      }
      console.error('Error loading customers:', error);
      setHasLoaded(true); // Prevent infinite retries
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [hasLoaded, isLoading]);

  useEffect(() => {
    console.log('CustomerList useEffect triggered, hasLoaded:', hasLoaded, 'isLoading:', isLoading);
    if (!hasLoaded && !isLoading) {
      loadCustomers();
    }
  }, [hasLoaded, isLoading, loadCustomers]);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      loadCustomers();
      return;
    }

    try {
      setLoading(true);
      const searchCriteria = [
        createSearchCriteria('name', term, SEARCH_OPERATIONS.CONTAINS),
        createSearchCriteria('email', term, SEARCH_OPERATIONS.CONTAINS),
        createSearchCriteria('phoneNo', term, SEARCH_OPERATIONS.CONTAINS),
      ];
      const response = await customerAPI.search(searchCriteria);
      setCustomers(response.data);
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };



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
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search customers by name, email, or phone..."
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

      {/* Customer List */}
      <div className="card">
        <LoadingOverlay isLoading={loading}>
          {customers.length === 0 ? (
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
                    <th className="table-header-cell">Contact</th>
                    <th className="table-header-cell">City</th>
                    <th className="table-header-cell">Created</th>
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
                        <div className="text-sm text-gray-500">{customer.phoneNo}</div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">{customer.city}</div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {formatDate(customer.createdTime)}
                        </div>
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
