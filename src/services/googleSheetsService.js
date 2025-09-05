import axios from 'axios';

class GoogleSheetsService {
  constructor() {
    // 1. المعرّف الصحيح لملف Google Sheet
    this.SHEET_ID = '1GaxEmX22jVOkplDN-QknKEgvPeSCUV2_nOkE1Oy3v5U';
    
    const originalCsvUrl = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=0`;
    
    // 2. استخدام البروكسي لتجاوز مشاكل الاتصال
    this.PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalCsvUrl )}`;

    this.cache = {
      products: null,
      lastFetch: null,
      cacheTimeout: 5 * 60 * 1000 // 5 دقائق
    };
  }

  // 3. تعديل الدالة لتتوافق مع أعمدتك
  csvToJson(csv) {
    const lines = csv.split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const values = this.parseCSVLine(lines[i]);
      const obj = {};
      headers.forEach((header, index) => {
        let value = (values[index] || '').replace(/"/g, '').trim();
        if (['id', 'price', 'stock', 'popularity'].includes(header)) {
          obj[header] = parseInt(value) || 0;
        } else if (header === 'isFeatured') {
          obj['featured'] = value.toLowerCase() === 'true';
        } else if (header === 'image') {
          obj['image_url'] = value;
        } else {
          obj[header] = value;
        }
      });
      if (obj.id && obj.name) result.push(obj);
    }
    return result;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
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
    // سنحاول أولاً من البروكسي
    try {
      console.log('Attempting to fetch data from Google Sheets via proxy...');
      const response = await axios.get(this.PROXY_URL, { timeout: 15000 });
      
      // التأكد من أن البيانات المستلمة ليست رسالة خطأ من البروكسي
      if (response.data && !response.data.includes('error')) {
        const products = this.csvToJson(response.data);
        if (products.length > 0) {
          console.log(`Successfully fetched ${products.length} products.`);
          // حفظ البيانات الناجحة في الكاش
          this.cache.products = products;
          this.cache.lastFetch = Date.now();
          localStorage.setItem('products_cache', JSON.stringify({ products, timestamp: Date.now() }));
          return products;
        }
      }
      // إذا كانت البيانات فارغة أو تحتوي على خطأ، سننتقل إلى قسم catch
      throw new Error('Empty or invalid data from proxy.');

    } catch (error) {
      console.error('Failed to fetch from proxy, will use fallback data.', error);
      
      // 4. إذا فشل كل شيء، نعود إلى الخطة البديلة الآمنة
      //    وهي عرض البيانات الوهمية، تماماً مثلما كان يفعل الكود الأصلي.
      //    هذا يضمن أن تطبيقك لن ينهار.
      return this.getFallbackData();
    }
  }

  // دالة البيانات الوهمية الأصلية من ملفك
  getFallbackData() {
    console.log("Using fallback (dummy) data.");
    const products = [];
    const categories = ['سماعات', 'شاحنات', 'كيبلات', 'لزقات حماية', 'اكسسوارات'];
    const productNames = {
      'سماعات': ['سماعة بلوتوث JBL', 'سماعة Sony', 'سماعة Beats', 'سماعة Bose', 'سماعة AirPods'],
      'شاحنات': ['شاحن سريع Samsung', 'شاحن iPhone', 'شاحن لاسلكي', 'شاحن محمول', 'شاحن سيارة'],
      'كيبلات': ['كيبل USB-C', 'كيبل Lightning', 'كيبل Micro USB', 'كيبل HDMI', 'كيبل AUX'],
      'لزقات حماية': ['واقي شاشة iPhone', 'واقي شاشة Samsung', 'واقي كاميرا', 'جراب حماية', 'واقي ظهر'],
      'اكسسوارات': ['حامل هاتف للسيارة', 'حامل مكتبي', 'مسكة هاتف', 'حقيبة لابتوب', 'ماوس لاسلكي']
    };
    for (let i = 1; i <= 20; i++) { // عدد أقل لسهولة الاختبار
      const category = categories[Math.floor(Math.random() * categories.length)];
      const names = productNames[category];
      const baseName = names[Math.floor(Math.random() * names.length)];
      products.push({
        id: i, name: `${baseName} - موديل وهمي ${i}`, category: category, price: 10000,
        description: `وصف منتج وهمي`, image_url: `https://via.placeholder.com/300`,
        stock: 10, featured: i <= 5
      } );
    }
    return products;
  }

  // بقية الدوال من ملفك الأصلي لضمان التوافق
  async getCategories() {
    const products = await this.fetchProducts();
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }

  async getProductById(id) {
    const products = await this.fetchProducts();
    return products.find(p => p.id === parseInt(id));
  }
}

const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
