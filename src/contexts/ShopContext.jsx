import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [shops, setShops] = useState([]);
  const [currentShop, setCurrentShop] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load shops when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadShops();
    } else {
      // Clear shop data when user logs out
      setShops([]);
      setCurrentShop(null);
    }
  }, [isAuthenticated]);

  const loadShops = async () => {
    try {
      setLoading(true);
      const response = await shopAPI.getAll();
      setShops(response.data);

      // Set current shop to default shop if available
      if (response.data.length > 0) {
        try {
          const defaultShopResponse = await shopAPI.getDefault();
          setCurrentShop(defaultShopResponse.data);
        } catch (error) {
          // If no default shop, set first shop as current
          setCurrentShop(response.data[0]);
        }
      }
    } catch (error) {
      
      // Only show error toast if it's not a network error (backend not running)
      if (error.code !== 'ERR_NETWORK') {
        toast.error('Failed to load shops');
      } else {
        
      }
    } finally {
      setLoading(false);
    }
  };

  const createShop = async (shopData) => {
    try {
      setLoading(true);
      const response = await shopAPI.create(shopData);
      const newShop = response.data;

      // Check if this is the first shop before updating state
      const isFirstShop = shops.length === 0;

      setShops(prev => [...prev, newShop]);

      // If this is the first shop, set it as current
      if (isFirstShop) {
        setCurrentShop(newShop);
      }

      toast.success('Shop created successfully');
      return { success: true, shop: newShop };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create shop';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateShop = async (shopId, shopData) => {
    try {
      setLoading(true);
      const response = await shopAPI.update(shopId, shopData);
      const updatedShop = response.data;
      
      setShops(prev => prev.map(shop => 
        shop.id === shopId ? updatedShop : shop
      ));
      
      // Update current shop if it's the one being updated
      if (currentShop?.id === shopId) {
        setCurrentShop(updatedShop);
      }
      
      toast.success('Shop updated successfully');
      return { success: true, shop: updatedShop };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update shop';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const deleteShop = async (shopId) => {
    try {
      setLoading(true);
      await shopAPI.delete(shopId);

      // Calculate remaining shops before updating state
      const remainingShops = shops.filter(shop => shop.id !== shopId);

      setShops(remainingShops);

      // If current shop is deleted, switch to another shop
      if (currentShop?.id === shopId) {
        setCurrentShop(remainingShops.length > 0 ? remainingShops[0] : null);
      }

      toast.success('Shop deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete shop';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const switchShop = async (shop) => {
    try {
      setLoading(true);
      await shopAPI.setDefault(shop.id);
      setCurrentShop(shop);
      toast.success(`Switched to ${shop.shopName}`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to switch shop';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const getShopById = async (shopId) => {
    // First check if shop exists in local state
    const localShop = shops.find(shop => shop.id === shopId);
    if (localShop) {
      return localShop;
    }

    // If not found locally, fetch from API
    try {
      const response = await shopAPI.getById(shopId);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  };

  const value = {
    shops,
    currentShop,
    loading,
    loadShops,
    createShop,
    updateShop,
    deleteShop,
    switchShop,
    getShopById
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};
