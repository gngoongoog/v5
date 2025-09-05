import axios from 'axios';

class GoogleSheetsService {
  constructor() {
    // معرف Google Sheets - يجب تحديثه بالمعرف الفعلي
    this.SHEET_ID = 'YOUR_SHEET_ID_HERE';
    this.API_KEY = 'YOUR_API_KEY_HERE'; // اختياري للوصول العام
    this.RANGE = 'Sheet1!A:H'; // النطاق المطلوب قراءته
    
    // رابط CSV للوصول المباشر (بديل أسهل)
    this.CSV_URL = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=0`;
    
    // كاش البيانات
    this.cache = {
      products: null,
      lastFetch: null,
      cacheTimeout: 5 * 60 * 1000 // 5 دقائق
    };
  }

  // تحويل CSV إلى JSON
  csvToJson(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = this.parseCSVLine(lines[i]);
      const obj = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // تنظيف القيم
        value = value.replace(/"/g, '').trim();
        
        // تحويل الأنواع
        if (header === 'id' || header === 'price' || header === 'stock') {
          obj[header] = parseInt(value) || 0;
        } else if (header === 'featured') {
          obj[header] = value.toLowerCase() === 'true';
        } else {
          obj[header] = value;
        }
      });
      
      // التأكد من وجود البيانات الأساسية
      if (obj.id && obj.name) {
        result.push(obj);
      }
    }
    
    return result;
  }

  // تحليل سطر CSV مع التعامل مع الفواصل داخل النصوص
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  // جلب البيانات من Google Sheets
  async fetchProducts() {
    try {
      // التحقق من الكاش
      if (this.cache.products && this.cache.lastFetch) {
        const timeDiff = Date.now() - this.cache.lastFetch;
        if (timeDiff < this.cache.cacheTimeout) {
          console.log('استخدام البيانات من الكاش');
          return this.cache.products;
        }
      }

      console.log('جلب البيانات من Google Sheets...');
      
      // جلب البيانات كـ CSV
      const response = await axios.get(this.CSV_URL, {
        timeout: 10000,
        headers: {
          'Accept': 'text/csv'
        }
      });

      // تحويل CSV إلى JSON
      const products = this.csvToJson(response.data);
      
      // حفظ في الكاش
      this.cache.products = products;
      this.cache.lastFetch = Date.now();
      
      // حفظ في Local Storage
      localStorage.setItem('products_cache', JSON.stringify({
        products,
        timestamp: Date.now()
      }));

      console.log(`تم جلب ${products.length} منتج بنجاح`);
      return products;
      
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      
      // محاولة استخدام البيانات من Local Storage
      const cachedData = localStorage.getItem('products_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        console.log('استخدام البيانات المحفوظة محلياً');
        return parsed.products;
      }
      
      // إرجاع بيانات تجريبية في حالة الفشل
      return this.getFallbackData();
    }
  }

  // بيانات تجريبية في حالة فشل الاتصال
  getFallbackData() {
    const products = [];
    
    // إنشاء 150 منتج تجريبي لاختبار Pagination
    const categories = ['سماعات', 'شاحنات', 'كيبلات', 'لزقات حماية', 'اكسسوارات'];
    const productNames = {
      'سماعات': ['سماعة بلوتوث JBL', 'سماعة Sony', 'سماعة Beats', 'سماعة Bose', 'سماعة AirPods'],
      'شاحنات': ['شاحن سريع Samsung', 'شاحن iPhone', 'شاحن لاسلكي', 'شاحن محمول', 'شاحن سيارة'],
      'كيبلات': ['كيبل USB-C', 'كيبل Lightning', 'كيبل Micro USB', 'كيبل HDMI', 'كيبل AUX'],
      'لزقات حماية': ['واقي شاشة iPhone', 'واقي شاشة Samsung', 'واقي كاميرا', 'جراب حماية', 'واقي ظهر'],
      'اكسسوارات': ['حامل هاتف للسيارة', 'حامل مكتبي', 'مسكة هاتف', 'حقيبة لابتوب', 'ماوس لاسلكي']
    };
    
    for (let i = 1; i <= 150; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const names = productNames[category];
      const baseName = names[Math.floor(Math.random() * names.length)];
      
      products.push({
        id: i,
        name: `${baseName} - موديل ${i}`,
        category: category,
        price: Math.floor(Math.random() * 90000) + 10000, // من 10,000 إلى 100,000
        description: `وصف تفصيلي للمنتج ${baseName} موديل ${i}. منتج عالي الجودة بأفضل الأسعار ومواصفات ممتازة.`,
        image_url: `https://via.placeholder.com/300x300?text=${encodeURIComponent(baseName)}+${i}`,
        stock: Math.floor(Math.random() * 50) + 1,
        featured: i <= 10 // أول 10 منتجات مميزة
      });
    }
    
    return products;
  }

  // جلب المنتجات حسب القسم
  async getProductsByCategory(category) {
    const products = await this.fetchProducts();
    return products.filter(product => product.category === category);
  }

  // جلب منتج واحد بالمعرف
  async getProductById(id) {
    const products = await this.fetchProducts();
    return products.find(product => product.id === parseInt(id));
  }

  // جلب المنتجات المميزة
  async getFeaturedProducts() {
    const products = await this.fetchProducts();
    return products.filter(product => product.featured);
  }

  // جلب جميع الأقسام
  async getCategories() {
    const products = await this.fetchProducts();
    const categories = [...new Set(products.map(product => product.category))];
    return categories;
  }

  // البحث في المنتجات
  async searchProducts(query) {
    const products = await this.fetchProducts();
    const searchTerm = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }

  // تحديث معرف الجدول
  setSheetId(sheetId) {
    this.SHEET_ID = sheetId;
    this.CSV_URL = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    // مسح الكاش عند تغيير المعرف
    this.cache.products = null;
    this.cache.lastFetch = null;
  }

  // مسح الكاش
  clearCache() {
    this.cache.products = null;
    this.cache.lastFetch = null;
    localStorage.removeItem('products_cache');
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
const googleSheetsService = new GoogleSheetsService();

export default googleSheetsService;

