import { useState, useMemo } from 'react';

const usePagination = (data, itemsPerPage = 100) => {
  const [currentPage, setCurrentPage] = useState(1);

  // حساب إجمالي عدد الصفحات
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // حساب البيانات للصفحة الحالية
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // الانتقال للصفحة التالية
  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // الانتقال للصفحة السابقة
  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // الانتقال لصفحة محددة
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  // إعادة تعيين الصفحة للأولى
  const resetPage = () => {
    setCurrentPage(1);
  };

  // حساب نطاق الصفحات للعرض
  const getPageRange = () => {
    const delta = 2; // عدد الصفحات المعروضة على كل جانب
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return {
    currentPage,
    totalPages,
    currentData,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    getPageRange,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    totalItems: data.length,
    startIndex: (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, data.length)
  };
};

export default usePagination;

