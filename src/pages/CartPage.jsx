import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useApp } from '../context/AppContext';

const CartPage = () => {
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount,
    formatPrice,
    sendOrderToWhatsApp
  } = useApp();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      sendOrderToWhatsApp();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">سلة التسوق فارغة</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              لم تقم بإضافة أي منتجات إلى سلة التسوق بعد. تصفح منتجاتنا واختر ما يناسبك.
            </p>
            <Link to="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <ArrowRight className="h-5 w-5 ml-2" />
                تصفح المنتجات
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* العنوان */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">سلة التسوق</h1>
          <div className="text-sm text-gray-600">
            {getCartItemsCount()} عنصر
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* قائمة المنتجات */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    {/* صورة المنتج */}
                    <div className="flex-shrink-0">
                      <Link to={`/product/${item.id}`}>
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80?text=صورة';
                          }}
                        />
                      </Link>
                    </div>

                    {/* تفاصيل المنتج */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/product/${item.id}`}
                        className="block hover:text-blue-600 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 truncate text-right">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 text-right">{item.category}</p>
                      <p className="text-lg font-bold text-blue-600 text-right mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* التحكم في الكمية */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* إجمالي سعر العنصر */}
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      
                      {/* زر الحذف */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* زر مسح السلة */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                مسح السلة
              </Button>
            </div>
          </div>

          {/* ملخص الطلب */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-right">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* تفاصيل الأسعار */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>عدد العناصر:</span>
                    <span>{getCartItemsCount()}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-blue-600">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>

                {/* معلومات الشحن */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 text-center">
                    سيتم تحديد تكلفة الشحن عند التواصل معك
                  </p>
                </div>

                {/* زر إتمام الطلب */}
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5 ml-2" />
                  إتمام الطلب عبر واتساب
                </Button>

                {/* معلومات إضافية */}
                <div className="text-xs text-gray-600 text-center space-y-1">
                  <p>• سيتم تحويلك إلى واتساب لإتمام الطلب</p>
                  <p>• يمكنك مناقشة تفاصيل التسليم والدفع</p>
                  <p>• جميع المنتجات أصلية ومضمونة</p>
                </div>

                {/* زر المتابعة للتسوق */}
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    <ArrowRight className="h-4 w-4 ml-2" />
                    متابعة التسوق
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

