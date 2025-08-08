import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  EyeIcon,
  CreditCardIcon,
  ArrowUturnLeftIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { transactionAPI, createSearchCriteria, SEARCH_OPERATIONS, formatDate, formatCurrency, TRANSACTION_STATUS } from '../../services/api';
import { LoadingOverlay } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import FieldSearchInput from '../../components/common/FieldSearchInput';
import { FilterBuilder } from '../../components/filters';
import { TRANSACTION_FILTER_FIELDS, TRANSACTION_SEARCH_FIELDS } from '../../config/filterConfigs';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('transactionId'); // Default to transaction ID
  const [hasLoaded, setHasLoaded] = useState(false);
  const abortControllerRef = useRef(null);

  // Search field options
  const searchFieldOptions = [
    { value: 'transactionId', label: 'Transaction ID' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'status', label: 'Status' },
    { value: 'paymentMethod', label: 'Payment Method' }
  ];

  useEffect(() => {
    if (!hasLoaded && !loading) {
      loadTransactions();
    }
  }, [hasLoaded, loading]);

  const loadTransactions = async () => {
    // Prevent multiple simultaneous calls
    if (hasLoaded || loading) {
      return;
    }

    try {
      setLoading(true);
      const response = await transactionAPI.search([]);
      setTransactions(response.data);
      setHasLoaded(true);
    } catch (error) {
      
      // Only show error toast if it's not a network error (backend not running)
      if (error.code !== 'ERR_NETWORK') {
        toast.error('Failed to load transactions');
      } else {
        
      }
      setHasLoaded(true); // Prevent infinite retries
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term, searchCriteria = []) => {
    setSearchTerm(term);

    try {
      setLoading(true);

      let response;
      if (searchCriteria.length > 0) {
        // Advanced filter search
        response = await transactionAPI.search(searchCriteria);
      } else if (term && term.trim()) {
        // Simple search across default fields
        const defaultCriteria = TRANSACTION_SEARCH_FIELDS.map(field =>
          createSearchCriteria(field, term.trim(), SEARCH_OPERATIONS.CONTAINS)
        );
        response = await transactionAPI.search(defaultCriteria);
      } else {
        // Load all transactions
        response = await transactionAPI.search([]);
      }

      setTransactions(response.data);
    } catch (error) {
      toast.error('Search failed');
      
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            Manage sales transactions and billing
          </p>
        </div>
        <Link to="/transactions/new" className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Transaction
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <p className="text-lg font-semibold text-gray-900">$0.00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-success-600">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-lg font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-warning-600">⏳</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-lg font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-danger-100 rounded-lg flex items-center justify-center">
                  <ArrowUturnLeftIcon className="h-5 w-5 text-danger-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Returns</p>
                <p className="text-lg font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <FilterBuilder
            availableFields={TRANSACTION_FILTER_FIELDS}
            defaultSearchFields={TRANSACTION_SEARCH_FIELDS}
            onSearch={handleSearch}
            searchPlaceholder="Search transactions by customer, ID, or amount..."
            showSimpleSearch={true}
            showAdvancedFilters={true}
          />
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        <LoadingOverlay isLoading={loading}>
          {transactions.length === 0 ? (
            <EmptyState
              type={searchTerm ? 'search' : 'transactions'}
              onAction={() => window.location.href = '/transactions/new'}
            />
          ) : (
            <div className="overflow-hidden">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Transaction ID</th>
                    <th className="table-header-cell">Customer</th>
                    <th className="table-header-cell">Items</th>
                    <th className="table-header-cell">Total Amount</th>
                    <th className="table-header-cell">Paid Amount</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Date</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="text-sm font-medium text-gray-900">
                          #{transaction.id.slice(-8)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {transaction.customerName || 'Unknown Customer'}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {transaction.productTransactionDetails?.length || 0} items
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.totalAmount)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(transaction.totalPaidAmount || 0)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={transaction.transactionStatus} type="transaction" />
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {formatDate(transaction.createdTime)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/transactions/${transaction.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          {transaction.transactionStatus !== TRANSACTION_STATUS.CLOSED && (
                            <Link
                              to={`/transactions/${transaction.id}/pay`}
                              className="text-success-600 hover:text-success-900"
                              title="Process Payment"
                            >
                              <CreditCardIcon className="h-5 w-5" />
                            </Link>
                          )}
                          {(transaction.transactionStatus === TRANSACTION_STATUS.CREATED ||
                            transaction.transactionStatus === TRANSACTION_STATUS.PARTIAL_PAID ||
                            transaction.transactionStatus === TRANSACTION_STATUS.CLOSED) && (
                            <Link
                              to={`/invoices/create?transactionId=${transaction.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Create Invoice"
                            >
                              <DocumentTextIcon className="h-5 w-5" />
                            </Link>
                          )}
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

export default TransactionList;
