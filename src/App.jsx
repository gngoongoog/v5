import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import InstallPrompt from './components/InstallPrompt';
import HomePage from './pages/HomePage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </main>
          
          {/* Install Prompt */}
          <InstallPrompt />
          
          {/* Footer */}
          <footer className="bg-black text-white py-8 mt-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Gn store للجملة</h3>
                  <p className="text-gray-300">
                    أحدث الأجهزة والإكسسوارات بأفضل الأسعار
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li><a href="#" className="hover:text-white transition-colors">الرئيسية</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">المنتجات</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">تواصل معنا</h4>
                  <p className="text-gray-300">
                    واتساب: +9647707409507
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 Gn store للجملة. جميع الحقوق محفوظة.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;

