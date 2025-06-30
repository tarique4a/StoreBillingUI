import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { customerAPI, createSearchCriteria, SEARCH_OPERATIONS, formatDate } from '../../services/api';
import { LoadingOverlay } from '../../components/common/LoadingSpinner';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, customer: null });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      // Since there's no getAll endpoint, we'll search with empty criteria
      const response = await customerAPI.search([]);
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (customer) => {
    try {
      await customerAPI.delete(customer.id);
      toast.success('Customer deleted successfully');
      loadCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
      console.error('Delete error:', error);
    }
  };

  const openDeleteDialog = (customer) => {
    setDeleteDialog({ isOpen: true, customer });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, customer: null });
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
                          <button
                            onClick={() => openDeleteDialog(customer)}
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
        onConfirm={() => handleDelete(deleteDialog.customer)}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteDialog.customer?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default CustomerList;
