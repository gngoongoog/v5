import React from 'react';
import ProductCard from './ProductCard';
import Pagination from './Pagination';
import { Loader2, Package } from 'lucide-react';
import usePagination from '../hooks/usePagination';

const ProductGrid = ({ products, loading, title, emptyMessage }) => {
  const {
    currentPage,
    totalPages,
    currentData,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    getPageRange,
    hasNextPage,
    hasPrevPage,
    totalItems,
    startIndex,
    endIndex
  } = usePagination(products || [], 100); // عرض 100 منتج في كل صفحة

  // إعادة تعيين الصفحة عند تغيير المنتجات
  React.useEffect(() => {
    resetPage();
  }, [products, resetPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {emptyMessage || 'لا توجد منتجات'}
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          لم يتم العثور على أي منتجات في هذا القسم. يرجى المحاولة مرة أخرى أو تصفح أقسام أخرى.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* عنوان القسم */}
      {title && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded"></div>
        </div>
      )}

      {/* عدد المنتجات ومعلومات الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-gray-600">
          إجمالي {totalItems} منتج
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-gray-500">
            عرض {startIndex} - {endIndex} من {totalItems}
          </p>
        )}
      </div>

      {/* شبكة المنتجات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentData.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* مكون Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        getPageRange={getPageRange}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
      />
    </div>
  );
};

export default ProductGrid;

