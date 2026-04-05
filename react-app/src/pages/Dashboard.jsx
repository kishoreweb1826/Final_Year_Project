import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { orderApi, adminApi } from '../services/api';
import DashboardSidebar from '../components/DashboardSidebar';

// Placeholder page component for sub-routes
function PlaceholderSection({ icon, title, description, items }) {
    return (
        <div className="dash-placeholder-card">
            <div className="dash-placeholder-icon"><i className={`fas ${icon}`}></i></div>
            <h3>{title}</h3>
            <p>{description}</p>
            {items && (
                <div className="dash-placeholder-items">
                    {items.map((it, i) => (
                        <div key={i} className="dash-placeholder-item">
                            <i className={`fas ${it.icon}`} style={{ color: it.color || 'var(--primary)' }}></i>
                            <div>
                                <strong>{it.label}</strong>
                                <span>{it.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  ADMIN: FARMER VERIFICATION PANEL
// ═══════════════════════════════════════════════════════════
function AdminFarmerVerification() {
    const { showNotification } = useApp();
    const [farmers, setFarmers] = useState([]);
    const [allFarmers, setAllFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [viewTab, setViewTab] = useState('pending');
    const [expandedId, setExpandedId] = useState(null);

    const loadFarmers = async () => {
        setLoading(true);
        try {
            const [pending, all] = await Promise.all([
                adminApi.getPendingFarmers(),
                adminApi.getAllFarmers(),
            ]);
            setFarmers(pending || []);
            setAllFarmers(all || []);
        } catch (err) {
            showNotification('Failed to load farmer data', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadFarmers(); }, []);

    const handleApprove = async (id, name) => {
        if (!confirm(`Approve farmer "${name}"? They will be able to login and sell products.`)) return;
        setActionLoading(id);
        try {
            await adminApi.approveFarmer(id);
            showNotification(`✅ ${name} approved successfully!`, 'success');
            await loadFarmers();
        } catch (err) {
            showNotification(err.message || 'Failed to approve', 'danger');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id, name) => {
        const reason = prompt(`Please enter a reason for rejecting farmer "${name}":`, "Certificate is invalid or expired.");
        if (reason === null) return; // User clicked Cancel
        if (!reason.trim()) return showNotification('A reason is required to reject a farmer', 'warning');

        setActionLoading(id);
        try {
            await adminApi.rejectFarmer(id, reason);
            showNotification(`❌ ${name} has been rejected`, 'info');
            await loadFarmers();
        } catch (err) {
            showNotification(err.message || 'Failed to reject', 'danger');
        } finally {
            setActionLoading(null);
        }
    };

    const displayList = viewTab === 'pending' ? farmers : allFarmers;

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <i className="fas fa-spinner fa-spin fa-2x"></i>
                <p style={{ marginTop: '1rem' }}>Loading farmer registrations...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontWeight: 800, margin: 0 }}>
                    <i className="fas fa-user-check" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
                    Farmer Verification
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setViewTab('pending')}
                        className={`btn btn-sm ${viewTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Pending ({farmers.length})
                    </button>
                    <button
                        onClick={() => setViewTab('all')}
                        className={`btn btn-sm ${viewTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        All Farmers ({allFarmers.length})
                    </button>
                    <button onClick={loadFarmers} className="btn btn-sm btn-outline" title="Refresh">
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>

            {displayList.length === 0 ? (
                <div className="dash-placeholder-card" style={{ textAlign: 'center' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                    <h4>No {viewTab === 'pending' ? 'pending' : ''} farmer registrations</h4>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {viewTab === 'pending' ? 'All farmer applications have been processed.' : 'No farmers have registered yet.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {displayList.map(f => {
                        const isExpanded = expandedId === f.id;
                        const statusColor = f.farmerApproved ? '#28a745' : f.enabled === false ? '#dc3545' : '#e67e22';
                        const statusText = f.farmerApproved ? 'Approved' : f.enabled === false ? 'Rejected' : 'Pending';

                        return (
                            <div key={f.id} className="card" style={{ border: `2px solid ${isExpanded ? 'var(--primary)' : 'var(--border)'}`, transition: 'all 0.3s' }}>
                                <div style={{ padding: '1.25rem' }}>
                                    {/* Header Row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #d8f3dc, #b7e4c7)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800, color: '#2d6a4f', fontSize: '1rem', flexShrink: 0,
                                            }}>
                                                {(f.name || 'F').charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{f.name}</div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{f.email}</div>
                                                {f.phone && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}><i className="fas fa-phone" style={{ marginRight: '0.3rem' }}></i>{f.phone}</div>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                            <span style={{
                                                background: statusColor + '18', color: statusColor,
                                                padding: '0.3rem 0.75rem', borderRadius: '20px',
                                                fontSize: '0.75rem', fontWeight: 700,
                                            }}>
                                                {statusText}
                                            </span>
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : f.id)}
                                                className="btn btn-sm btn-outline"
                                                style={{ padding: '0.3rem 0.6rem' }}
                                            >
                                                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Farm name summary */}
                                    {f.farmName && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                            <i className="fas fa-seedling" style={{ color: 'var(--primary)', marginRight: '0.3rem' }}></i>
                                            {f.farmName} {f.city && `· ${f.city}`} {f.state && `· ${f.state}`}
                                        </div>
                                    )}

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                            <div className="admin-farmer-details">
                                                {f.farmAddress && (
                                                    <div className="admin-detail-row">
                                                        <span className="admin-detail-label">Farm Address</span>
                                                        <span>{f.farmAddress}, {f.city}, {f.state} - {f.pincode}</span>
                                                    </div>
                                                )}
                                                {f.farmSize && (
                                                    <div className="admin-detail-row">
                                                        <span className="admin-detail-label">Farm Size</span>
                                                        <span>{f.farmSize} acres</span>
                                                    </div>
                                                )}
                                                {f.certificationNumber && (
                                                    <div className="admin-detail-row">
                                                        <span className="admin-detail-label">Certificate No.</span>
                                                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{f.certificationNumber}</span>
                                                    </div>
                                                )}
                                                {f.certifyingAuthority && (
                                                    <div className="admin-detail-row">
                                                        <span className="admin-detail-label">Authority</span>
                                                        <span>{f.certifyingAuthority}</span>
                                                    </div>
                                                )}
                                                {f.certificationDate && (
                                                    <div className="admin-detail-row">
                                                        <span className="admin-detail-label">Cert. Date</span>
                                                        <span>{f.certificationDate}</span>
                                                    </div>
                                                )}
                                                {f.cropTypes && f.cropTypes.length > 0 && (
                                                    <div className="admin-detail-row">
                                                        <span className="admin-detail-label">Crop Types</span>
                                                        <span>{f.cropTypes.join(', ')}</span>
                                                    </div>
                                                )}
                                                {f.certificateFilePath && (
                                                    <div className="admin-detail-row">
                                                        <span className="admin-detail-label">Certificate</span>
                                                        <a
                                                            href={adminApi.getCertificateUrl(f.certificateFilePath)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-outline"
                                                            style={{ fontSize: '0.78rem' }}
                                                        >
                                                            <i className="fas fa-file-download"></i> View Certificate
                                                        </a>
                                                    </div>
                                                )}
                                                {f.rejectionReason && (
                                                    <div className="admin-detail-row">
                                                        <span className="admin-detail-label" style={{ color: '#dc3545' }}>Rejection Reason</span>
                                                        <span style={{ color: '#dc3545', fontWeight: 600 }}>{f.rejectionReason}</span>
                                                    </div>
                                                )}
                                                {f.createdAt && (
                                                    <div className="admin-detail-row">
                                                        <span className="admin-detail-label">Registered</span>
                                                        <span>{new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons (only for pending) */}
                                            {!f.farmerApproved && f.enabled !== false && (
                                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleReject(f.id, f.name)}
                                                        className="btn btn-sm btn-danger"
                                                        disabled={actionLoading === f.id}
                                                    >
                                                        {actionLoading === f.id ? <span className="spinner"></span> : <i className="fas fa-times"></i>}
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(f.id, f.name)}
                                                        className="btn btn-sm btn-primary"
                                                        disabled={actionLoading === f.id}
                                                    >
                                                        {actionLoading === f.id ? <span className="spinner"></span> : <i className="fas fa-check"></i>}
                                                        Approve
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  ADMIN: PRODUCT MANAGEMENT
// ═══════════════════════════════════════════════════════════
function AdminProductManagement() {
    const { getProducts, addProduct, updateProduct, deleteProduct, showNotification } = useApp();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', category: 'vegetables', image: '', rating: '', desc: '', farmer: 'OrganicFarm', certified: true });
    const [search, setSearch] = useState('');

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProducts(); }, []);

    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.farmer || '').toLowerCase().includes(q);
    });

    const openAdd = () => { setEditing(null); setForm({ name: '', price: '', category: 'vegetables', image: '', rating: '', desc: '', farmer: 'OrganicFarm', certified: true }); setModalOpen(true); };
    const openEdit = (p) => {
        setEditing(p.id);
        setForm({ name: p.name, price: p.price, category: p.category, image: p.image || '', rating: p.rating, desc: p.desc || '', farmer: p.farmer || '', certified: p.certified ?? true });
        setModalOpen(true);
    };
    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const handleSave = async (e) => {
        e.preventDefault();
        const data = { ...form, price: Number(form.price), rating: Number(form.rating) };
        if (editing) await updateProduct(editing, data);
        else await addProduct(data);
        await loadProducts();
        closeModal();
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete product "${name}"?`)) return;
        await deleteProduct(id);
        await loadProducts();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontWeight: 800, margin: 0 }}>
                    <i className="fas fa-boxes" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
                    Product Management
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                        className="form-control"
                        placeholder="🔍 Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ maxWidth: '200px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    />
                    <button className="btn btn-sm btn-primary" onClick={openAdd}>
                        <i className="fas fa-plus"></i> Add Product
                    </button>
                </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Showing {filtered.length} of {products.length} products
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                    <p>Loading products...</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Rating</th>
                                <th>Farmer</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <img src={p.image || 'https://via.placeholder.com/40'} alt="" style={{ width: 40, height: 40, borderRadius: '8px', objectFit: 'cover' }} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</div>
                                                {p.certified && <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}><i className="fas fa-certificate"></i> Certified</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{p.category}</span></td>
                                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.price}</td>
                                    <td><i className="fas fa-star" style={{ color: '#ffc107', marginRight: '0.2rem' }}></i>{p.rating || 0}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.farmer || '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                                            <button onClick={() => openEdit(p)} className="btn btn-sm" style={{ background: '#e8f4ff', color: '#0066cc', border: 'none', padding: '0.3rem 0.5rem' }}>
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button onClick={() => handleDelete(p.id, p.name)} className="btn btn-sm" style={{ background: '#fde8e8', color: '#dc3545', border: 'none', padding: '0.3rem 0.5rem' }}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <span>{editing ? 'Edit Product' : 'Add Product'}</span>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">Product Name *</label><input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">Price (₹) *</label><input className="form-control" type="number" required min="1" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            {['vegetables', 'fruits', 'grains', 'dairy', 'other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label className="form-label">Rating (0-5)</label><input className="form-control" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} /></div>
                                </div>
                                <div className="form-group"><label className="form-label">Image URL</label><input className="form-control" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Farmer Name</label><input className="form-control" value={form.farmer} onChange={e => setForm({ ...form, farmer: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></div>
                                <div className="form-check">
                                    <input type="checkbox" id="adminCertified" checked={form.certified} onChange={e => setForm({ ...form, certified: e.target.checked })} />
                                    <label htmlFor="adminCertified">Certified Organic</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> {editing ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function Dashboard({ section }) {
    const { user, cartCount } = useApp();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);
    const [orderLoading, setOrderLoading] = useState(false);

    const isAdmin = user?.userType === 'admin' || user?.role === 'admin' || user?.type === 'admin';

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!section || section === 'overview') loadRecentOrders();
    }, [user, section]);

    const loadRecentOrders = async () => {
        setOrderLoading(true);
        try {
            const data = await orderApi.getMyOrders(0, 3);
            setRecentOrders(data?.content || []);
        } catch { /* ignore */ }
        finally { setOrderLoading(false); }
    };

    if (!user) return null;

    const isFarmer = user?.userType === 'farmer' || user?.role === 'farmer' || user?.type === 'farmer';
    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const renderSection = () => {
        switch (section) {
            case 'admin-farmers':
                return isAdmin ? <AdminFarmerVerification /> :
                    <PlaceholderSection icon="fa-lock" title="Access Denied" description="You do not have admin privileges." />;
            case 'admin-products':
                return isAdmin ? <AdminProductManagement /> :
                    <PlaceholderSection icon="fa-lock" title="Access Denied" description="You do not have admin privileges." />;
            case 'wishlist':
                return <PlaceholderSection icon="fa-heart" title="My Wishlist" description="Your saved items will appear here. Browse products to add items to your wishlist."
                    items={[
                        { icon: 'fa-search', label: 'Browse Products', desc: 'Discover organic products', color: 'var(--primary)' },
                        { icon: 'fa-bell', label: 'Price Alerts', desc: 'Get notified on price drops', color: '#ffc107' },
                    ]} />;
            case 'addresses':
                return <PlaceholderSection icon="fa-map-marker-alt" title="Saved Addresses" description="Manage your delivery addresses for faster checkout."
                    items={[
                        { icon: 'fa-home', label: 'Home Address', desc: 'Add your primary delivery address', color: '#0d6efd' },
                        { icon: 'fa-building', label: 'Office Address', desc: 'Add work delivery address', color: '#6f42c1' },
                        { icon: 'fa-plus-circle', label: 'Add New Address', desc: 'Save a new delivery location', color: 'var(--primary)' },
                    ]} />;
            case 'payments':
                return <PlaceholderSection icon="fa-credit-card" title="Payment Methods" description="Manage your saved payment methods for quick checkout."
                    items={[
                        { icon: 'fa-money-bill', label: 'Cash on Delivery', desc: 'Available for all orders', color: 'var(--primary)' },
                        { icon: 'fa-university', label: 'UPI / Net Banking', desc: 'Coming soon', color: '#0d6efd' },
                        { icon: 'fa-credit-card', label: 'Debit/Credit Cards', desc: 'Coming soon', color: '#6f42c1' },
                    ]} />;
            case 'settings':
                return <PlaceholderSection icon="fa-cog" title="Account Settings" description="Manage your account preferences and profile information."
                    items={[
                        { icon: 'fa-user-edit', label: 'Edit Profile', desc: 'Update name, phone, email', color: 'var(--primary)' },
                        { icon: 'fa-globe', label: 'Language', desc: 'Choose preferred language', color: '#fd7e14' },
                        { icon: 'fa-palette', label: 'Preferences', desc: 'Theme and display settings', color: '#6f42c1' },
                    ]} />;
            case 'security':
                return <PlaceholderSection icon="fa-shield-alt" title="Security Settings" description="Keep your account secure with these options."
                    items={[
                        { icon: 'fa-key', label: 'Change Password', desc: 'Update your account password', color: '#dc3545' },
                        { icon: 'fa-mobile-alt', label: 'Two-Factor Auth', desc: 'Add extra security layer', color: '#0d6efd' },
                        { icon: 'fa-history', label: 'Login History', desc: 'View recent login activity', color: '#6c757d' },
                    ]} />;
            case 'notifications':
                return <PlaceholderSection icon="fa-bell" title="Notifications" description="Manage your notification preferences."
                    items={[
                        { icon: 'fa-envelope', label: 'Email Notifications', desc: 'Order updates via email', color: '#0d6efd' },
                        { icon: 'fa-mobile-alt', label: 'SMS Alerts', desc: 'Delivery updates via SMS', color: 'var(--primary)' },
                        { icon: 'fa-tag', label: 'Promotions', desc: 'Deals and offers alerts', color: '#ffc107' },
                    ]} />;
            default:
                return renderOverview();
        }
    };

    const renderOverview = () => (
        <>
            {/* Welcome Banner */}
            <div className="dash-welcome-banner">
                <div>
                    <h2>Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋</h2>
                    <p>Here's a quick overview of your account</p>
                </div>
                <div className="dash-welcome-avatar">
                    {user.avatar ? <img src={user.avatar} alt="" /> : <span>{initials}</span>}
                </div>
            </div>

            {/* Admin Quick Actions */}
            {isAdmin && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#6f42c1' }}>
                        <i className="fas fa-shield-alt" style={{ marginRight: '0.4rem' }}></i> Admin Panel
                    </h5>
                    <div className="dash-overview-grid">
                        <Link to="/dashboard/admin-farmers" className="dash-overview-card" style={{ borderLeft: '4px solid #e67e22' }}>
                            <div className="dash-ov-icon" style={{ background: 'rgba(230,126,34,0.1)', color: '#e67e22' }}>
                                <i className="fas fa-user-check"></i>
                            </div>
                            <div>
                                <h4>Farmer Verification</h4>
                                <p>Review & approve farmers</p>
                            </div>
                        </Link>
                        <Link to="/dashboard/admin-products" className="dash-overview-card" style={{ borderLeft: '4px solid #6f42c1' }}>
                            <div className="dash-ov-icon" style={{ background: 'rgba(111,66,193,0.1)', color: '#6f42c1' }}>
                                <i className="fas fa-boxes"></i>
                            </div>
                            <div>
                                <h4>Manage Products</h4>
                                <p>Add, edit, delete products</p>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Action Cards */}
            <div className="dash-overview-grid">
                <Link to="/orders" className="dash-overview-card">
                    <div className="dash-ov-icon" style={{ background: 'rgba(13,110,253,0.1)', color: '#0d6efd' }}>
                        <i className="fas fa-box"></i>
                    </div>
                    <div>
                        <h4>My Orders</h4>
                        <p>Track & manage orders</p>
                    </div>
                </Link>
                <Link to="/cart" className="dash-overview-card">
                    <div className="dash-ov-icon" style={{ background: 'rgba(45,106,79,0.1)', color: 'var(--primary)' }}>
                        <i className="fas fa-shopping-cart"></i>
                    </div>
                    <div>
                        <h4>Cart {cartCount > 0 && <span style={{ color: 'var(--primary)' }}>({cartCount})</span>}</h4>
                        <p>View your cart items</p>
                    </div>
                </Link>
                <Link to="/products" className="dash-overview-card">
                    <div className="dash-ov-icon" style={{ background: 'rgba(40,167,69,0.1)', color: '#28a745' }}>
                        <i className="fas fa-leaf"></i>
                    </div>
                    <div>
                        <h4>Products</h4>
                        <p>Browse organic products</p>
                    </div>
                </Link>
                <Link to="/ai-tools" className="dash-overview-card">
                    <div className="dash-ov-icon" style={{ background: 'rgba(111,66,193,0.1)', color: '#6f42c1' }}>
                        <i className="fas fa-brain"></i>
                    </div>
                    <div>
                        <h4>AI Tools</h4>
                        <p>Smart farming insights</p>
                    </div>
                </Link>
            </div>

            {/* Account Info Card */}
            <div className="dash-section-grid">
                <div className="dash-info-card">
                    <div className="dash-info-card-header">
                        <h5><i className="fas fa-user-circle"></i> Account Information</h5>
                    </div>
                    <div className="dash-info-card-body">
                        <div className="dash-info-row">
                            <span className="dash-info-label">Full Name</span>
                            <span className="dash-info-value">{user.name || '—'}</span>
                        </div>
                        <div className="dash-info-row">
                            <span className="dash-info-label">Email</span>
                            <span className="dash-info-value">{user.email || '—'}</span>
                        </div>
                        <div className="dash-info-row">
                            <span className="dash-info-label">Phone</span>
                            <span className="dash-info-value">{user.phone || '—'}</span>
                        </div>
                        <div className="dash-info-row">
                            <span className="dash-info-label">Account Type</span>
                            <span className="dash-info-value">
                                <span className={`dash-role-badge ${isFarmer ? 'dash-role-farmer' : isAdmin ? 'dash-role-admin' : ''}`} style={{ fontSize: '0.75rem' }}>
                                    <i className={`fas ${isAdmin ? 'fa-shield-alt' : isFarmer ? 'fa-tractor' : 'fa-user'}`}></i> {isAdmin ? 'Admin' : isFarmer ? 'Farmer' : 'Customer'}
                                </span>
                            </span>
                        </div>
                        <div className="dash-info-row">
                            <span className="dash-info-label">Email Verified</span>
                            <span className="dash-info-value">
                                {user.emailVerified
                                    ? <span style={{ color: 'var(--primary)' }}><i className="fas fa-check-circle"></i> Verified</span>
                                    : <span style={{ color: '#dc3545' }}><i className="fas fa-times-circle"></i> Not Verified</span>}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Card */}
                <div className="dash-info-card">
                    <div className="dash-info-card-header">
                        <h5><i className="fas fa-clock"></i> Recent Orders</h5>
                        <Link to="/orders" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>View All →</Link>
                    </div>
                    <div className="dash-info-card-body">
                        {orderLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <i className="fas fa-spinner fa-spin"></i> Loading...
                            </div>
                        ) : recentOrders.length > 0 ? (
                            recentOrders.map(order => (
                                <div key={order.id} className="dash-recent-order">
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{order.orderRef}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Number(order.total).toFixed(0)}</div>
                                        <span className="dash-order-status" style={{
                                            color: order.status === 'delivered' ? 'var(--primary)' :
                                                order.status === 'cancelled' ? '#dc3545' : '#e67e22',
                                        }}>
                                            {(order.status || 'pending').replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <i className="fas fa-box-open" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block', opacity: 0.4 }}></i>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>No orders yet</p>
                                <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem' }}>Start Shopping →</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Links Section */}
            <div className="dash-quick-links-grid">
                {[
                    { icon: 'fa-map-marker-alt', title: 'Addresses', desc: 'Manage delivery addresses', path: '/dashboard/addresses', color: '#0d6efd' },
                    { icon: 'fa-credit-card', title: 'Payments', desc: 'Payment methods', path: '/dashboard/payments', color: '#6f42c1' },
                    { icon: 'fa-shield-alt', title: 'Security', desc: 'Password & security', path: '/dashboard/security', color: '#dc3545' },
                    { icon: 'fa-heart', title: 'Wishlist', desc: 'Saved items', path: '/dashboard/wishlist', color: '#fd7e14' },
                    { icon: 'fa-bell', title: 'Notifications', desc: 'Alert preferences', path: '/dashboard/notifications', color: '#ffc107' },
                    { icon: 'fa-question-circle', title: 'Help', desc: 'Get support', path: '/contact', color: '#20c997' },
                ].map(item => (
                    <Link key={item.path} to={item.path} className="dash-quick-link-card">
                        <i className={`fas ${item.icon}`} style={{ color: item.color }}></i>
                        <strong>{item.title}</strong>
                        <small>{item.desc}</small>
                    </Link>
                ))}
            </div>
        </>
    );

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1><i className="fas fa-th-large" style={{ marginRight: '0.5rem' }}></i>My Dashboard</h1>
                    <p>Manage your account, orders, and preferences</p>
                </div>
            </div>

            <section className="section" style={{ padding: '2rem 0 4rem' }}>
                <div className="container">
                    <div className="dash-layout">
                        {/* Mobile sidebar toggle */}
                        <button className="dash-mobile-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open account menu">
                            <i className="fas fa-user-circle"></i>
                            <span>Account Menu</span>
                        </button>

                        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                        <div className="dash-main-content">
                            {renderSection()}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
