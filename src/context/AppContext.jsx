import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
// تأكد من أن المسارات صحيحة
import googleSheetsService from '@/services/GoogleSheetsService.js'; 
import cartService from '../services/cartService';

const AppContext = createContext();

const initialState = {
  products: [],
  categories: [],
  cart: [],
  loading: true, // ابدأ بالتحميل مباشرة
  error: null,
  currentCategory: null,
  searchQuery: ''
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, loading: true, error: null };
    case 'DATA_SUCCESS':
      return {
        ...state,
        loading: false,
        products: action.payload.products,
        categories: action.payload.categories,
        error: null,
      };
    case 'DATA_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'SET_CURRENT_CATEGORY':
      return { ...state, currentCategory: action.payload, searchQuery: '' };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload, currentCategory: null };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadInitialData = useCallback(async () => {
    dispatch({ type: 'START_LOADING' });
    try {
      const products = await googleSheetsService.fetchProducts();
      
      // إذا فشل جلب البيانات من الشبكة (رجع مصفوفة فارغة)
      if (!products || products.length === 0) {
        // حاول أن تبحث في الذاكرة المحلية كخطة بديلة
        const cachedData = localStorage.getItem('products_cache');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          console.log('Using data from localStorage fallback.');
          const categories = [...new Set(parsed.products.map(p => p.category).filter(Boolean))];
          dispatch({ type: 'DATA_SUCCESS', payload: { products: parsed.products, categories } });
          return; // توقف هنا لأننا وجدنا بيانات
        }
        // إذا لم نجد أي شيء، اعرض رسالة خطأ
        throw new Error('فشل جلب البيانات من المصدر ولم يتم العثور على نسخة احتياطية.');
      }

      // إذا نجحنا في جلب البيانات
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
      dispatch({ type: 'DATA_SUCCESS', payload: { products, categories } });
      
      // احفظ نسخة في الذاكرة المحلية للمستقبل
      localStorage.setItem('products_cache', JSON.stringify({ products, timestamp: Date.now() }));

    } catch (error) {
      console.error('Error in loadInitialData:', error);
      dispatch({ type: 'DATA_FAIL', payload: error.message });
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    const cart = cartService.getCart();
    dispatch({ type: 'SET_CART', payload: cart });
  }, [loadInitialData]);

  // --- بقية الدوال تبقى كما هي ---

  const addToCart = (product, quantity = 1) => {
    cartService.addToCart(product, quantity);
    dispatch({ type: 'SET_CART', payload: cartService.getCart() });
  };

  const removeFromCart = (productId) => {
    cartService.removeFromCart(productId);
    dispatch({ type: 'SET_CART', payload: cartService.getCart() });
  };

  const updateCartQuantity = (productId, quantity) => {
    cartService.updateQuantity(productId, quantity);
    dispatch({ type: 'SET_CART', payload: cartService.getCart() });
  };

  const clearCart = () => {
    cartService.clearCart();
    dispatch({ type: 'SET_CART', payload: cartService.getCart() });
  };

  const setCurrentCategory = (category) => {
    dispatch({ type: 'SET_CURRENT_CATEGORY', payload: category });
  };

  const setSearchQuery = (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const getFilteredProducts = () => {
    let filtered = state.products;
    if (state.currentCategory) {
      filtered = filtered.filter(p => p.category === state.currentCategory);
    }
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const getFeaturedProducts = () => {
    return state.products.filter(p => p.featured);
  };

  const getProductById = (id) => {
    return state.products.find(p => p.id === parseInt(id));
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setCurrentCategory,
    setSearchQuery,
    getFilteredProducts,
    getFeaturedProducts,
    getProductById,
    getCartItemsCount: () => cartService.getCartItemsCount(),
    getCartTotal: () => cartService.getCartTotal(),
    sendOrderToWhatsApp: () => cartService.sendOrderToWhatsApp(),
    formatPrice: (price) => cartService.formatPrice(price),
    refreshData: loadInitialData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
