import React, { useState } from 'react';

const FilterSort = ({ onFilterChange, onSortChange, categories, priceRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false
  });
  const [sortBy, setSortBy] = useState('name');

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onSortChange(value);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setSortBy('name');
    onSortChange('name');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">التصفية والفرز</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          {isOpen ? 'إخفاء' : 'إظهار'} الخيارات
        </button>
      </div>

      <div className={`grid gap-4 ${isOpen ? 'block' : 'hidden md:block'} md:grid-cols-2 lg:grid-cols-4`}>
        {/* تصفية حسب القسم */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            القسم
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">جميع الأقسام</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* تصفية حسب السعر */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            السعر الأدنى
          </label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="0"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            السعر الأعلى
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder={priceRange?.max || "1000000"}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* الفرز */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ترتيب حسب
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">الاسم (أ-ي)</option>
            <option value="name-desc">الاسم (ي-أ)</option>
            <option value="price-asc">السعر (الأقل أولاً)</option>
            <option value="price-desc">السعر (الأعلى أولاً)</option>
            <option value="newest">الأحدث</option>
            <option value="popular">الأكثر شعبية</option>
          </select>
        </div>
      </div>

      {/* خيارات إضافية */}
      <div className={`mt-4 flex items-center justify-between ${isOpen ? 'block' : 'hidden md:flex'}`}>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="mr-2 text-sm text-gray-700">المنتجات المتوفرة فقط</span>
        </label>

        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          مسح جميع الفلاتر
        </button>
      </div>
    </div>
  );
};

export default FilterSort;

