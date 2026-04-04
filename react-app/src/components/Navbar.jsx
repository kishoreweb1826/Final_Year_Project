import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
    const { cartCount, user, logout } = useApp();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const drawerRef = useRef(null);

    const isFarmer = user?.userType === 'farmer' || user?.role === 'farmer' || user?.type === 'farmer';
    const isAdmin = user?.userType === 'admin' || user?.role === 'admin' || user?.type === 'admin';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close menu on route change
    useEffect(() => { setMenuOpen(false); setDrawerOpen(false); }, [location]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen || drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen, drawerOpen]);

    // Close drawer on outside click
    useEffect(() => {
        const handler = (e) => {
            if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
                setDrawerOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [drawerOpen]);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        logout();
        setDrawerOpen(false);
        navigate('/');
    };

    const initials = user ? (user.name || user.email || 'U').charAt(0).toUpperCase() : '';

    return (
        <>
            <nav className="navbar" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.12)' : '0 2px 20px rgba(0,0,0,0.08)' }}>
                <div className="navbar-inner">
                    {/* Profile Circle — top-left corner, always visible */}
                    <button
                        className={`navbar-profile-circle ${!user ? 'navbar-profile-guest' : ''}`}
                        onClick={() => user ? setDrawerOpen(!drawerOpen) : navigate('/login')}
                        aria-label={user ? 'Open profile menu' : 'Go to login'}
                        id="navbar-profile-btn"
                        title={user ? 'My Profile' : 'Login / Sign Up'}
                    >
                        {user ? (
                            user.avatar ? (
                                <img src={user.avatar} alt="" className="navbar-profile-img" />
                            ) : (
                                <span className="navbar-profile-initial">{initials}</span>
                            )
                        ) : (
                            <i className="fas fa-user"></i>
                        )}
                        {user && <span className="navbar-profile-dot"></span>}
                    </button>

                    {/* Logo / Brand */}
                    <Link to="/" className="navbar-brand">
                        <i className="fas fa-leaf"></i>
                        <span>OrganicFarm</span>
                    </Link>

                    {/* Hamburger button — visible only on mobile */}
                    <button
                        className={`hamburger ${menuOpen ? 'open' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    {/* Navigation links */}
                    <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                        {/* Primary nav pages */}
                        <li><Link to="/" className={isActive('/')}>Home</Link></li>
                        <li><Link to="/products" className={isActive('/products')}>Products</Link></li>
                        {!isFarmer && (
                            <li><Link to="/farmers" className={isActive('/farmers')}>For Farmers</Link></li>
                        )}
                        <li><Link to="/ai-tools" className={isActive('/ai-tools')}>AI Tools</Link></li>
                        <li><Link to="/about" className={isActive('/about')}>About</Link></li>
                        <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>

                        {/* Divider separating main links from user section */}
                        {user && <li className="nav-divider" aria-hidden="true"></li>}

                        {user ? (
                            <>
                                {/* Farmer Dashboard shortcut */}
                                {isFarmer && (
                                    <li>
                                        <Link
                                            to="/products"
                                            className={isActive('/products')}
                                            style={{
                                                background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
                                                color: '#fff',
                                                borderRadius: '8px',
                                                fontWeight: 700,
                                            }}
                                        >
                                            <i className="fas fa-tractor"></i> Farmer Dashboard
                                        </Link>
                                    </li>
                                )}

                                {/* Admin Dashboard shortcut */}
                                {isAdmin && (
                                    <li>
                                        <Link
                                            to="/dashboard"
                                            className={isActive('/dashboard')}
                                            style={{
                                                background: 'linear-gradient(135deg, #6f42c1, #9b59b6)',
                                                color: '#fff',
                                                borderRadius: '8px',
                                                fontWeight: 700,
                                            }}
                                        >
                                            <i className="fas fa-shield-alt"></i> Admin Panel
                                        </Link>
                                    </li>
                                )}

                                {/* Dashboard */}
                                <li>
                                    <Link to="/dashboard" className={isActive('/dashboard')}>
                                        <i className="fas fa-th-large"></i> Dashboard
                                    </Link>
                                </li>

                                {/* Orders */}
                                <li>
                                    <Link to="/orders" className={isActive('/orders')}>
                                        <i className="fas fa-box"></i> Orders
                                    </Link>
                                </li>

                                {/* Logout */}
                                <li>
                                    <button
                                        onClick={logout}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            color: 'var(--dark)',
                                            fontFamily: 'inherit',
                                            transition: 'all 0.3s',
                                        }}
                                    >
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link to="/login" className={`nav-login-btn ${isActive('/login')}`}>
                                    <i className="fas fa-sign-in-alt"></i> Login / Sign Up
                                </Link>
                            </li>
                        )}

                        {/* Cart — always last */}
                        <li>
                            <Link to="/cart" className={isActive('/cart')} style={{ position: 'relative' }}>
                                <i className="fas fa-shopping-cart"></i>
                                {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* ─── Profile Drawer Overlay ─── */}
            {drawerOpen && <div className="profile-drawer-overlay" onClick={() => setDrawerOpen(false)}></div>}

            {/* ─── Profile Drawer / Sidebar ─── */}
            <aside ref={drawerRef} className={`profile-drawer ${drawerOpen ? 'profile-drawer-open' : ''}`}>
                <button className="profile-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close profile">
                    <i className="fas fa-times"></i>
                </button>

                {user && (
                    <>
                        {/* Profile Header */}
                        <div className="profile-drawer-header">
                            <div className="profile-drawer-avatar">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="" />
                                ) : (
                                    <span>{(user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                                )}
                                <div className="profile-drawer-status"></div>
                            </div>
                            <h4>{user.name || 'User'}</h4>
                            <p>{user.email}</p>
                            <div className="profile-drawer-badges">
                                <span className={`profile-drawer-role ${isFarmer ? 'farmer' : isAdmin ? 'admin' : ''}`}>
                                    <i className={`fas ${isAdmin ? 'fa-shield-alt' : isFarmer ? 'fa-tractor' : 'fa-user'}`}></i>
                                    {isAdmin ? 'Admin' : isFarmer ? 'Farmer' : 'Customer'}
                                </span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="profile-drawer-actions">
                            <Link to="/dashboard" onClick={() => setDrawerOpen(false)} className="profile-drawer-action">
                                <i className="fas fa-th-large" style={{ color: '#0d6efd' }}></i>
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/orders" onClick={() => setDrawerOpen(false)} className="profile-drawer-action">
                                <i className="fas fa-box" style={{ color: '#fd7e14' }}></i>
                                <span>Orders</span>
                            </Link>
                            <Link to="/cart" onClick={() => setDrawerOpen(false)} className="profile-drawer-action">
                                <i className="fas fa-shopping-cart" style={{ color: 'var(--primary)' }}></i>
                                <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                            </Link>
                        </div>

                        {/* Menu Items */}
                        <nav className="profile-drawer-nav">
                            {[
                                { icon: 'fa-user-cog', label: 'Account Settings', path: '/dashboard/settings' },
                                { icon: 'fa-map-marker-alt', label: 'Addresses', path: '/dashboard/addresses' },
                                { icon: 'fa-credit-card', label: 'Payments', path: '/dashboard/payments' },
                                { icon: 'fa-shield-alt', label: 'Security', path: '/dashboard/security' },
                                { icon: 'fa-bell', label: 'Notifications', path: '/dashboard/notifications' },
                                { icon: 'fa-brain', label: 'AI Tools', path: '/ai-tools' },
                                { icon: 'fa-question-circle', label: 'Help & Support', path: '/contact' },
                            ].map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setDrawerOpen(false)}
                                    className={`profile-drawer-item ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    <i className={`fas ${item.icon}`}></i>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Logout */}
                        <button className="profile-drawer-logout" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    </>
                )}
            </aside>
        </>
    );
}
