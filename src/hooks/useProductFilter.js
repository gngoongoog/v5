import { useState, useMemo } from 'react';

export const useProductFilter = (products) => {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    searchQuery: ''
  });
  const [sortBy, setSortBy] = useState('name');

  // استخراج الأقسام المتاحة
  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return uniqueCategories.filter(Boolean);
  }, [products]);

  // استخراج نطاق الأسعار
  const priceRange = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 1000000 };
    const prices = products.map(product => parseFloat(product.price) || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // تصفية وفرز المنتجات
  const filteredAndSortedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    let filtered = [...products];

    // تصفية حسب البحث
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // تصفية حسب القسم
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // تصفية حسب السعر
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(product => parseFloat(product.price) >= minPrice);
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(product => parseFloat(product.price) <= maxPrice);
    }

    // تصفية حسب التوفر
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // الفرز
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '', 'ar');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '', 'ar');
        case 'price-asc':
          return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        case 'price-desc':
          return parseFloat(b.price || 0) - parseFloat(a.price || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters, sortBy]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const handleSearchChange = (searchQuery) => {
    setFilters(prev => ({ ...prev, searchQuery }));
  };

  return {
    filteredProducts: filteredAndSortedProducts,
    filters,
    sortBy,
    categories,
    priceRange,
    handleFilterChange,
    handleSortChange,
    handleSearchChange,
    totalResults: filteredAndSortedProducts.length
  };
};

