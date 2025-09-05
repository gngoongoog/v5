import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '../context/AppContext';

const ProductCard = ({ product }) => {
  const { addToCart, formatPrice } = useApp();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x300?text=صورة+غير+متوفرة';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          {/* شارة المنتج المميز */}
          {product.featured && (
            <Badge className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600">
              <Star className="h-3 w-3 mr-1" />
              مميز
            </Badge>
          )}
          
          {/* شارة نفاد المخزون */}
          {product.stock === 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2 z-10">
              نفد المخزون
            </Badge>
          )}

          {/* صورة المنتج */}
          <div className="aspect-square overflow-hidden bg-gray-100">
            <img
              src={product.image_url}
              alt={product.name}
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* طبقة التفاعل عند التمرير */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2 space-x-reverse">
              <Button size="sm" variant="secondary" className="bg-white hover:bg-gray-100">
                <Eye className="h-4 w-4 ml-1" />
                عرض
              </Button>
              {product.stock > 0 && (
                <Button 
                  size="sm" 
                  onClick={handleAddToCart}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <ShoppingCart className="h-4 w-4 ml-1" />
                  أضف
                </Button>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          {/* اسم المنتج */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 text-right">
            {product.name}
          </h3>

          {/* القسم */}
          <p className="text-sm text-gray-600 mb-2 text-right">
            {product.category}
          </p>

          {/* الوصف المختصر */}
          <p className="text-sm text-gray-700 line-clamp-2 text-right mb-3">
            {product.description}
          </p>

          {/* معلومات المخزون */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              المتوفر: {product.stock}
            </span>
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                كمية محدودة
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="w-full flex items-center justify-between">
            {/* السعر */}
            <div className="text-right">
              <span className="text-2xl font-bold text-black">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* زر الإضافة للسلة */}
            {product.stock > 0 ? (
              <Button 
                onClick={handleAddToCart}
                size="sm"
                className="bg-black hover:bg-gray-800 text-white"
              >
                <ShoppingCart className="h-4 w-4 ml-1" />
                أضف للسلة
              </Button>
            ) : (
              <Button disabled size="sm" variant="outline">
                غير متوفر
              </Button>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default ProductCard;

