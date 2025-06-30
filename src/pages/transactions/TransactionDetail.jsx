import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  CreditCardIcon,
  PrinterIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';

import { transactionAPI, formatDate, formatCurrency } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaction();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getById(id);
      setTransaction(response.data);
    } catch (error) {
      toast.error('Failed to load transaction');
      navigate('/transactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Transaction not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The transaction you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/transactions" className="btn-primary">
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const remainingAmount = transaction.totalAmount - (transaction.totalPaidAmount || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/transactions')}
            className="btn-secondary"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
          <div>
            <h1 className="page-title">Transaction #{transaction.id.slice(-8)}</h1>
            <p className="page-subtitle">Transaction Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print
          </button>
          {remainingAmount > 0 && (
            <Link
              to={`/transactions/${transaction.id}/pay`}
              className="btn-primary"
            >
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Process Payment
            </Link>
          )}
        </div>
      </div>

      {/* Transaction Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">
                Transaction Information
              </h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">#{transaction.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge status={transaction.transactionStatus} type="transaction" />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{transaction.customerId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(transaction.createdTime)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Product Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Products</h2>
            </div>
            <div className="card-body">
              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Product</th>
                      <th className="table-header-cell">Quantity</th>
                      <th className="table-header-cell">Unit Price</th>
                      <th className="table-header-cell">Total</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {transaction.productTransactionDetails?.map((item, index) => (
                      <tr key={index}>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">{item.productId}</div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(item.unitSalePrice)}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.totalAmount)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Payment Summary</h3>
            </div>
            <div className="card-body">
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
                  <dd className="text-sm text-gray-900">
                    {formatCurrency(transaction.totalAmount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Tax</dt>
                  <dd className="text-sm text-gray-900">$0.00</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">
                    {formatCurrency(transaction.totalAmount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Paid Amount</dt>
                  <dd className="text-sm text-success-600">
                    {formatCurrency(transaction.totalPaidAmount || 0)}
                  </dd>
                </div>
                {remainingAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Remaining</dt>
                    <dd className="text-sm text-danger-600">
                      {formatCurrency(remainingAmount)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Actions</h3>
            </div>
            <div className="card-body space-y-3">
              {remainingAmount > 0 && (
                <Link
                  to={`/transactions/${transaction.id}/pay`}
                  className="btn-primary w-full justify-center"
                >
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Process Payment
                </Link>
              )}
              <button className="btn-secondary w-full justify-center">
                <PrinterIcon className="h-5 w-5 mr-2" />
                Print Receipt
              </button>
              <button className="btn-secondary w-full justify-center">
                <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
                Process Return
              </button>
            </div>
          </div>

          {/* Transaction Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
            </div>
            <div className="card-body">
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                            <span className="text-white text-xs font-bold">1</span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Transaction created
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate(transaction.createdTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  {transaction.totalPaidAmount > 0 && (
                    <li>
                      <div className="relative">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-success-500 flex items-center justify-center ring-8 ring-white">
                              <span className="text-white text-xs font-bold">2</span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Payment received: {formatCurrency(transaction.totalPaidAmount)}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatDate(transaction.lastModifiedTime)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
