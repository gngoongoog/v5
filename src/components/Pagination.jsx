import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  getPageRange,
  totalItems,
  startIndex,
  endIndex
}) => {
  if (totalPages <= 1) return null;

  const pageRange = getPageRange();

  return (
    <div className="flex flex-col items-center space-y-4 mt-8">
      {/* معلومات الصفحة */}
      <div className="text-sm text-gray-600 text-center">
        عرض {startIndex} إلى {endIndex} من أصل {totalItems} منتج
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center space-x-2 space-x-reverse">
        {/* زر الصفحة السابقة */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="flex items-center space-x-1 space-x-reverse"
        >
          <ChevronRight className="h-4 w-4" />
          <span>السابق</span>
        </Button>

        {/* أرقام الصفحات */}
        <div className="flex items-center space-x-1 space-x-reverse">
          {pageRange.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`dots-${index}`} className="px-2">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
              );
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={`min-w-[40px] ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* زر الصفحة التالية */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="flex items-center space-x-1 space-x-reverse"
        >
          <span>التالي</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* معلومات إضافية للشاشات الصغيرة */}
      <div className="md:hidden text-xs text-gray-500 text-center">
        صفحة {currentPage} من {totalPages}
      </div>
    </div>
  );
};

export default Pagination;

