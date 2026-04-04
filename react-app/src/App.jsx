import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Notifications from './components/Notifications';
import FloatingAIAssistant from './components/FloatingAIAssistant';

import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Farmers from './pages/Farmers';
import AITools from './pages/AITools';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';

import React from 'react';

// Shows the real error instead of a blank white screen
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#1a1a1a', color: '#ff6b6b', minHeight: '100vh' }}>
                    <h2 style={{ color: '#ff6b6b' }}>⚠ App Error</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#ffd700' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: '#aaa' }}>
                        {this.state.error?.stack}
                    </pre>
                    <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Reload</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function App() {
    return (
        <ErrorBoundary>
            <AppProvider>
                <BrowserRouter>
                    <Navbar />
                    <Notifications />
                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/order-success" element={<OrderSuccess />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/farmers" element={<Farmers />} />
                            <Route path="/ai-tools" element={<AITools />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            {/* Dashboard routes */}
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/dashboard/wishlist" element={<Dashboard section="wishlist" />} />
                            <Route path="/dashboard/addresses" element={<Dashboard section="addresses" />} />
                            <Route path="/dashboard/payments" element={<Dashboard section="payments" />} />
                            <Route path="/dashboard/settings" element={<Dashboard section="settings" />} />
                            <Route path="/dashboard/security" element={<Dashboard section="security" />} />
                            <Route path="/dashboard/notifications" element={<Dashboard section="notifications" />} />
                            {/* Admin routes */}
                            <Route path="/dashboard/admin-farmers" element={<Dashboard section="admin-farmers" />} />
                            <Route path="/dashboard/admin-products" element={<Dashboard section="admin-products" />} />
                            <Route path="*" element={
                                <div className="empty-state section">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <h3>Page Not Found</h3>
                                    <p>The page you're looking for doesn't exist.</p>
                                    <a href="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Go Home</a>
                                </div>
                            } />
                        </Routes>
                    </main>
                    <Footer />
                    <FloatingAIAssistant />
                </BrowserRouter>
            </AppProvider>
        </ErrorBoundary>
    );
}
