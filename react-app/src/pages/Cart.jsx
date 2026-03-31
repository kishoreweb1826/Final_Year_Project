import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const FREE_DELIVERY = 500;
const DELIVERY_CHARGE = 40;
// These are for PREVIEW only; the server always recomputes the actual discount
const PROMO_PREVIEW = { ORGANIC10: 0.1, FIRST20: 0.2, SAVE50: 50 };

export default function Cart() {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity, clearCart, showNotification, user, addToCart } = useApp();
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState('');
    const [promoMsg, setPromoMsg] = useState('');

    const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
    const delivery = subtotal >= FREE_DELIVERY ? 0 : DELIVERY_CHARGE;
    const discount = appliedPromo
        ? (PROMO_PREVIEW[appliedPromo] < 1 ? subtotal * PROMO_PREVIEW[appliedPromo] : PROMO_PREVIEW[appliedPromo])
        : 0;
    const total = Math.max(0, subtotal + delivery - discount);

    const handlePromo = () => {
        const code = promoInput.trim().toUpperCase();
        if (!code) { showNotification('Please enter a promo code', 'warning'); return; }
        if (PROMO_PREVIEW[code]) {
            setAppliedPromo(code);
            setPromoMsg(`✅ Code "${code}" applied!`);
            showNotification('Promo code applied!', 'success');
        } else {
            setPromoMsg('❌ Invalid promo code');
            showNotification('Invalid promo code', 'danger');
        }
    };

    const handleCheckout = () => {
        if (!user) {
            showNotification('Please log in to proceed to checkout', 'warning');
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    const recommended = [
        { id: 101, name: 'Organic Honey', price: 200, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=300', rating: 4.9, farmer: 'Bee Happy Farms', certified: true },
        { id: 102, name: 'Fresh Basil', price: 30, image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=300', rating: 4.7, farmer: 'Herb Garden', certified: true },
        { id: 103, name: 'Organic Apples', price: 120, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', rating: 4.8, farmer: 'Apple Valley', certified: true },
    ];

    if (cart.length === 0) return (
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
                                <h6 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🏷️ Promo Code <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(applies in checkout too)</span></h6>
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
                            {discount > 0 && <div className="summary-row"><span>Discount ({appliedPromo})</span><span style={{ color: 'var(--primary)' }}>-₹{discount.toFixed(2)}</span></div>}
                            {subtotal < FREE_DELIVERY && (
                                <p style={{ fontSize: '0.82rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                                    Add ₹{(FREE_DELIVERY - subtotal).toFixed(0)} more for FREE delivery!
                                </p>
                            )}
                            <div className="summary-row total"><span>Total (est.)</span><span>₹{total.toFixed(2)}</span></div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                * Final price is calculated securely on checkout.
                            </p>
                            <button
                                id="cart-checkout-btn"
                                className="btn btn-primary btn-block"
                                style={{ marginTop: '0.75rem' }}
                                onClick={handleCheckout}
                            >
                                <i className="fas fa-lock"></i> Proceed to Checkout
                            </button>
                            <button className="btn btn-sm btn-outline" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => navigate('/products')}>
                                <i className="fas fa-arrow-left"></i> Continue Shopping
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
        </>
    );
}
