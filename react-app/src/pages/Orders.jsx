import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { orderApi } from '../services/api';

const STATUS_INFO = {
    pending:         { color: '#e67e22', bg: '#fff3cd', label: 'Pending',            icon: 'clock' },
    payment_pending: { color: '#3498db', bg: '#d6eaf8', label: 'Payment Pending',    icon: 'credit-card' },
    payment_failed:  { color: '#c0392b', bg: '#fde8e8', label: 'Payment Failed',     icon: 'times-circle' },
    confirmed:       { color: '#2d8a4e', bg: '#e8f5e9', label: 'Order Confirmed',    icon: 'check-circle' },
    processing:      { color: '#8e44ad', bg: '#f3e8fd', label: 'Processing',          icon: 'cog' },
    shipped:         { color: '#2980b9', bg: '#d6eaf8', label: 'Shipped',             icon: 'shipping-fast' },
    delivered:       { color: '#27ae60', bg: '#e8f5e9', label: 'Delivered',           icon: 'box-open' },
    cancelled:       { color: '#7f8c8d', bg: '#f0f0f0', label: 'Cancelled',           icon: 'ban' },
};

export default function Orders() {
    const navigate = useNavigate();
    const { user } = useApp();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchOrders(0);
    }, [user]);

    const fetchOrders = async (p) => {
        setLoading(true);
        setError('');
        try {
            const data = await orderApi.getMyOrders(p, 10);
            setOrders(data?.content || []);
            setTotalPages(data?.totalPages || 0);
            setPage(p);
        } catch (err) {
            setError(err.message || 'Failed to load orders. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1><i className="fas fa-box" style={{ marginRight: '0.5rem' }}></i>My Orders</h1>
                    <p>Track and manage all your orders</p>
                </div>
            </div>

            <section className="section">
                <div className="container" style={{ maxWidth: '860px' }}>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <i className="fas fa-spinner fa-spin fa-2x"></i>
                            <p>Loading your orders…</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ background: '#fde8e8', border: '1px solid #f5c6cb', borderRadius: '10px', padding: '1rem 1.25rem', color: '#c0392b' }}>
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    )}

                    {!loading && !error && orders.length === 0 && (
                        <div className="empty-state">
                            <i className="fas fa-box-open"></i>
                            <h3>No Orders Yet</h3>
                            <p>You haven't placed any orders. Start shopping!</p>
                            <a href="/products" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                                <i className="fas fa-leaf"></i> Shop Now
                            </a>
                        </div>
                    )}

                    {orders.map(order => {
                        const st = STATUS_INFO[order.status] || STATUS_INFO.pending;
                        return (
                            <div key={order.id} style={{
                                background: '#fff', borderRadius: '14px', border: '1px solid var(--border)',
                                padding: '1.4rem 1.5rem', marginBottom: '1.25rem',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                            }}>
                                {/* Header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{order.orderRef}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <span style={{
                                        background: st.bg, color: st.color,
                                        borderRadius: '20px', padding: '0.3rem 0.9rem',
                                        fontSize: '0.8rem', fontWeight: 700,
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    }}>
                                        <i className={`fas fa-${st.icon}`}></i> {st.label}
                                    </span>
                                </div>

                                {/* Items preview */}
                                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {(order.items || []).slice(0, 4).map(item => (
                                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8faf8', borderRadius: '8px', padding: '0.4rem 0.7rem', fontSize: '0.82rem' }}>
                                            {item.productImage && <img src={item.productImage} alt={item.productName} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />}
                                            <span>{item.productName} ×{item.quantity}</span>
                                        </div>
                                    ))}
                                    {(order.items || []).length > 4 && (
                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                            +{order.items.length - 4} more
                                        </span>
                                    )}
                                </div>

                                {/* Footer row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>
                                            ₹{Number(order.total).toFixed(2)}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                            via {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => navigate(`/orders/${order.id}`)}
                                        >
                                            <i className="fas fa-eye"></i> View Details
                                        </button>
                                        {order.status === 'payment_failed' && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => navigate('/checkout')}
                                            >
                                                <i className="fas fa-redo"></i> Retry Payment
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Delivery info */}
                                {order.deliveryCity && (
                                    <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                        <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary)', marginRight: '0.3rem' }}></i>
                                        Delivering to: {order.deliveryName}, {order.deliveryCity}
                                        {order.status === 'confirmed' && (
                                            <span style={{ marginLeft: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                                                <i className="fas fa-truck"></i> Est. 3-5 days
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-sm btn-outline" disabled={page === 0} onClick={() => fetchOrders(page - 1)}>← Prev</button>
                            <span style={{ padding: '0.4rem 0.75rem', fontSize: '0.88rem' }}>Page {page + 1} of {totalPages}</span>
                            <button className="btn btn-sm btn-outline" disabled={page >= totalPages - 1} onClick={() => fetchOrders(page + 1)}>Next →</button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
