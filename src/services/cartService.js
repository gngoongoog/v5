class CartService {
  constructor() {
    this.STORAGE_KEY = 'electronics_store_cart';
    this.cart = this.loadCart();
  }

  // تحميل السلة من Local Storage
  loadCart() {
    try {
      const savedCart = localStorage.getItem(this.STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('خطأ في تحميل السلة:', error);
      return [];
    }
  }

  // حفظ السلة في Local Storage
  saveCart() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cart));
    } catch (error) {
      console.error('خطأ في حفظ السلة:', error);
    }
  }

  // إضافة منتج للسلة
  addToCart(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        quantity: quantity
      });
    }
    
    this.saveCart();
    return this.cart;
  }

  // إزالة منتج من السلة
  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    return this.cart;
  }

  // تحديث كمية منتج في السلة
  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
    
    return this.cart;
  }

  // الحصول على محتويات السلة
  getCart() {
    return this.cart;
  }

  // الحصول على عدد العناصر في السلة
  getCartItemsCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  // الحصول على إجمالي السعر
  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // التحقق من وجود منتج في السلة
  isInCart(productId) {
    return this.cart.some(item => item.id === productId);
  }

  // الحصول على كمية منتج معين في السلة
  getProductQuantity(productId) {
    const item = this.cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }

  // مسح السلة بالكامل
  clearCart() {
    this.cart = [];
    this.saveCart();
    return this.cart;
  }

  // تنسيق السعر
  formatPrice(price) {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0
    }).format(price);
  }

  // إنشاء رسالة WhatsApp
  generateWhatsAppMessage() {
    if (this.cart.length === 0) {
      return 'السلة فارغة';
    }

    let message = '🛒 *طلب جديد من Gn store للجملة*\n\n';
    
    this.cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   القسم: ${item.category}\n`;
      message += `   السعر: ${this.formatPrice(item.price)}\n`;
      message += `   الكمية: ${item.quantity}\n`;
      message += `   المجموع: ${this.formatPrice(item.price * item.quantity)}\n\n`;
    });

    message += `💰 *إجمالي الطلب: ${this.formatPrice(this.getCartTotal())}*\n`;
    message += `📦 *عدد العناصر: ${this.getCartItemsCount()}*\n\n`;
    message += '📞 يرجى التواصل معي لتأكيد الطلب وتحديد طريقة التسليم والدفع.';

    return message;
  }

  // إنشاء رابط WhatsApp
  generateWhatsAppLink(phoneNumber = '+9647707409507') {
    const message = this.generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
  }

  // إرسال الطلب عبر WhatsApp
  sendOrderToWhatsApp(phoneNumber = '+9647707409507') {
    const whatsappLink = this.generateWhatsAppLink(phoneNumber);
    window.open(whatsappLink, '_blank');
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
const cartService = new CartService();

export default cartService;

