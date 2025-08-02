import React, { useState, useEffect, useCallback } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

import { analyticsAPI, analyticsRequestBuilder, formatCurrency } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DateRangePicker from '../components/common/DateRangePicker';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Execute comprehensive analytics queries using the new flexible API
      const [
        salesResponse,
        statusResponse,
        topProductsResponse,
        topCustomersResponse,
        dailySalesResponse,
        monthlySalesResponse
      ] = await Promise.all([
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.dashboard(dateRange)),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.transactionsByStatus(dateRange)),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.topProducts(10, dateRange)),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.topCustomers(10, dateRange)),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.salesTrends(dateRange, 'DAY')),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.salesTrends(dateRange, 'MONTH'))
      ]);

      // Extract data from responses
      const salesData = salesResponse.data;
      const statusData = statusResponse.data;
      const topProductsData = topProductsResponse.data;
      const topCustomersData = topCustomersResponse.data;
      const dailySalesData = dailySalesResponse.data;
      const monthlySalesData = monthlySalesResponse.data;

      // Process transaction status data
      const statusBreakdown = statusData.aggregations?.transactionsByStatus || [];
      const completedCount = statusBreakdown.find(s => s.transactionStatus === 'CLOSED')?.transactionsByStatus || 0;
      const pendingCount = statusBreakdown.filter(s => ['CREATED', 'PARTIAL_PAID'].includes(s.transactionStatus))
                                         .reduce((sum, s) => sum + (s.transactionsByStatus || 0), 0);

      // Combine all analytics data
      const combinedAnalytics = {
        totalRevenue: salesData.aggregations?.totalRevenue || 0,
        totalPaidAmount: salesData.aggregations?.totalPaidAmount || 0,
        totalDueAmount: (salesData.aggregations?.totalRevenue || 0) - (salesData.aggregations?.totalPaidAmount || 0),
        totalTransactions: salesData.aggregations?.totalTransactions || 0,
        totalCompletedTransactions: completedCount,
        totalPendingTransactions: pendingCount,
        topSellingProducts: topProductsData.aggregations?.topProducts || [],
        topCustomers: topCustomersData.aggregations?.topCustomers || [],
        dailySales: dailySalesData.aggregations?.salesTrend || [],
        monthlySales: monthlySalesData.aggregations?.salesTrend || [],
        transactionsByStatus: statusBreakdown,
      };

      setAnalytics(combinedAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  useEffect(() => {
    if (dateRange !== null) {
      loadAnalytics();
    }
  }, [dateRange, loadAnalytics]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Sales Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="card-body">
          <DateRangePicker onDateRangeChange={handleDateRangeChange} />
        </div>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(analytics.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(analytics.totalPaidAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Due Amount</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(analytics.totalDueAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.totalTransactions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Transaction Status</h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-medium text-green-600">
                      {analytics.totalCompletedTransactions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {analytics.totalPendingTransactions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-sm font-medium text-gray-900">
                      {analytics.totalTransactions}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Payment Overview</h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Collection Rate</span>
                    <span className="text-sm font-medium text-blue-600">
                      {analytics.totalRevenue > 0 
                        ? `${((analytics.totalPaidAmount / analytics.totalRevenue) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Outstanding</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(analytics.totalDueAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Top Selling Products</h2>
              </div>
              <div className="card-body">
                {analytics.topSellingProducts && analytics.topSellingProducts.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topSellingProducts.slice(0, 5).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-6">
                            #{index + 1}
                          </span>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.brand} - {product.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {product.totalQuantitySold} sold
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(product.totalRevenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No sales data available</p>
                )}
              </div>
            </div>

            {/* Top Customers */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Top Customers</h2>
              </div>
              <div className="card-body">
                {analytics.topCustomers && analytics.topCustomers.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topCustomers.slice(0, 5).map((customer, index) => (
                      <div key={customer.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-6">
                            #{index + 1}
                          </span>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(customer.totalSpent)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.totalTransactions} transactions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No customer data available</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
