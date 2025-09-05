import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Star, Package, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '../context/AppContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  
  const { 
    getProductById, 
    addToCart, 
    formatPrice, 
    loading,
    products 
  } = useApp();

  const product = getProductById(id);

  useEffect(() => {
    // التمرير لأعلى الصفحة عند تحميل المنتج
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      // يمكن إضافة إشعار هنا
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-300 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">المنتج غير موجود</h2>
          <p className="text-gray-600 mb-4">لم يتم العثور على المنتج المطلوب</p>
          <Button onClick={() => navigate('/')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* شريط التنقل */}
        <nav className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">الرئيسية</Link>
          <span>/</span>
          <Link to={`/?category=${product.category}`} className="hover:text-blue-600">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* صورة المنتج */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
              <img
                src={imageError ? 'https://via.placeholder.com/600x600?text=صورة+غير+متوفرة' : product.image_url}
                alt={product.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* تفاصيل المنتج */}
          <div className="space-y-6">
            {/* العنوان والشارات */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 text-right">
                    {product.name}
                  </h1>
                  <p className="text-lg text-gray-600">{product.category}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  {product.featured && (
                    <Badge className="bg-red-500 hover:bg-red-600">
                      <Star className="h-3 w-3 mr-1" />
                      مميز
                    </Badge>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      كمية محدودة
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* السعر */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* الوصف */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-right">وصف المنتج</h3>
              <p className="text-gray-700 leading-relaxed text-right">
                {product.description}
              </p>
            </div>

            {/* معلومات المخزون */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Package className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">المتوفر في المخزون:</span>
                  </div>
                  <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} قطعة` : 'نفد المخزون'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* اختيار الكمية وإضافة للسلة */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    الكمية
                  </label>
                  <div className="flex items-center space-x-3 space-x-reverse justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 ml-2" />
                  أضف إلى السلة ({formatPrice(product.price * quantity)})
                </Button>
              </div>
            )}

            {product.stock === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-center font-semibold">
                  هذا المنتج غير متوفر حالياً
                </p>
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-semibold mb-1">شحن سريع</h4>
                  <p className="text-sm text-gray-600">توصيل خلال 1-3 أيام</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-semibold mb-1">ضمان الجودة</h4>
                  <p className="text-sm text-gray-600">منتج أصلي مضمون</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

