import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import BottomNav from './components/layout/BottomNav';
import ToastContainer from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Auth from './pages/Auth';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import AdminAuth from './pages/AdminAuth';
import AuthSuccess from './pages/AuthSuccess';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';

// Scroll to top on route change
import { useEffect } from 'react';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
};

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname.startsWith('/auth');
  const isNoFooterPage = ['/cart', '/wishlist'].includes(location.pathname) || location.pathname.startsWith('/products');

  const isProductsPage = location.pathname === '/products';
  const isProductDetailPage = location.pathname.startsWith('/products/') && location.pathname !== '/products';
  const isCheckoutPage = location.pathname.startsWith('/checkout');
  const isHideBottomNav = isAdminPage || isAuthPage || isProductsPage || isProductDetailPage || isCheckoutPage;

  return (
    <>
      <ScrollToTop />
      {!isAdminPage && !isAuthPage && <Navbar />}
      {!isAdminPage && !isAuthPage && <CartDrawer />}
      <ToastContainer />
      <main className={isAdminPage || isAuthPage ? '' : isProductDetailPage || isProductsPage ? 'min-h-screen pb-0' : isCheckoutPage ? 'min-h-screen pb-16 lg:pb-0' : 'min-h-screen pb-20 md:pb-0'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
        </Routes>
      </main>
      {!isHideBottomNav && <BottomNav />}
      {!isAdminPage && !isAuthPage && !isNoFooterPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <AppContent />
        </Router>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
