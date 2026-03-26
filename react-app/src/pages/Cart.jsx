import { useState } from 'react';
import { useApp } from '../context/AppContext';

const FREE_DELIVERY = 500;
const DELIVERY_CHARGE = 40;
const PROMO_CODES = { ORGANIC10: 0.1, FIRST20: 0.2, SAVE50: 50 };

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart, showNotification } = useApp();
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState('');
    const [promoMsg, setPromoMsg] = useState('');
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [processing, setProcessing] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({ name: '', address: '', city: '', phone: '', payment: 'cod' });

    const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
    const delivery = subtotal >= FREE_DELIVERY ? 0 : DELIVERY_CHARGE;
    const discount = appliedPromo
        ? (PROMO_CODES[appliedPromo] < 1 ? subtotal * PROMO_CODES[appliedPromo] : PROMO_CODES[appliedPromo])
        : 0;
    const total = Math.max(0, subtotal + delivery - discount);

    const handlePromo = () => {
        const code = promoInput.trim().toUpperCase();
        if (!code) { showNotification('Please enter a promo code', 'warning'); return; }
        if (PROMO_CODES[code]) {
            setAppliedPromo(code);
            setPromoMsg(`✅ Code "${code}" applied!`);
            showNotification('Promo code applied!', 'success');
        } else {
            setPromoMsg('❌ Invalid promo code');
            showNotification('Invalid promo code', 'danger');
        }
    };

    const handlePlaceOrder = async e => {
        e.preventDefault();
        setProcessing(true);
        await new Promise(r => setTimeout(r, 1800));
        const id = '#ORG' + Date.now();
        setOrderId(id);
        clearCart();
        setCheckoutOpen(false);
        setSuccessOpen(true);
        setAppliedPromo('');
        setProcessing(false);
    };

    const recommended = [
        { id: 101, name: 'Organic Honey', price: 200, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=300', rating: 4.9, farmer: 'Bee Happy Farms', certified: true },
        { id: 102, name: 'Fresh Basil', price: 30, image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=300', rating: 4.7, farmer: 'Herb Garden', certified: true },
        { id: 103, name: 'Organic Apples', price: 120, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', rating: 4.8, farmer: 'Apple Valley', certified: true },
    ];

    const { addToCart } = useApp();

    if (cart.length === 0 && !successOpen) return (
        <>
            <div className="page-header"><div className="container"><h1>Shopping Cart</h1></div></div>
            <div className="empty-state section">
                <i className="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some fresh organic products!</p>
                <a href="/products" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Shop Now</a>
            </div>
        </>
    );

    return (
        <>
            <div className="page-header"><div className="container"><h1>Shopping Cart</h1><p>{cart.reduce((t, i) => t + i.quantity, 0)} item(s) in your cart</p></div></div>

            <section className="section">
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr min(360px, 100%)', gap: '2rem', alignItems: 'start' }}>
                        {/* Items */}
                        <div>
                            {cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img src={item.image} alt={item.name} />
                                    <div className="cart-item-info">
                                        <h5>{item.name}</h5>
                                        <p><i className="fas fa-store"></i> {item.farmer || 'OrganicFarm'}</p>
                                        {item.certified && <span className="badge badge-success"><i className="fas fa-certificate"></i> Certified</span>}
                                    </div>
                                    <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>₹{item.price}/kg</div>
                                    <div className="qty-control">
                                        <button className="qty-btn" onClick={() => { if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1); else showNotification('Min qty is 1. Use delete to remove.', 'warning'); }}>
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <span className="qty-display">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => { if (item.quantity < 50) updateQuantity(item.id, item.quantity + 1); else showNotification('Max quantity reached', 'warning'); }}>
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <div style={{ fontWeight: 800, color: 'var(--primary)', whiteSpace: 'nowrap' }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                                    <button className="btn btn-sm" style={{ background: '#fde8e8', color: 'var(--danger)', border: 'none' }}
                                        onClick={() => { if (confirm(`Remove ${item.name} from cart?`)) removeFromCart(item.id); }}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}

                            {/* Promo */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.25rem', marginTop: '1rem' }}>
                                <h6 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🏷️ Promo Code</h6>
                                <div className="promo-row">
                                    <input className="form-control" placeholder="ORGANIC10 / FIRST20 / SAVE50" value={promoInput} onChange={e => setPromoInput(e.target.value)} />
                                    <button className="btn btn-primary btn-sm" onClick={handlePromo}>Apply</button>
                                </div>
                                {promoMsg && <p style={{ fontSize: '0.85rem', color: promoMsg.startsWith('✅') ? 'var(--primary)' : 'var(--danger)' }}>{promoMsg}</p>}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="cart-summary">
                            <h4>Order Summary</h4>
                            <div className="summary-row"><span>Items ({cart.reduce((t, i) => t + i.quantity, 0)})</span><span>₹{subtotal.toFixed(2)}</span></div>
                            <div className="summary-row"><span>Delivery</span><span style={{ color: delivery === 0 ? 'var(--primary)' : '' }}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
                            {discount > 0 && <div className="summary-row"><span>Discount</span><span style={{ color: 'var(--primary)' }}>-₹{discount.toFixed(2)}</span></div>}
                            {subtotal < FREE_DELIVERY && (
                                <p style={{ fontSize: '0.82rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                                    Add ₹{(FREE_DELIVERY - subtotal).toFixed(0)} more for FREE delivery!
                                </p>
                            )}
                            <div className="summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                            <button className="btn btn-primary btn-block" style={{ marginTop: '1.25rem' }} onClick={() => setCheckoutOpen(true)}>
                                <i className="fas fa-lock"></i> Proceed to Checkout
                            </button>
                        </div>
                    </div>

                    {/* Recommended */}
                    {cart.length > 0 && (
                        <div style={{ marginTop: '3rem' }}>
                            <h3 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>You Might Also Like</h3>
                            <div className="grid grid-3">
                                {recommended.map(p => (
                                    <div key={p.id} className="product-card">
                                        <div style={{ position: 'relative' }}>
                                            <img src={p.image} alt={p.name} />
                                            <span className="product-badge"><i className="fas fa-certificate"></i> Certified</span>
                                        </div>
                                        <div className="product-info">
                                            <h5>{p.name}</h5>
                                            <p className="product-farmer"><i className="fas fa-store"></i> {p.farmer}</p>
                                            <div className="product-footer">
                                                <span className="product-price">₹{p.price}/kg</span>
                                                <button className="btn btn-primary btn-sm" onClick={() => addToCart(p)}>
                                                    <i className="fas fa-cart-plus"></i> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Checkout Modal */}
            {checkoutOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCheckoutOpen(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <span>Checkout — ₹{total.toFixed(2)}</span>
                            <button className="modal-close" onClick={() => setCheckoutOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handlePlaceOrder}>
                            <div className="modal-body">
                                <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Delivery Address</h6>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input className="form-control" required value={checkoutForm.name} onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address *</label>
                                    <textarea className="form-control" rows={2} required value={checkoutForm.address} onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">City *</label>
                                        <input className="form-control" required value={checkoutForm.city} onChange={e => setCheckoutForm({ ...checkoutForm, city: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone *</label>
                                        <input className="form-control" required value={checkoutForm.phone} onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value.replace(/\D/, '').slice(0, 10) })} />
                                    </div>
                                </div>
                                <h6 style={{ fontWeight: 700, margin: '1rem 0 0.75rem' }}>Payment Method</h6>
                                {[['cod', 'Cash on Delivery'], ['upi', 'UPI'], ['card', 'Credit/Debit Card'], ['netbanking', 'Net Banking']].map(([v, l]) => (
                                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                                        <input type="radio" name="payment" value={v} checked={checkoutForm.payment === v} onChange={() => setCheckoutForm({ ...checkoutForm, payment: v })} />
                                        {l}
                                    </label>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setCheckoutOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? <><span className="spinner"></span> Processing...</> : <><i className="fas fa-check"></i> Place Order</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {successOpen && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <i className="fas fa-check-circle fa-5x" style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'block' }}></i>
                        <h3 style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Order Placed Successfully!</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Thank you! You'll receive a confirmation email shortly.</p>
                        <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '2rem' }}>Order ID: {orderId}</p>
                        <button className="btn btn-primary" onClick={() => setSuccessOpen(false)}>Continue Shopping</button>
                    </div>
                </div>
            )}
        </>
    );
}
