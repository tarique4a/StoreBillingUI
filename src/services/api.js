import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request:', config.method?.toUpperCase(), config.url, 'with token');
    } else {
      console.log('API Request:', config.method?.toUpperCase(), config.url, 'without token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.method?.toUpperCase(), response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.method?.toUpperCase(), error.config?.url, error.response?.data || error.message);

    const message = error.response?.data?.message || error.message || 'An error occurred';

    // Handle different error status codes
    switch (error.response?.status) {
      case 401:
        console.log('401 Unauthorized - redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        break;
      case 403:
        toast.error('Access forbidden');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 409:
        toast.error(message);
        break;
      case 500:
        toast.error('Server error occurred');
        break;
      default:
        // Only show toast for non-network errors
        if (error.response) {
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  validateResetToken: (token) => api.get(`/auth/validate-reset-token?token=${token}`),
};

// Shop API
export const shopAPI = {
  getAll: () => api.get('/shops'),
  getById: (id) => api.get(`/shops/${id}`),
  create: (data) => api.post('/shops', data),
  update: (id, data) => api.put(`/shops/${id}`, data),
  delete: (id) => api.delete(`/shops/${id}`),
  getDefault: () => api.get('/shops/default'),
  setDefault: (id) => api.post(`/shops/${id}/set-default`),
};

// Customer API
export const customerAPI = {
  getById: (id) => api.get(`/customer/${id}`),
  create: (data) => api.post('/customer/create', data),
  update: (id, data) => api.put(`/customer/update/${id}`, data),
  search: (criteria) => api.post('/customer/search', criteria),
};

// Product API
export const productAPI = {
  getById: (id) => api.get(`/product/${id}`),
  create: (data) => api.post('/product/create', data),
  update: (id, data) => api.put(`/product/update/${id}`, data),
  delete: (id) => api.put(`/product/delete/${id}`),
  search: (criteria) => api.post('/product/search', criteria),
};

// Transaction API
export const transactionAPI = {
  getById: (id) => api.get(`/transaction/${id}`),
  create: (data) => api.post('/transaction/create', data),
  update: (id, data, isCompleted = false) => 
    api.put(`/transaction/update/${id}?isCompleted=${isCompleted}`, data),
  delete: (id) => api.put(`/transaction/delete/${id}`),
  return: (data) => api.put('/transaction/return', data),
  pay: (id, data) => api.put(`/transaction/pay/${id}`, data),
};

// Search operations enum
export const SEARCH_OPERATIONS = {
  EQUALITY: 'EQUALITY',
  NEGATION: 'NEGATION',
  GREATER_THAN: 'GREATER_THAN',
  LESS_THAN: 'LESS_THAN',
  LIKE: 'LIKE',
  STARTS_WITH: 'STARTS_WITH',
  ENDS_WITH: 'ENDS_WITH',
  CONTAINS: 'CONTAINS',
};

// Customer types enum
export const CUSTOMER_TYPES = {
  INDIVIDUAL: 'INDIVIDUAL',
  BUSINESS: 'BUSINESS',
};

// Transaction status enum
export const TRANSACTION_STATUS = {
  DRAFTED: 'DRAFTED',
  CREATED: 'CREATED',
  PARTIAL_PAID: 'PARTIAL_PAID',
  CLOSED: 'CLOSED',
  RETURNED: 'RETURNED',
};

// Utility functions
export const createSearchCriteria = (key, value, operation = SEARCH_OPERATIONS.EQUALITY) => ({
  key,
  value,
  operation,
});

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// New Flexible Analytics API - No Backward Compatibility
export const analyticsAPI = {
  // Core unified query endpoint
  executeQuery: (analyticsRequest) => api.post('/analytics/query', analyticsRequest),
};

// Invoice API
export const invoiceAPI = {
  // CRUD operations
  create: (invoiceData) => api.post('/invoices', invoiceData),
  getById: (id) => api.get(`/invoices/${id}`),
  getByNumber: (invoiceNumber) => api.get(`/invoices/number/${invoiceNumber}`),
  update: (id, updateData) => api.put(`/invoices/${id}`, updateData),
  delete: (id) => api.delete(`/invoices/${id}`),

  // PDF operations
  generatePdf: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),

  // Payment operations
  addPayment: (id, paymentData) => api.post(`/invoices/${id}/payments`, paymentData),

  // Search and filter operations
  getByCustomer: (customerId, params = {}) => api.get(`/invoices/customer/${customerId}`, { params }),
  getByStatus: (status, params = {}) => api.get(`/invoices/status/${status}`, { params }),
  search: (query, params = {}) => api.get('/invoices/search', { params: { query, ...params } }),
  getOverdue: () => api.get('/invoices/overdue'),

  // Statistics and configuration
  getStatistics: () => api.get('/invoices/statistics'),
  getNumberingConfig: () => api.get('/invoices/numbering/config'),
};

// Date range helper
export const createDateRange = (startDate, endDate) => ({
  startDate: startDate instanceof Date ? startDate.getTime() : startDate,
  endDate: endDate instanceof Date ? endDate.getTime() : endDate,
});

// Comprehensive Analytics Request Builder
export const analyticsRequestBuilder = {
  // Core request builder
  createRequest: (collection, aggregations, filters = [], options = {}) => ({
    collection,
    filters,
    aggregations,
    includeRawData: options.includeRawData || false,
    includeFields: options.includeFields,
    excludeFields: options.excludeFields,
    globalLimit: options.globalLimit,
    globalSkip: options.globalSkip,
  }),

  // Filter builders
  filters: {
    equals: (field, value) => ({ field, operation: 'EQUALS', value }),
    notEquals: (field, value) => ({ field, operation: 'NOT_EQUALS', value }),
    greaterThan: (field, value) => ({ field, operation: 'GREATER_THAN', value }),
    lessThan: (field, value) => ({ field, operation: 'LESS_THAN', value }),
    between: (field, minValue, maxValue) => ({ field, operation: 'BETWEEN', minValue, maxValue }),
    in: (field, values) => ({ field, operation: 'IN', values }),
    notIn: (field, values) => ({ field, operation: 'NOT_IN', values }),
    contains: (field, value) => ({ field, operation: 'CONTAINS', value }),
    dateRange: (field, startDate, endDate) => ({
      field,
      operation: 'BETWEEN',
      minValue: startDate instanceof Date ? startDate.getTime() : startDate,
      maxValue: endDate instanceof Date ? endDate.getTime() : endDate
    }),
    excludeDrafted: () => ({ field: 'transactionStatus', operation: 'NOT_EQUALS', value: 'DRAFTED' }),
    onlyCompleted: () => ({ field: 'transactionStatus', operation: 'EQUALS', value: 'CLOSED' }),
    lowStock: (threshold) => ({ field: 'quantity', operation: 'LESS_THAN_OR_EQUAL', value: threshold }),
  },

  // Aggregation builders
  aggregations: {
    count: (name) => ({ name, type: 'COUNT' }),
    sum: (name, field) => ({ name, type: 'SUM', field }),
    average: (name, field) => ({ name, type: 'AVERAGE', field }),
    min: (name, field) => ({ name, type: 'MIN', field }),
    max: (name, field) => ({ name, type: 'MAX', field }),

    // Time-based aggregations
    dailySum: (name, field) => ({
      name, type: 'SUM', field, timeGrouping: 'DAY', sortBy: 'timeGroup', sortDirection: 'ASC'
    }),
    monthlySum: (name, field) => ({
      name, type: 'SUM', field, timeGrouping: 'MONTH', sortBy: 'timeGroup', sortDirection: 'ASC'
    }),
    dailyCount: (name) => ({
      name, type: 'COUNT', timeGrouping: 'DAY', sortBy: 'timeGroup', sortDirection: 'ASC'
    }),

    // Grouped aggregations
    groupedSum: (name, field, groupByFields, limit = null) => ({
      name, type: 'SUM', field, groupByFields, sortBy: name, sortDirection: 'DESC', limit
    }),
    groupedCount: (name, groupByFields, limit = null) => ({
      name, type: 'COUNT', groupByFields, sortBy: name, sortDirection: 'DESC', limit
    }),
  },

  // Preset request builders
  presets: {
    dashboard: (dateRange = null) => {
      const filters = [analyticsRequestBuilder.filters.excludeDrafted()];
      if (dateRange) {
        filters.push(analyticsRequestBuilder.filters.dateRange('createdTime', dateRange.startDate, dateRange.endDate));
      }

      return analyticsRequestBuilder.createRequest('transaction', [
        analyticsRequestBuilder.aggregations.count('totalTransactions'),
        analyticsRequestBuilder.aggregations.sum('totalRevenue', 'totalAmount'),
        analyticsRequestBuilder.aggregations.sum('totalPaidAmount', 'totalPaidAmount'),
      ], filters);
    },

    salesTrends: (dateRange = null, grouping = 'DAY') => {
      const filters = [analyticsRequestBuilder.filters.excludeDrafted()];
      if (dateRange) {
        filters.push(analyticsRequestBuilder.filters.dateRange('createdTime', dateRange.startDate, dateRange.endDate));
      }

      const aggregations = grouping === 'DAY'
        ? [analyticsRequestBuilder.aggregations.dailySum('salesTrend', 'totalAmount')]
        : [analyticsRequestBuilder.aggregations.monthlySum('salesTrend', 'totalAmount')];

      return analyticsRequestBuilder.createRequest('transaction', aggregations, filters);
    },

    topProducts: (limit = 10, dateRange = null) => {
      const filters = [analyticsRequestBuilder.filters.excludeDrafted()];
      if (dateRange) {
        filters.push(analyticsRequestBuilder.filters.dateRange('createdTime', dateRange.startDate, dateRange.endDate));
      }

      return analyticsRequestBuilder.createRequest('transaction', [
        analyticsRequestBuilder.aggregations.groupedSum('topProducts', 'productTransactionDetails.quantity', ['productTransactionDetails.productId'], limit)
      ], filters);
    },

    topCustomers: (limit = 10, dateRange = null) => {
      const filters = [analyticsRequestBuilder.filters.excludeDrafted()];
      if (dateRange) {
        filters.push(analyticsRequestBuilder.filters.dateRange('createdTime', dateRange.startDate, dateRange.endDate));
      }

      return analyticsRequestBuilder.createRequest('transaction', [
        analyticsRequestBuilder.aggregations.groupedSum('topCustomers', 'totalAmount', ['customerId'], limit),
        analyticsRequestBuilder.aggregations.groupedCount('customerTransactionCount', ['customerId'], limit)
      ], filters);
    },

    lowStockProducts: (threshold = 10, limit = 20) => {
      return analyticsRequestBuilder.createRequest('product', [
        analyticsRequestBuilder.aggregations.count('lowStockCount')
      ], [
        analyticsRequestBuilder.filters.lowStock(threshold)
      ], {
        includeRawData: true,
        includeFields: ['name', 'brand', 'category', 'quantity', 'unitSalePrice'],
        globalLimit: limit
      });
    },

    recentTransactions: (limit = 10) => {
      return analyticsRequestBuilder.createRequest('transaction', [
        analyticsRequestBuilder.aggregations.count('totalCount')
      ], [], {
        includeRawData: true,
        includeFields: ['customerId', 'totalAmount', 'totalPaidAmount', 'transactionStatus', 'createdTime'],
        globalLimit: limit
      });
    },

    transactionsByStatus: (dateRange = null) => {
      const filters = [analyticsRequestBuilder.filters.excludeDrafted()];
      if (dateRange) {
        filters.push(analyticsRequestBuilder.filters.dateRange('createdTime', dateRange.startDate, dateRange.endDate));
      }

      return analyticsRequestBuilder.createRequest('transaction', [
        analyticsRequestBuilder.aggregations.groupedCount('transactionsByStatus', ['transactionStatus'])
      ], filters);
    },

    customerAnalytics: (limit = 10) => {
      return analyticsRequestBuilder.createRequest('customer', [
        analyticsRequestBuilder.aggregations.count('totalCustomers')
      ], [], {
        includeRawData: true,
        globalLimit: limit
      });
    },

    productAnalytics: (limit = 10) => {
      return analyticsRequestBuilder.createRequest('product', [
        analyticsRequestBuilder.aggregations.count('totalProducts')
      ], [], {
        includeRawData: true,
        globalLimit: limit
      });
    },
  },
};

export default api;
