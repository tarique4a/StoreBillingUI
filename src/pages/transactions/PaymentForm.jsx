import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, CreditCardIcon } from '@heroicons/react/24/outline';

import { transactionAPI, formatCurrency } from '../../services/api';
import LoadingSpinner, { PageLoader } from '../../components/common/LoadingSpinner';

const PaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      totalPaidAmount: 0,
    },
  });

  const watchedAmount = watch('totalPaidAmount');
  const remainingAmount = transaction ? transaction.totalAmount - (transaction.totalPaidAmount || 0) : 0;
  const changeAmount = watchedAmount > remainingAmount ? watchedAmount - remainingAmount : 0;

  useEffect(() => {
    loadTransaction();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTransaction = async () => {
    try {
      setInitialLoading(true);
      const response = await transactionAPI.getById(id);
      setTransaction(response.data);
      
      // Set default payment amount to remaining amount
      const remaining = response.data.totalAmount - (response.data.totalPaidAmount || 0);
      setValue('totalPaidAmount', remaining);
    } catch (error) {
      toast.error('Failed to load transaction');
      navigate('/transactions');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      await transactionAPI.pay(id, {
        totalPaidAmount: parseFloat(data.totalPaidAmount),
      });
      
      toast.success('Payment processed successfully');
      navigate(`/transactions/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Payment processing failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <PageLoader />;
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Transaction not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The transaction you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/transactions/${id}`)}
          className="btn-secondary"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        <div>
          <h1 className="page-title">Process Payment</h1>
          <p className="page-subtitle">
            Transaction #{transaction.id.slice(-8)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Payment Details</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="form-label">
                  Payment Amount <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={transaction.totalAmount}
                    className={`form-input pl-7 ${errors.totalPaidAmount ? 'border-danger-300' : ''}`}
                    {...register('totalPaidAmount', {
                      required: 'Payment amount is required',
                      min: {
                        value: 0.01,
                        message: 'Payment amount must be greater than 0',
                      },
                      max: {
                        value: transaction.totalAmount,
                        message: 'Payment amount cannot exceed total amount',
                      },
                    })}
                  />
                </div>
                {errors.totalPaidAmount && (
                  <p className="form-error">{errors.totalPaidAmount.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setValue('totalPaidAmount', remainingAmount)}
                  className="btn-secondary w-full"
                >
                  Pay Remaining Amount ({formatCurrency(remainingAmount)})
                </button>
                <button
                  type="button"
                  onClick={() => setValue('totalPaidAmount', transaction.totalAmount)}
                  className="btn-secondary w-full"
                >
                  Pay Full Amount ({formatCurrency(transaction.totalAmount)})
                </button>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(`/transactions/${id}`)}
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="h-5 w-5 mr-2" />
                      Process Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Payment Summary</h2>
          </div>
          <div className="card-body">
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="text-sm text-gray-900">
                  {formatCurrency(transaction.totalAmount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Already Paid</dt>
                <dd className="text-sm text-success-600">
                  {formatCurrency(transaction.totalPaidAmount || 0)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-4">
                <dt className="text-sm font-medium text-gray-500">Remaining</dt>
                <dd className="text-sm font-medium text-danger-600">
                  {formatCurrency(remainingAmount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Payment Amount</dt>
                <dd className="text-sm font-medium text-primary-600">
                  {formatCurrency(watchedAmount || 0)}
                </dd>
              </div>
              {changeAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Change</dt>
                  <dd className="text-sm font-medium text-warning-600">
                    {formatCurrency(changeAmount)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
