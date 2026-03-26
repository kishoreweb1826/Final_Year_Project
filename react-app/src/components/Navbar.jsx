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

    useEffect(() => { setMenuOpen(false); }, [location]);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.12)' : '0 2px 20px rgba(0,0,0,0.08)' }}>
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <i className="fas fa-leaf"></i>
                    <span>OrganicFarm</span>
                </Link>

                <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    <li><Link to="/" className={isActive('/')}>Home</Link></li>
                    <li><Link to="/products" className={isActive('/products')}>Products</Link></li>
                    {/* Only show 'For Farmers' navigation item when NOT logged in as farmer (farmers go to dashboard) */}
                    {!isFarmer && <li><Link to="/farmers" className={isActive('/farmers')}>For Farmers</Link></li>}
                    <li><Link to="/ai-tools" className={isActive('/ai-tools')}>AI Tools</Link></li>
                    <li><Link to="/about" className={isActive('/about')}>About</Link></li>
                    <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>

                    {user ? (
                        <>
                            {/* Farmer-specific Dashboard link */}
                            {isFarmer && (
                                <li>
                                    <Link
                                        to="/products"
                                        className={isActive('/products')}
                                        style={{
                                            background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
                                            color: '#fff',
                                            borderRadius: '8px',
                                            padding: '0.4rem 0.9rem',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                        }}
                                    >
                                        <i className="fas fa-tractor"></i> Farmer Dashboard
                                    </Link>
                                </li>
                            )}
                            <li>
                                <span style={{
                                    padding: '0.35rem 0.7rem',
                                    fontSize: '0.8rem',
                                    color: isFarmer ? '#2d6a4f' : 'var(--primary)',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    background: isFarmer ? 'rgba(45,106,79,0.1)' : 'rgba(40,167,69,0.08)',
                                    borderRadius: '20px',
                                }}>
                                    <i className={`fas ${isFarmer ? 'fa-tractor' : 'fa-user'}`}></i>
                                    {user.name}
                                    {isFarmer && (
                                        <span style={{
                                            background: '#2d6a4f',
                                            color: '#fff',
                                            fontSize: '0.62rem',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '10px',
                                            fontWeight: 600,
                                            marginLeft: '0.2rem',
                                        }}>FARMER</span>
                                    )}
                                </span>
                            </li>
                            <li>
                                <button
                                    onClick={logout}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: '0.5rem 0.85rem', fontWeight: 500,
                                        color: 'var(--dark)', fontFamily: 'inherit',
                                        fontSize: '0.9rem', borderRadius: '8px', transition: 'all 0.3s'
                                    }}
                                >
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <li><Link to="/login" className={isActive('/login')}><i className="fas fa-user"></i> Login</Link></li>
                    )}
                    <li>
                        <Link to="/cart" className={isActive('/cart')}>
                            <i className="fas fa-shopping-cart"></i>
                            {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
