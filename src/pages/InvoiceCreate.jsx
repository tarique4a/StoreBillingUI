import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

import { invoiceAPI, transactionAPI, formatCurrency } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId');
  
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [loadingTransaction, setLoadingTransaction] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      taxRate: 0,
      discountAmount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      notes: 'Payment due within 30 days.',
      companyName: 'Your Company Name',
      companyAddress: '123 Business Street',
      companyCity: 'Business City',
      companyState: 'State',
      companyZipCode: '12345',
      companyCountry: 'Country',
      companyPhoneNo: '+1-555-0123',
      companyEmail: 'info@company.com',
      companyWebsite: 'www.company.com',
    },
  });

  const watchedValues = watch(['taxRate', 'discountAmount']);

  useEffect(() => {
    if (transactionId) {
      loadTransaction();
    } else {
      setLoadingTransaction(false);
    }
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      setLoadingTransaction(true);
      const response = await transactionAPI.getById(transactionId);
      setTransaction(response.data);
    } catch (error) {
      console.error('Error loading transaction:', error);
      alert('Error loading transaction. Please try again.');
      navigate('/transactions');
    } finally {
      setLoadingTransaction(false);
    }
  };

  const calculateTotals = () => {
    if (!transaction) return { subtotal: 0, taxAmount: 0, discountAmount: 0, total: 0 };
    
    const subtotal = transaction.totalAmount;
    const taxRate = parseFloat(watchedValues[0]) || 0;
    const discountAmount = parseFloat(watchedValues[1]) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discountAmount;
    
    return { subtotal, taxAmount, discountAmount, total };
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const invoiceData = {
        transactionId: transactionId,
        dueDate: new Date(data.dueDate).getTime(),
        notes: data.notes,
        taxRate: parseFloat(data.taxRate) || 0,
        discountAmount: parseFloat(data.discountAmount) || 0,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyCity: data.companyCity,
        companyState: data.companyState,
        companyZipCode: data.companyZipCode,
        companyCountry: data.companyCountry,
        companyPhoneNo: data.companyPhoneNo,
        companyEmail: data.companyEmail,
        companyWebsite: data.companyWebsite,
        companyTaxId: data.companyTaxId,
        companyBankDetails: data.companyBankDetails,
      };

      const response = await invoiceAPI.create(invoiceData);
      
      alert('Invoice created successfully!');
      navigate(`/invoices/${response.data.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingTransaction) {
    return <LoadingSpinner />;
  }

  if (!transaction) {
    return (
      <div className="text-center py-8">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transaction selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select a transaction to create an invoice.
        </p>
        <button
          onClick={() => navigate('/transactions')}
          className="mt-4 btn-primary"
        >
          Go to Transactions
        </button>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/invoices')}
            className="btn-secondary flex items-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Invoices
          </button>
          <div>
            <h1 className="page-title">Create Invoice</h1>
            <p className="text-gray-600">Generate invoice from transaction</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Details */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Transaction Details</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <input
                      type="text"
                      value={transaction.id}
                      disabled
                      className="input bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <input
                      type="text"
                      value={transaction.customerId}
                      disabled
                      className="input bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction Amount</label>
                    <input
                      type="text"
                      value={formatCurrency(transaction.totalAmount)}
                      disabled
                      className="input bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <input
                      type="text"
                      value={transaction.transactionStatus}
                      disabled
                      className="input bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Settings */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Invoice Settings</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                    <input
                      type="date"
                      {...register('dueDate', { required: 'Due date is required' })}
                      className={`input ${errors.dueDate ? 'border-red-500' : ''}`}
                    />
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      {...register('taxRate')}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Discount Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('discountAmount')}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      rows={3}
                      {...register('notes')}
                      className="input"
                      placeholder="Payment terms, additional notes..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Company Details</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      type="text"
                      {...register('companyName')}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      {...register('companyEmail')}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      {...register('companyPhoneNo')}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="text"
                      {...register('companyWebsite')}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      {...register('companyAddress')}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      {...register('companyCity')}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      {...register('companyState')}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/invoices')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Create Invoice
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Invoice Preview */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Invoice Preview</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax ({watchedValues[0]}%):</span>
                    <span className="text-sm font-medium">{formatCurrency(totals.taxAmount)}</span>
                  </div>
                )}
                
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="text-sm font-medium text-red-600">-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                )}
                
                <hr />
                
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">Total:</span>
                  <span className="text-base font-bold text-gray-900">{formatCurrency(totals.total)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount Due:</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(Math.max(0, totals.total - (transaction.totalPaidAmount || 0)))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreate;
