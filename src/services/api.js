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
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle different error status codes
    switch (error.response?.status) {
      case 401:
        toast.error('Unauthorized access');
        // Redirect to login if needed
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
        toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Customer API
export const customerAPI = {
  getById: (id) => api.get(`/customer/${id}`),
  create: (data) => api.post('/customer/create', data),
  update: (id, data) => api.put(`/customer/update/${id}`, data),
  delete: (id) => api.put(`/customer/delete/${id}`),
  search: (criteria) => api.get('/customer/search', { data: criteria }),
};

// Product API
export const productAPI = {
  getById: (id) => api.get(`/product/${id}`),
  create: (data) => api.post('/product/create', data),
  update: (id, data) => api.put(`/product/update/${id}`, data),
  delete: (id) => api.put(`/product/delete/${id}`),
  search: (criteria) => api.get('/product/search', { data: criteria }),
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

export default api;
