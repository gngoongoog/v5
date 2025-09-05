import axios from 'axios';

class GoogleSheetsService {
  constructor() {
    this.SHEET_ID = '1GaxEmX22jVOkplDN-QknKEgvPeSCUV2_nOkE1Oy3v5U';
    const originalCsvUrl = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=0`;
    this.PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalCsvUrl )}`;
    this.cache = { products: null, lastFetch: null, cacheTimeout: 300000 };
  }

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
    try {
      console.log('Attempting to fetch data...');
      const response = await axios.get(this.PROXY_URL, { timeout: 15000 });
      if (response.data && !response.data.includes('error')) {
        const products = this.csvToJson(response.data);
        if (products.length > 0) {
          console.log(`Successfully fetched ${products.length} products.`);
          return products;
        }
      }
      throw new Error('Empty or invalid data from source.');
    } catch (error) {
      console.error('Failed to fetch real data, using fallback.', error);
      return this.getFallbackData();
    }
  }

  getFallbackData() {
    console.log("Using fallback (dummy) data.");
    const products = [];
    const categories = ['سماعات', 'شاحنات', 'كيبلات', 'لزقات حماية', 'اكسسوارات'];
    for (let i = 1; i <= 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      products.push({
        id: i, name: `منتج وهمي ${i}`, category: category, price: 10000,
        description: `وصف منتج وهمي`, image_url: `https://via.placeholder.com/300`,
        stock: 10, featured: i <= 5
      } );
    }
    return products;
  }

  // --- الدالتان المفقودتان تمت إضافتهما هنا ---
  async getFeaturedProducts() {
    const products = await this.fetchProducts();
    return products.filter(product => product.featured);
  }

  async searchProducts(query) {
    const products = await this.fetchProducts();
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
  // -----------------------------------------

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
