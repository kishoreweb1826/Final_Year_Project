import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi, productApi, orderApi, normaliseProduct } from '../services/api';

const AppContext = createContext(null);

// Seed products shown when backend is offline
const SEED_PRODUCTS = [
    { id: 'p_1', name: 'Organic Tomatoes', price: 60, category: 'vegetables', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', rating: 4.5, desc: 'Farm-fresh organic tomatoes.', farmer: 'Green Valley Farm', certified: true, _created: Date.now() },
    { id: 'p_2', name: 'Fresh Strawberries', price: 120, category: 'fruits', image: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400', rating: 4.8, desc: 'Juicy sweet strawberries.', farmer: 'Berry Farms', certified: true, _created: Date.now() },
    { id: 'p_3', name: 'Organic Spinach', price: 40, category: 'vegetables', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', rating: 4.6, desc: 'Fresh leafy spinach.', farmer: 'Sunrise Organic', certified: true, _created: Date.now() },
    { id: 'p_4', name: 'Brown Rice', price: 80, category: 'grains', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400', rating: 4.7, desc: 'Whole grain brown rice.', farmer: 'Golden Harvest', certified: true, _created: Date.now() },
    { id: 'p_5', name: 'Red Apples', price: 150, category: 'fruits', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400', rating: 4.7, desc: 'Crisp and sweet apples.', farmer: 'Apple Valley', certified: true, _created: Date.now() },
    { id: 'p_6', name: 'Organic Honey', price: 200, category: 'other', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400', rating: 4.9, desc: 'Pure raw organic honey.', farmer: 'Bee Happy Farms', certified: true, _created: Date.now() },
];

export function AppProvider({ children }) {

    // ─── Notifications (defined FIRST so all callbacks below can use it) ──
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
    }, []);

    // ─── Cart (localStorage) ──────────────────────────────────────────────
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cart')) || []; }
        catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const cartCount = cart.reduce((t, i) => t + i.quantity, 0);

    const addToCart = useCallback((product) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...product, quantity: 1 }];
        });
        showNotification('Product added to cart!', 'success');
    }, [showNotification]);

    const removeFromCart = useCallback((id) => {
        setCart(prev => prev.filter(i => i.id !== id));
        showNotification('Product removed from cart', 'info');
    }, [showNotification]);

    const updateQuantity = useCallback((id, qty) => {
        if (qty <= 0) { removeFromCart(id); return; }
        setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }, [removeFromCart]);

    const clearCart = useCallback(() => setCart([]), []);

    // ─── Auth ─────────────────────────────────────────────────────────────
    const [user, setUser] = useState(() => {
        try {
            const u = localStorage.getItem('user') || sessionStorage.getItem('user');
            return u ? JSON.parse(u) : null;
        } catch { return null; }
    });

    const login = useCallback((userData, remember = false) => {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(userData));
        storage.setItem('authToken', userData.token);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        ['user', 'authToken'].forEach(k => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });
        setUser(null);
        showNotification('Logged out successfully', 'success');
    }, [showNotification]);

    // ─── Products — backend API with localStorage fallback ────────────────
    const backendOnlineRef = useRef(true);

    const getProducts = useCallback(async () => {
        try {
            const data = await productApi.getAll({ size: 100 });
            backendOnlineRef.current = true;
            const list = (data?.content || data || []).map(normaliseProduct);
            return list.length > 0 ? list : SEED_PRODUCTS;
        } catch {
            backendOnlineRef.current = false;
            try {
                const raw = localStorage.getItem('organic_products_v1');
                return raw ? JSON.parse(raw) : SEED_PRODUCTS;
            } catch { return SEED_PRODUCTS; }
        }
    }, []);

    // Legacy sync wrapper — Pages that call saveProducts(list) still work
    const saveProducts = useCallback((list) => {
        localStorage.setItem('organic_products_v1', JSON.stringify(list));
    }, []);

    const addProduct = useCallback(async (product) => {
        if (backendOnlineRef.current) {
            try {
                const saved = await productApi.create(product);
                showNotification('Product added!', 'success');
                return normaliseProduct(saved);
            } catch (e) {
                showNotification(e.message || 'Failed to add product', 'danger');
                return null;
            }
        }
        // Offline fallback
        const list = (() => { try { return JSON.parse(localStorage.getItem('organic_products_v1') || '[]'); } catch { return []; } })();
        const newProduct = { ...product, id: 'p_' + Math.random().toString(36).slice(2, 9), _created: Date.now() };
        saveProducts([newProduct, ...list]);
        showNotification('Product added!', 'success');
        return newProduct;
    }, [showNotification, saveProducts]);

    const updateProduct = useCallback(async (id, updates) => {
        if (backendOnlineRef.current) {
            try {
                await productApi.update(id, updates);
                showNotification('Product updated!', 'success');
            } catch (e) {
                showNotification(e.message || 'Failed to update product', 'danger');
            }
            return;
        }
        const list = (() => { try { return JSON.parse(localStorage.getItem('organic_products_v1') || '[]'); } catch { return []; } })();
        saveProducts(list.map(p => p.id === id ? { ...p, ...updates } : p));
        showNotification('Product updated!', 'success');
    }, [showNotification, saveProducts]);

    const deleteProduct = useCallback(async (id) => {
        if (backendOnlineRef.current) {
            try {
                await productApi.delete(id);
                showNotification('Product deleted', 'info');
            } catch (e) {
                showNotification(e.message || 'Failed to delete product', 'danger');
            }
            return;
        }
        const list = (() => { try { return JSON.parse(localStorage.getItem('organic_products_v1') || '[]'); } catch { return []; } })();
        saveProducts(list.filter(p => p.id !== id));
        showNotification('Product deleted', 'info');
    }, [showNotification, saveProducts]);

    return (
        <AppContext.Provider value={{
            // Cart
            cart, cartCount, addToCart, removeFromCart, updateQuantity, clearCart,
            // Auth
            user, login, logout,
            // Notifications
            notifications, showNotification,
            // Products
            getProducts, saveProducts, addProduct, updateProduct, deleteProduct,
            // Raw API access for pages
            authApi, orderApi,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
