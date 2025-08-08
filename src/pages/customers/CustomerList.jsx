import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { customerAPI, createSearchCriteria, SEARCH_OPERATIONS, formatDate } from '../../services/api';
import { LoadingOverlay } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import FieldSearchInput from '../../components/common/FieldSearchInput';
import { FilterBuilder } from '../../components/filters';
import { CUSTOMER_FILTER_FIELDS } from '../../config/filterConfigs';
const CustomerList = () => {

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name'); // Default to name field
  const [hasLoaded, setHasLoaded] = useState(false);

  // Search field options
  const searchFieldOptions = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'phoneNo', label: 'Phone' },
    { value: 'address', label: 'Address' },
    { value: 'city', label: 'City' }
  ];

  const loadCustomers = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (hasLoaded || loading) {
      return;
    }

    try {
      setLoading(true);
      const response = await customerAPI.search([]);
      setCustomers(response.data);
      setHasLoaded(true);
    } catch (error) {
      
      // Only show error toast if it's not a network error (backend not running)
      if (error.code !== 'ERR_NETWORK') {
        toast.error('Failed to load customers');
      } else {
        
      }
      setHasLoaded(true); // Prevent infinite retries
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoaded, loading]);

  useEffect(() => {
    if (!hasLoaded && !loading) {
      loadCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoaded, loading, loadCustomers]);

  const handleSearch = useCallback(async (term, selectedField, searchCriteria = []) => {

    setSearchTerm(term);

    try {
      
      setLoading(true);

      let response;

      if (searchCriteria.length > 0) {
        // Advanced filter search

        response = await customerAPI.search(searchCriteria);
      } else if (term && term.trim()) {
        // Simple search on selected field only
        const fieldToSearch = selectedField || searchField || 'name';
        const searchCriteriaForField = [
          createSearchCriteria(fieldToSearch, term.trim(), SEARCH_OPERATIONS.CONTAINS)
        ];

        response = await customerAPI.search(searchCriteriaForField);
      } else {
        // Load all customers

        response = await customerAPI.search([]);
      }

      
      setCustomers(response.data);

    } catch (error) {
      
      toast.error('Search failed: ' + (error.response?.data?.message || error.message));
    } finally {
      
      setLoading(false);
    }
  }, [searchField]);

  const handleFieldSearchInput = useCallback((term, field) => {
    handleSearch(term, field, []);
  }, [handleSearch]);

  const handleFieldChange = useCallback((field) => {
    setSearchField(field);
  }, []);

  const handleFilterSearch = useCallback((criteria) => {
    handleSearch('', searchField, criteria);
  }, [handleSearch, searchField]);

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
        <div className="card-body space-y-4">
          {/* Simple Search with Field Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Customers
            </label>
            <FieldSearchInput
              placeholder="Search customers"
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
              availableFields={CUSTOMER_FILTER_FIELDS}
              onSearch={handleFilterSearch}
              showSimpleSearch={false}
              showAdvancedFilters={true}
            />
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
