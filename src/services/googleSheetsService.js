import axios from 'axios';

class GoogleSheetsService {
  constructor() {
    this.SHEET_ID = '1GaxEmX22jVOkplDN-QknKEgvPeSCUV2_nOkE1Oy3v5U';
    
    // --- تم تعديل هذا الجزء ---
    // الرابط الأصلي لملف CSV
    const originalCsvUrl = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=0`;
    // استخدام خدمة بروكسي لتجاوز مشكلة CORS
    // نقوم بتشفير الرابط الأصلي لضمان عدم حدوث مشاكل
    this.PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalCsvUrl )}`;

    this.cache = {
      products: null,
      lastFetch: null,
      cacheTimeout: 5 * 60 * 1000 // 5 دقائق
    };
  }

  // ... (دالة csvToJson و parseCSVLine تبقى كما هي بدون تغيير)
  csvToJson(csv) {
    const lines = csv.split('\n');
    if (lines.length < 1) return [];
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const values = this.parseCSVLine(lines[i]);
      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        value = value.replace(/"/g, '').trim();
        if (header === 'id' || header === 'price' || header === 'stock' || header === 'popularity') {
          obj[header] = parseInt(value) || 0;
        } else if (header === 'isFeatured') {
          obj['featured'] = value.toLowerCase() === 'true'; 
        } else if (header === 'image') {
          obj['image_url'] = value;
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


  // --- تم تعديل هذه الدالة ---
  async fetchProducts() {
    try {
      if (this.cache.products && this.cache.lastFetch) {
        const timeDiff = Date.now() - this.cache.lastFetch;
        if (timeDiff < this.cache.cacheTimeout) {
          console.log('استخدام البيانات من الكاش');
          return this.cache.products;
        }
      }

      console.log('جلب البيانات من Google Sheets عبر البروكسي...');
      
      // استخدام رابط البروكسي بدلاً من الرابط المباشر
      const response = await axios.get(this.PROXY_URL, { timeout: 15000 }); // زيادة مهلة الانتظار قليلاً

      // البروكسي يرجع البيانات مباشرة كنص CSV في response.data
      const products = this.csvToJson(response.data);
      
      if (products.length === 0) {
          console.warn("تم جلب 0 منتج. الرجاء التحقق من هيكل ملف CSV أو أنه ليس فارغاً.");
      }

      this.cache.products = products;
      this.cache.lastFetch = Date.now();
      localStorage.setItem('products_cache', JSON.stringify({ products, timestamp: Date.now() }));
      console.log(`تم جلب ${products.length} منتج بنجاح`);
      return products;
      
    } catch (error) {
      console.error('خطأ في جلب البيانات عبر البروكسي:', error);
      
      const cachedData = localStorage.getItem('products_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        console.log('استخدام البيانات المحفوظة محلياً');
        return parsed.products;
      }
      
      console.log('فشل الاتصال، سيتم استخدام البيانات الوهمية.');
      return this.getFallbackData();
    }
  }

  // ... (بقية الدوال تبقى كما هي)
  getFallbackData() { /* ... */ return []; } // يمكنك إبقاء البيانات الوهمية هنا
  async getProductsByCategory(category) { const products = await this.fetchProducts(); return products.filter(p => p.category === category); }
  async getProductById(id) { const products = await this.fetchProducts(); return products.find(p => p.id === parseInt(id)); }
  async getFeaturedProducts() { const products = await this.fetchProducts(); return products.filter(p => p.featured); }
  async getCategories() { const products = await this.fetchProducts(); return [...new Set(products.map(p => p.category))]; }
  async searchProducts(query) { const products = await this.fetchProducts(); const q = query.toLowerCase(); return products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)); }
  clearCache() { this.cache.products = null; this.cache.lastFetch = null; localStorage.removeItem('products_cache'); }
}

const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
