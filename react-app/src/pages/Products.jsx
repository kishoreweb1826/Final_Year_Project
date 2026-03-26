import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const EMPTY_FORM = { name: '', price: '', category: 'vegetables', image: '', rating: '', desc: '', farmer: 'OrganicFarm', certified: true };

export default function Products() {
    const { getProducts, addProduct, updateProduct, deleteProduct, user } = useApp();
    const isFarmer = user?.userType === 'farmer' || user?.role === 'farmer' || user?.type === 'farmer';
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const searchTimer = useRef(null);

    const [loadingProducts, setLoadingProducts] = useState(false);

    const refresh = async () => {
        setLoadingProducts(true);
        try {
            const data = await getProducts();
            setProducts(data || []);
        } finally {
            setLoadingProducts(false);
        }
    };
    useEffect(() => { refresh(); }, []);

    const filtered = products
        .filter(p => {
            const q = search.toLowerCase();
            const matchQ = p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
            const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
            return matchQ && matchCat;
        })
        .sort((a, b) => {
            if (sort === 'price-low') return a.price - b.price;
            if (sort === 'price-high') return b.price - a.price;
            if (sort === 'rating') return b.rating - a.rating;
            return (b._created || 0) - (a._created || 0);
        });

    const handleSearch = e => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setSearch(e.target.value), 250);
    };

    const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
    const openEdit = (p) => {
        setEditing(p.id);
        setForm({
            name: p.name,
            price: p.price,
            category: p.category,
            image: p.image || p.imageUrl || '',
            rating: p.rating,
            desc: p.desc || p.description || '',
            farmer: p.farmer || p.farmerName || 'OrganicFarm',
            certified: p.certified ?? true
        });
        setModalOpen(true);
    };
    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const handleSave = async e => {
        e.preventDefault();
        const data = { ...form, price: Number(form.price), rating: Number(form.rating) };
        if (editing) await updateProduct(editing, data);
        else await addProduct(data);
        await refresh();
        closeModal();
    };

    const handleDelete = async id => {
        if (!confirm('Delete this product?')) return;
        await deleteProduct(id);
        await refresh();
    };

    const categories = ['all', 'vegetables', 'fruits', 'grains', 'dairy', 'other'];

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>Our Products</h1>
                    <p>Fresh, certified organic produce from trusted farmers</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    {/* Search + Sort + Add */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <input
                            className="form-control"
                            placeholder="🔍 Search products..."
                            onChange={handleSearch}
                            style={{ maxWidth: '280px' }}
                        />
                        <select className="form-select" style={{ maxWidth: '170px' }} value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low → High</option>
                            <option value="price-high">Price: High → Low</option>
                            <option value="rating">Best Rated</option>
                        </select>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {categories.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCategoryFilter(c)}
                                    style={{
                                        padding: '0.4rem 0.9rem',
                                        borderRadius: '50px',
                                        border: '2px solid',
                                        borderColor: categoryFilter === c ? 'var(--primary)' : 'var(--border)',
                                        background: categoryFilter === c ? 'var(--primary)' : 'white',
                                        color: categoryFilter === c ? 'white' : 'var(--dark)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                        {isFarmer && (
                            <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ marginLeft: 'auto' }}>
                                <i className="fas fa-plus"></i> Add Product
                            </button>
                        )}
                        {!isFarmer && !user && (
                            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                <i className="fas fa-info-circle"></i> <a href="/login" style={{ color: 'var(--primary)' }}>Login as farmer</a> to manage products
                            </span>
                        )}
                    </div>

                    {/* Grid */}
                    {loadingProducts ? (
                        <div className="empty-state">
                            <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'var(--primary)' }}></i>
                            <p style={{ marginTop: '1rem' }}>Loading products from server...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-box-open"></i>
                            <h3>No products found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filtered.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    showActions={isFarmer}
                                    onEdit={isFarmer ? openEdit : undefined}
                                    onDelete={isFarmer ? handleDelete : undefined}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Modal */}
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
                                    <div className="form-group">
                                        <label className="form-label">Product Name *</label>
                                        <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Organic Tomatoes" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Price (₹/kg) *</label>
                                        <input className="form-control" type="number" required min="1" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 60" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Category *</label>
                                        <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            {['vegetables', 'fruits', 'grains', 'dairy', 'other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Rating (0–5)</label>
                                        <input className="form-control" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} placeholder="e.g. 4.5" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Image URL</label>
                                    <input className="form-control" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Farmer / Farm Name</label>
                                    <input className="form-control" value={form.farmer} onChange={e => setForm({ ...form, farmer: e.target.value })} placeholder="Farm name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" rows={3} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Short description..." />
                                </div>
                                <div className="form-check">
                                    <input type="checkbox" id="certified" checked={form.certified} onChange={e => setForm({ ...form, certified: e.target.checked })} />
                                    <label htmlFor="certified">Certified Organic</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> {editing ? 'Update' : 'Add'} Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
