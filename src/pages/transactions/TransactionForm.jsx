import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

import {
  transactionAPI,
  customerAPI,
  productAPI,
  formatCurrency
} from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const TransactionForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');
  
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [customersLoading, setCustomersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);
  const [searchedCustomers, setSearchedCustomers] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      customerId: preselectedCustomerId || '',
      productTransactions: [
        {
          productId: '',
          quantity: 1,
          unitSalePrice: 0,
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'productTransactions',
  });

  const watchedTransactions = watch('productTransactions');
  const totalAmount = watchedTransactions.reduce((sum, transaction) => {
    const quantity = parseFloat(transaction.quantity) || 0;
    const price = parseFloat(transaction.unitSalePrice) || 0;
    return sum + (quantity * price);
  }, 0);

  // Debounced search function
  const debouncedSearchCustomers = useCallback(
    useMemo(() => {
      let timeoutId;
      return (searchTerm) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (searchTerm.trim().length >= 2) {
            console.log('TransactionForm: Searching customers with term:', searchTerm);
            try {
              setCustomersLoading(true);
              // Use a special search criteria that the backend can handle with OR logic
              const searchCriteria = [
                { key: "searchTerm", value: searchTerm, operation: "CONTAINS" }
              ];
              const response = await customerAPI.search(searchCriteria);
              console.log('TransactionForm: Search results:', response.data);
              setSearchedCustomers(response.data);
            } catch (error) {
              console.error('TransactionForm: Error searching customers:', error);
              toast.error('Failed to search customers. Please try again.');
              setSearchedCustomers([]);
            } finally {
              setCustomersLoading(false);
            }
          } else if (searchTerm.trim().length === 0) {
            // Show all customers when search is empty
            setSearchedCustomers(allCustomers);
          } else {
            // Less than 2 characters, show empty results
            setSearchedCustomers([]);
          }
        }, 300); // 300ms debounce delay
      };
    }, [allCustomers]),
    [allCustomers]
  );

  useEffect(() => {
    console.log('TransactionForm: Component mounted, loading data...');
    loadCustomers();
    loadProducts();
  }, []);

  const loadCustomers = async () => {
    console.log('TransactionForm: Loading all customers...');
    try {
      setCustomersLoading(true);
      const response = await customerAPI.search([]);
      console.log('TransactionForm: All customers loaded:', response.data);
      setCustomers(response.data);
      setAllCustomers(response.data);
      setSearchedCustomers(response.data); // Initially show all customers
    } catch (error) {
      console.error('TransactionForm: Error loading customers:', error);
      toast.error('Failed to load customers. Please try again.');
      setCustomers([]);
      setAllCustomers([]);
      setSearchedCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  const loadProducts = async () => {
    console.log('TransactionForm: Loading products...');
    try {
      setProductsLoading(true);
      const response = await productAPI.search([]);
      console.log('TransactionForm: Products loaded:', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('TransactionForm: Error loading products:', error);
      toast.error('Failed to load products. Please try again.');
    } finally {
      setProductsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Format the data for the API
      const formattedData = {
        customerId: data.customerId,
        productTransactions: data.productTransactions.map(transaction => ({
          productId: transaction.productId,
          quantity: parseInt(transaction.quantity),
          unitSalePrice: parseFloat(transaction.unitSalePrice),
        })),
      };
      
      await transactionAPI.create(formattedData);
      toast.success('Transaction created successfully');
      navigate('/transactions');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create transaction';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    console.log('TransactionForm: Customer selected:', customer);
    setValue('customerId', customer.id);
    setShowCustomerModal(false);
    setCustomerSearchTerm('');
  };

  const handleProductSelect = (product) => {
    if (selectedProductIndex !== null) {
      setValue(`productTransactions.${selectedProductIndex}.productId`, product.id);
      setValue(`productTransactions.${selectedProductIndex}.unitSalePrice`, product.unitSalePrice);
    }
    setShowProductModal(false);
    setSelectedProductIndex(null);
  };

  const openProductModal = (index) => {
    setSelectedProductIndex(index);
    setShowProductModal(true);
  };

  const addProductTransaction = () => {
    append({
      productId: '',
      quantity: 1,
      unitSalePrice: 0,
    });
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Select Customer';
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Select Product';
  };

  // Use searched customers for display
  const displayCustomers = searchedCustomers;

  console.log('TransactionForm: allCustomers:', allCustomers.length, 'displayCustomers:', displayCustomers.length, 'searchTerm:', customerSearchTerm);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/transactions')}
          className="btn-secondary"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        <div>
          <h1 className="page-title">Create New Transaction</h1>
          <p className="page-subtitle">Add products and create a new sales transaction</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Selection */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
          </div>
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="form-label">
                  Customer <span className="text-danger-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type="text"
                    className="form-input rounded-r-none"
                    value={getCustomerName(watch('customerId'))}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => {
                      console.log('TransactionForm: Opening customer modal, customers available:', customers.length);
                      setShowCustomerModal(true);
                    }}
                    className="btn-secondary rounded-l-none border-l-0"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
                <input
                  type="hidden"
                  {...register('customerId', { required: 'Customer is required' })}
                />
                {errors.customerId && (
                  <p className="form-error">{errors.customerId.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Products</h2>
              <button
                type="button"
                onClick={addProductTransaction}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Product
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
                  {/* Product Selection */}
                  <div className="md:col-span-2">
                    <label className="form-label">Product</label>
                    <div className="flex">
                      <input
                        type="text"
                        className="form-input rounded-r-none"
                        value={getProductName(watch(`productTransactions.${index}.productId`))}
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => openProductModal(index)}
                        className="btn-secondary rounded-l-none border-l-0"
                      >
                        <MagnifyingGlassIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <input
                      type="hidden"
                      {...register(`productTransactions.${index}.productId`, {
                        required: 'Product is required'
                      })}
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      {...register(`productTransactions.${index}.quantity`, {
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' }
                      })}
                    />
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="form-label">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      {...register(`productTransactions.${index}.unitSalePrice`, {
                        required: 'Unit price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      })}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-end">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="btn-danger"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/transactions')}
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
                Creating...
              </>
            ) : (
              'Create Transaction'
            )}
          </button>
        </div>
      </form>

      {/* Customer Selection Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setCustomerSearchTerm('');
        }}
        title="Select Customer"
        size="lg"
      >
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone... (min 2 characters)"
              className="form-input pl-10"
              value={customerSearchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setCustomerSearchTerm(value);
                debouncedSearchCustomers(value);
              }}
              autoFocus
            />
          </div>

          {/* Customer List */}
          <div className="max-h-96 overflow-y-auto">
            {customersLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="md" />
                <p className="text-gray-500 mt-2">Loading customers...</p>
              </div>
            ) : displayCustomers.length > 0 ? (
              displayCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer mb-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{customer.phoneNo}</p>
                      <p className="text-sm text-gray-500">{customer.city}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {customerSearchTerm.length >= 2 ? 'No customers found matching your search.' :
                 customerSearchTerm.length > 0 ? 'Type at least 2 characters to search...' :
                 allCustomers.length === 0 ? 'No customers available. Please create customers first.' : 'No customers available.'}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setProductSearchTerm('');
          setSelectedProductIndex(null);
        }}
        title="Select Product"
        size="lg"
      >
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, brand, or category..."
              className="form-input pl-10"
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Product List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer mb-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.brand} - {product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(product.unitSalePrice)}</p>
                      <p className="text-sm text-gray-500">Stock: {product.quantity}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {productSearchTerm ? 'No products found matching your search.' : 'No products available.'}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionForm;
