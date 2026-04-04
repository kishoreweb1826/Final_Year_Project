import { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const EMPTY_FORM = { name: '', price: '', category: 'vegetables', image: '', rating: '', desc: '', farmer: 'OrganicFarm', certified: true };

// ── Price Prediction Database ────────────────────────────────────────────────
const PRICE_DATABASE = {
    // Vegetables
    tomato: { min: 30, max: 80 }, potato: { min: 20, max: 50 }, onion: { min: 25, max: 70 },
    carrot: { min: 30, max: 60 }, brinjal: { min: 25, max: 55 }, cauliflower: { min: 30, max: 70 },
    cabbage: { min: 20, max: 50 }, spinach: { min: 25, max: 60 }, cucumber: { min: 20, max: 45 },
    capsicum: { min: 40, max: 100 }, beans: { min: 40, max: 90 }, peas: { min: 50, max: 120 },
    ladyfinger: { min: 30, max: 60 }, okra: { min: 30, max: 60 }, beetroot: { min: 25, max: 55 },
    radish: { min: 20, max: 45 }, drumstick: { min: 30, max: 80 }, bitter: { min: 30, max: 70 },
    gourd: { min: 20, max: 50 }, pumpkin: { min: 20, max: 45 }, mushroom: { min: 80, max: 200 },
    broccoli: { min: 60, max: 150 }, lettuce: { min: 40, max: 90 }, garlic: { min: 100, max: 300 },
    ginger: { min: 80, max: 200 }, chilli: { min: 40, max: 100 }, corn: { min: 25, max: 60 },
    // Fruits
    apple: { min: 80, max: 200 }, banana: { min: 30, max: 60 }, mango: { min: 60, max: 200 },
    orange: { min: 40, max: 100 }, grapes: { min: 50, max: 150 }, strawberry: { min: 100, max: 300 },
    pomegranate: { min: 80, max: 200 }, papaya: { min: 30, max: 70 }, watermelon: { min: 15, max: 40 },
    guava: { min: 40, max: 90 }, lemon: { min: 60, max: 150 }, coconut: { min: 30, max: 60 },
    pineapple: { min: 40, max: 100 }, kiwi: { min: 150, max: 400 }, avocado: { min: 150, max: 400 },
    // Grains
    rice: { min: 50, max: 150 }, wheat: { min: 30, max: 80 }, millet: { min: 40, max: 100 },
    ragi: { min: 50, max: 120 }, jowar: { min: 40, max: 90 }, oats: { min: 80, max: 200 },
    quinoa: { min: 200, max: 500 }, barley: { min: 40, max: 100 },
    // Dairy & Other
    milk: { min: 40, max: 80 }, ghee: { min: 400, max: 800 }, butter: { min: 200, max: 500 },
    curd: { min: 30, max: 60 }, paneer: { min: 200, max: 400 }, cheese: { min: 250, max: 600 },
    honey: { min: 150, max: 500 }, jaggery: { min: 60, max: 150 }, turmeric: { min: 100, max: 300 },
    tea: { min: 150, max: 500 }, coffee: { min: 200, max: 600 },
};

const CATEGORY_FALLBACK = {
    vegetables: { min: 20, max: 100 }, fruits: { min: 40, max: 200 },
    grains: { min: 40, max: 150 }, dairy: { min: 40, max: 400 }, other: { min: 30, max: 300 },
};

function predictPrice(name, category) {
    if (!name || !name.trim()) return null;
    const lower = name.toLowerCase().trim();
    // Exact match or partial match in database
    for (const [key, range] of Object.entries(PRICE_DATABASE)) {
        if (lower.includes(key) || key.includes(lower)) return range;
    }
    // Fallback to category range
    return CATEGORY_FALLBACK[category] || CATEGORY_FALLBACK.other;
}

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
                                        <PriceSuggestion name={form.name} category={form.category} currentPrice={form.price} />
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

// ── Price Suggestion Component ───────────────────────────────────────────────
function PriceSuggestion({ name, category, currentPrice }) {
    const prediction = useMemo(() => predictPrice(name, category), [name, category]);
    const price = Number(currentPrice);

    if (!prediction) return null;
    // Hide if user entered a valid price within range
    if (price > 0 && price >= prediction.min * 0.7 && price <= prediction.max * 1.5) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(45,106,79,0.06), rgba(116,198,157,0.1))',
            border: '1px solid rgba(45,106,79,0.15)', borderRadius: '8px',
            padding: '0.6rem 0.85rem', marginTop: '0.5rem',
            display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem',
        }}>
            <i className="fas fa-lightbulb" style={{ color: '#ffc107', fontSize: '1rem', flexShrink: 0 }}></i>
            <div>
                <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.15rem' }}>Suggested Price Range</div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{prediction.min}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{prediction.max}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>per kg</span>
                </div>
                {price > 0 && price < prediction.min * 0.7 && (
                    <small style={{ color: '#dc3545', fontWeight: 500 }}>
                        <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.25rem' }}></i>
                        Price seems too low
                    </small>
                )}
                {price > prediction.max * 1.5 && (
                    <small style={{ color: '#fd7e14', fontWeight: 500 }}>
                        <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.25rem' }}></i>
                        Price seems high for this product
                    </small>
                )}
            </div>
        </div>
    );
}
