import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Zap, Cable, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductGrid from '../components/ProductGrid';
import FilterSort from '../components/FilterSort';
import { useApp } from '../context/AppContext';
import { useProductFilter } from '../hooks/useProductFilter';

const HomePage = () => {
  const { 
    loading, 
    error, 
    getFeaturedProducts, 
    getFilteredProducts,
    currentCategory,
    searchQuery,
    setCurrentCategory,
    categories,
    refreshData
  } = useApp();

  // استخدام hook التصفية والفرز
  const allProducts = currentCategory || searchQuery ? getFilteredProducts() : getFeaturedProducts();
  const {
    filteredProducts,
    categories: filterCategories,
    priceRange,
    handleFilterChange,
    handleSortChange,
    totalResults
  } = useProductFilter(allProducts);

  useEffect(() => {
    // إعادة تحميل البيانات عند تحميل الصفحة إذا لم تكن متوفرة
    if (!loading && getFeaturedProducts().length === 0 && !error) {
      refreshData();
    }
  }, []);

  // أيقونات الأقسام
  const categoryIcons = {
    'سماعات': Headphones,
    'شاحنات': Zap,
    'كيبلات': Cable,
    'لزقات حماية': Shield,
    'اكسسوارات': Smartphone
  };

  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
  };

  // تحديد المنتجات المراد عرضها
  const productsToShow = currentCategory || searchQuery 
    ? getFilteredProducts() 
    : getFeaturedProducts();

  const getPageTitle = () => {
    if (searchQuery) {
      return `نتائج البحث عن: "${searchQuery}"`;
    }
    if (currentCategory) {
      return currentCategory;
    }
    return 'المنتجات المميزة';
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshData}>إعادة المحاولة</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* قسم البانر الرئيسي */}
      {!currentCategory && !searchQuery && (
        <section className="bg-gradient-to-r from-black to-gray-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Gn store للجملة
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              أحدث الأجهزة والإكسسوارات بأفضل الأسعار
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Smartphone className="h-6 w-6" />
                <span>جودة عالية</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Zap className="h-6 w-6" />
                <span>شحن سريع</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Shield className="h-6 w-6" />
                <span>ضمان شامل</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* أقسام المنتجات */}
      {!currentCategory && !searchQuery && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              تصفح حسب القسم
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category] || Smartphone;
                return (
                  <Card 
                    key={category}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <CardContent className="p-6 text-center">
                      <IconComponent className="h-12 w-12 mx-auto mb-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category}
                      </h3>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* قسم المنتجات */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* التصفية والفرز */}
          {(currentCategory || searchQuery || totalResults > 0) && (
            <FilterSort
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              categories={filterCategories}
              priceRange={priceRange}
            />
          )}
          
          <ProductGrid 
            products={filteredProducts}
            loading={loading}
            title={getPageTitle()}
            emptyMessage={
              searchQuery 
                ? `لم يتم العثور على نتائج للبحث "${searchQuery}"`
                : currentCategory 
                  ? `لا توجد منتجات في قسم ${currentCategory}`
                  : 'لا توجد منتجات مميزة حالياً'
            }
          />
        </div>
      </section>

      {/* قسم المعلومات */}
      {!currentCategory && !searchQuery && (
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">شحن سريع</h3>
                <p className="text-gray-600">
                  توصيل سريع لجميع أنحاء العراق
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">ضمان الجودة</h3>
                <p className="text-gray-600">
                  جميع منتجاتنا أصلية ومضمونة
                </p>
              </div>
              <div className="text-center">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-semibold mb-2">دعم فني</h3>
                <p className="text-gray-600">
                  فريق دعم متاح للمساعدة
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;

