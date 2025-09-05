import axios from 'axios';

class GoogleSheetsService {
  constructor() {
    // رابط CSV الجديد من "Publish to the web"
    this.CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTJpVMBo_g1Mh41ksbktPhCTMOYlKfUkQBYQKFAFXw2oO_C10bOtHjbE4JXvu_Jc1ENUw9o9Yp0vsaX/pub?output=csv';
    
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
        value = value.replace(/"/g, '').trim();
        if (header === 'id' || header === 'price' || header === 'stock') {
          obj[header] = parseInt(value) || 0;
        } else if (header === 'featured') {
          obj[header] = value.toLowerCase() === 'true';
        } else {
          obj[header] = value;
        }
      });
      
      if (obj.id && obj.name) {
        result.push(obj);
      }
    }
    
    return result;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else current += char;
    }
    result.push(current);
    return result;
  }

  async fetchProducts() {
    try {
      if (this.cache.products && this.cache.lastFetch) {
        const timeDiff = Date.now() - this.cache.lastFetch;
        if (timeDiff < this.cache.cacheTimeout) {
          console.log('استخدام البيانات من الكاش');
          return this.cache.products;
        }
      }

      console.log('جلب البيانات من Google Sheets...');

      const response = await axios.get(this.CSV_URL, {
        timeout: 10000,
        headers: { 'Accept': 'text/csv' }
      });

      const products = this.csvToJson(response.data);

      this.cache.products = products;
      this.cache.lastFetch = Date.now();

      if (typeof window !== "undefined") {
        localStorage.setItem('products_cache', JSON.stringify({
          products,
          timestamp: Date.now()
        }));
      }

      console.log(`تم جلب ${products.length} منتج بنجاح`);
      return products;

    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);

      if (typeof window !== "undefined") {
        const cachedData = localStorage.getItem('products_cache');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          console.log('استخدام البيانات المحفوظة محلياً');
          return parsed.products;
        }
      }

      return this.getFallbackData();
    }
  }

  getFallbackData() {
    const products = [];
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
        category,
        price: Math.floor(Math.random() * 90000) + 10000,
        description: `وصف تفصيلي للمنتج ${baseName} موديل ${i}. منتج عالي الجودة بأفضل الأسعار.`,
        image_url: `https://via.placeholder.com/300x300?text=${encodeURIComponent(baseName)}+${i}`,
        stock: Math.floor(Math.random() * 50) + 1,
        featured: i <= 10
      });
    }

    return products;
  }

  async getProductsByCategory(category) {
    const products = await this.fetchProducts();
    return products.filter(p => p.category === category);
  }

  async getProductById(id) {
    const products = await this.fetchProducts();
    return products.find(p => p.id === parseInt(id));
  }

  async getFeaturedProducts() {
    const products = await this.fetchProducts();
    return products.filter(p => p.featured);
  }

  async getCategories() {
    const products = await this.fetchProducts();
    return [...new Set(products.map(p => p.category))];
  }

  async searchProducts(query) {
    const products = await this.fetchProducts();
    const searchTerm = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }

  clearCache() {
    this.cache.products = null;
    this.cache.lastFetch = null;
    if (typeof window !== "undefined") localStorage.removeItem('products_cache');
  }
}

const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
