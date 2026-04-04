import { useApp } from '../context/AppContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
    { label: 'Dashboard', icon: 'fa-th-large', path: '/dashboard' },
    { label: 'My Orders', icon: 'fa-box', path: '/orders' },
    { label: 'My Cart', icon: 'fa-shopping-cart', path: '/cart' },
    { label: 'Wishlist', icon: 'fa-heart', path: '/dashboard/wishlist' },
    { label: 'Addresses', icon: 'fa-map-marker-alt', path: '/dashboard/addresses' },
    { label: 'Payment Methods', icon: 'fa-credit-card', path: '/dashboard/payments' },
    { divider: true },
    { label: 'Account Settings', icon: 'fa-cog', path: '/dashboard/settings' },
    { label: 'Security', icon: 'fa-shield-alt', path: '/dashboard/security' },
    { label: 'Notifications', icon: 'fa-bell', path: '/dashboard/notifications' },
    { divider: true },
    { label: 'AI Tools', icon: 'fa-brain', path: '/ai-tools' },
    { label: 'Help & Support', icon: 'fa-question-circle', path: '/contact' },
];

const ADMIN_ITEMS = [
    { label: 'Farmer Verification', icon: 'fa-user-check', path: '/dashboard/admin-farmers' },
    { label: 'Manage Products', icon: 'fa-boxes', path: '/dashboard/admin-products' },
];

export default function DashboardSidebar({ isOpen, onClose }) {
    const { user, logout, cartCount } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    if (!user) return null;

    const isFarmer = user?.userType === 'farmer' || user?.role === 'farmer' || user?.type === 'farmer';
    const isAdmin = user?.userType === 'admin' || user?.role === 'admin' || user?.type === 'admin';
    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const handleLogout = () => {
        logout();
        onClose?.();
        navigate('/');
    };

    const handleNavClick = () => {
        onClose?.();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className="dash-sidebar-overlay" onClick={onClose}></div>}

            <aside className={`dash-sidebar ${isOpen ? 'dash-sidebar-open' : ''}`} id="dashboard-sidebar">
                {/* Mobile Close */}
                <button className="dash-sidebar-close" onClick={onClose} aria-label="Close sidebar">
                    <i className="fas fa-times"></i>
                </button>

                {/* User Profile Section */}
                <div className="dash-profile-section">
                    <div className="dash-avatar">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            <span>{initials}</span>
                        )}
                        <div className="dash-avatar-status"></div>
                    </div>
                    <h4 className="dash-user-name">{user.name || 'User'}</h4>
                    <p className="dash-user-email">{user.email || 'No email'}</p>
                    <div className="dash-user-meta">
                        <span className={`dash-role-badge ${isFarmer ? 'dash-role-farmer' : isAdmin ? 'dash-role-admin' : ''}`}>
                            <i className={`fas ${isAdmin ? 'fa-shield-alt' : isFarmer ? 'fa-tractor' : 'fa-user'}`}></i>
                            {isAdmin ? 'Admin' : isFarmer ? 'Farmer' : 'Customer'}
                        </span>
                        <span className="dash-status-badge">
                            <i className="fas fa-check-circle"></i> Active
                        </span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="dash-quick-stats">
                    <Link to="/orders" onClick={handleNavClick} className="dash-stat-item">
                        <i className="fas fa-box" style={{ color: '#0d6efd' }}></i>
                        <span>Orders</span>
                    </Link>
                    <Link to="/cart" onClick={handleNavClick} className="dash-stat-item">
                        <i className="fas fa-shopping-cart" style={{ color: 'var(--primary)' }}></i>
                        <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                    </Link>
                    <Link to="/ai-tools" onClick={handleNavClick} className="dash-stat-item">
                        <i className="fas fa-brain" style={{ color: '#6f42c1' }}></i>
                        <span>AI Tools</span>
                    </Link>
                </div>

                {/* Admin Section */}
                {isAdmin && (
                    <>
                        <div style={{ padding: '0.5rem 1.25rem 0.25rem', fontSize: '0.68rem', fontWeight: 700, color: '#6f42c1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <i className="fas fa-shield-alt" style={{ marginRight: '0.3rem' }}></i> Admin Panel
                        </div>
                        <nav className="dash-nav" style={{ marginBottom: 0 }}>
                            {ADMIN_ITEMS.map(item => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`dash-nav-item dash-nav-admin ${isActive ? 'dash-nav-active' : ''}`}
                                        onClick={handleNavClick}
                                    >
                                        <i className={`fas ${item.icon}`}></i>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="dash-nav-divider"></div>
                    </>
                )}

                {/* Navigation Menu */}
                <nav className="dash-nav">
                    {MENU_ITEMS.map((item, i) => {
                        if (item.divider) return <div key={`d-${i}`} className="dash-nav-divider"></div>;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`dash-nav-item ${isActive ? 'dash-nav-active' : ''}`}
                                onClick={handleNavClick}
                            >
                                <i className={`fas ${item.icon}`}></i>
                                <span>{item.label}</span>
                                {item.label === 'My Cart' && cartCount > 0 && (
                                    <span className="dash-nav-badge">{cartCount}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <button className="dash-logout-btn" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </aside>
        </>
    );
}
