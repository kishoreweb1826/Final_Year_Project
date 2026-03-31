import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
    const { cartCount, user, logout } = useApp();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    const isFarmer = user?.userType === 'farmer' || user?.role === 'farmer' || user?.type === 'farmer';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close menu on route change
    useEffect(() => { setMenuOpen(false); }, [location]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.12)' : '0 2px 20px rgba(0,0,0,0.08)' }}>
            <div className="navbar-inner">
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

                            {/* User name badge */}
                            <li>
                                <span className={`nav-user-badge ${isFarmer ? 'farmer' : ''}`}>
                                    <i className={`fas ${isFarmer ? 'fa-tractor' : 'fa-user'}`}></i>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.name}
                                    </span>
                                    {isFarmer && <span className="nav-farmer-tag">FARMER</span>}
                                </span>
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
                            <Link to="/login" className={isActive('/login')}>
                                <i className="fas fa-user"></i> Login
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
    );
}
