import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/* ─── Status helpers ────────────────────────────────────────────── */
function statusIcon(paymentStatus) {
    if (paymentStatus === 'success' || paymentStatus === 'pending') return { icon: 'check-circle', color: '#2d8a4e', bg: '#e8f5e9' };
    if (paymentStatus === 'failed')  return { icon: 'times-circle', color: '#c0392b', bg: '#fde8e8' };
    return { icon: 'clock', color: '#e67e22', bg: '#fff3cd' };
}

function statusLabel(paymentMethod, paymentStatus) {
    if (paymentMethod === 'COD') return { label: 'Payment on Delivery', sub: 'Pay when your order arrives' };
    if (paymentStatus === 'success') return { label: 'Payment Successful', sub: 'Your payment has been confirmed' };
    if (paymentStatus === 'failed')  return { label: 'Payment Failed', sub: 'Your cart is still safe. Please retry.' };
    return { label: 'Payment Pending', sub: 'We\'ll process your payment' };
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function OrderSuccess() {
    const navigate = useNavigate();
    const { state } = useLocation();

    // If user navigates here directly without state, redirect home
    useEffect(() => {
        if (!state?.orderRef) navigate('/');
    }, [state, navigate]);

    if (!state?.orderRef) return null;

    const {
        orderRef, orderId, total, paymentMethod, paymentStatus,
        transactionId, deliveryCity, items = [], paymentMessage,
    } = state;

    const { icon, color, bg } = statusIcon(paymentStatus);
    const { label, sub } = statusLabel(paymentMethod, paymentStatus);
    const isSuccess = paymentMethod === 'COD' || paymentStatus === 'success';
    const isFailed  = paymentStatus === 'failed';

    // Estimated delivery: 3-5 days from now
    const estDelivery = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 4);
        return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    })();

    return (
        <div style={{ background: '#f8faf8', minHeight: '100vh', padding: '2rem 0 4rem' }}>
            {/* Confetti-like animation via CSS */}
            <style>{`
                @keyframes bounceIn {
                    0%{transform:scale(0.5);opacity:0}
                    60%{transform:scale(1.1);opacity:1}
                    100%{transform:scale(1)}
                }
                @keyframes fadeUp {
                    from{transform:translateY(20px);opacity:0}
                    to{transform:translateY(0);opacity:1}
                }
                .os-card { animation: fadeUp 0.5s ease both; }
                .os-icon { animation: bounceIn 0.6s ease both 0.2s; }
            `}</style>

            <div className="container" style={{ maxWidth: '700px' }}>

                {/* ── Status Icon Card ─────────────────────────────── */}
                <div className="os-card" style={{
                    background: '#fff', borderRadius: '16px',
                    border: `2px solid ${color}`, padding: '2.5rem 2rem',
                    textAlign: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                }}>
                    <div className="os-icon">
                        <i className={`fas fa-${icon} fa-5x`} style={{ color, display: 'block', marginBottom: '1rem' }}></i>
                    </div>

                    {isSuccess && !isFailed && (
                        <h2 style={{ fontWeight: 900, marginBottom: '0.4rem', color: '#1a1a2e' }}>
                            🎉 Order Placed Successfully!
                        </h2>
                    )}
                    {isFailed && (
                        <h2 style={{ fontWeight: 900, marginBottom: '0.4rem', color: '#c0392b' }}>
                            Payment Failed
                        </h2>
                    )}

                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '1.02rem' }}>
                        {paymentMessage || (isSuccess ? 'Thank you! Your order is being prepared.' : 'Your cart is safe. You can retry payment.')}
                    </p>

                    {/* Order Reference */}
                    <div style={{
                        background: bg, borderRadius: '12px', padding: '1rem 1.5rem',
                        display: 'inline-block', marginBottom: '1.25rem',
                    }}>
                        <div style={{ fontSize: '0.8rem', color, marginBottom: '0.2rem', fontWeight: 600 }}>ORDER REFERENCE</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color, letterSpacing: '1px' }}>{orderRef}</div>
                    </div>

                    {/* Details grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', marginTop: '0.5rem' }}>
                        <InfoBox icon="rupee-sign" label="Amount" value={`₹${Number(total).toFixed(2)}`} />
                        <InfoBox icon="credit-card" label="Payment" value={label} sub={sub} />
                        {transactionId && <InfoBox icon="barcode" label="Transaction ID" value={transactionId} small />}
                        {isSuccess && <InfoBox icon="truck" label="Est. Delivery" value={estDelivery} />}
                        {deliveryCity && <InfoBox icon="map-marker-alt" label="Delivering to" value={deliveryCity} />}
                    </div>
                </div>

                {/* ── Order Items ──────────────────────────────────── */}
                {items.length > 0 && (
                    <div className="os-card" style={{
                        background: '#fff', borderRadius: '16px', border: '1px solid var(--border)',
                        padding: '1.5rem', marginBottom: '1.5rem', animationDelay: '0.15s',
                    }}>
                        <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}>
                            <i className="fas fa-shopping-bag" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
                            Items in this Order
                        </h4>
                        {items.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                {item.productImage && (
                                    <img src={item.productImage} alt={item.productName} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }} />
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700 }}>{item.productName}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.unitPrice}</div>
                                </div>
                                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{Number(item.lineTotal).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Action Buttons ──────────────────────────────── */}
                <div className="os-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', animationDelay: '0.25s' }}>
                    <button
                        id="os-shop-more"
                        className="btn btn-primary"
                        style={{ flex: 1, minWidth: '140px', padding: '0.85rem' }}
                        onClick={() => navigate('/products')}
                    >
                        <i className="fas fa-leaf"></i> Continue Shopping
                    </button>

                    {isFailed && (
                        <button
                            id="os-retry-payment"
                            className="btn btn-outline"
                            style={{ flex: 1, minWidth: '140px', padding: '0.85rem', borderColor: '#c0392b', color: '#c0392b' }}
                            onClick={() => navigate('/checkout')}
                        >
                            <i className="fas fa-redo"></i> Retry Payment
                        </button>
                    )}

                    <button
                        id="os-view-orders"
                        className="btn btn-outline"
                        style={{ flex: 1, minWidth: '140px', padding: '0.85rem' }}
                        onClick={() => navigate('/orders')}
                    >
                        <i className="fas fa-box"></i> My Orders
                    </button>
                </div>

                {/* Trust badges */}
                <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <i className="fas fa-shield-alt" style={{ marginRight: '0.4rem' }}></i>
                    Secure order • Organic certified products •
                    <i className="fas fa-headset" style={{ margin: '0 0.4rem' }}></i>
                    24/7 support
                </div>
            </div>
        </div>
    );
}

/* ── Small info tile component ─── */
function InfoBox({ icon, label, value, sub, small }) {
    return (
        <div style={{ background: '#f8faf8', borderRadius: '10px', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <i className={`fas fa-${icon}`}></i> {label}
            </div>
            <div style={{ fontWeight: 800, fontSize: small ? '0.8rem' : '0.95rem', wordBreak: 'break-all' }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>}
        </div>
    );
}
