import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { orderApi, addressApi, paymentApi } from '../services/api';

/* ─── Constants ────────────────────────────────────────────────────── */
const FREE_DELIVERY = 500;
const DELIVERY_CHARGE = 40;

/* ─── Inline styles that extend the existing CSS system ──────────── */
const S = {
    page: { background: 'var(--bg-light, #f8faf8)', minHeight: '100vh', paddingBottom: '4rem' },
    layout: { display: 'grid', gridTemplateColumns: '1fr min(420px,100%)', gap: '2rem', alignItems: 'start' },
    section: {
        background: '#fff', borderRadius: 'var(--radius, 12px)',
        border: '1px solid var(--border, #e5e7eb)', padding: '1.5rem', marginBottom: '1.25rem',
    },
    secTitle: { fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    addressCard: (sel) => ({
        border: `2px solid ${sel ? 'var(--primary, #2d8a4e)' : 'var(--border, #e5e7eb)'}`,
        borderRadius: 'var(--radius-sm, 8px)', padding: '1rem', marginBottom: '0.75rem',
        cursor: 'pointer', transition: 'all 0.2s',
        background: sel ? 'rgba(45,138,78,0.04)' : '#fff',
    }),
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.92rem' },
    summaryTotal: { display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', paddingTop: '0.75rem', borderTop: '2px solid var(--border, #e5e7eb)', marginTop: '0.4rem' },
    payBtn: (disabled) => ({
        width: '100%', padding: '1rem', background: disabled ? '#ccc' : 'linear-gradient(135deg, #2d8a4e, #1a6638)',
        color: '#fff', border: 'none', borderRadius: 'var(--radius-sm, 8px)', fontWeight: 800,
        fontSize: '1.05rem', cursor: disabled ? 'not-allowed' : 'pointer', marginTop: '1rem',
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    }),
    spinner: {
        width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block',
    },
    methodCard: (sel) => ({
        border: `2px solid ${sel ? 'var(--primary, #2d8a4e)' : 'var(--border, #e5e7eb)'}`,
        borderRadius: 'var(--radius-sm, 8px)', padding: '0.9rem 1.1rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', marginBottom: '0.6rem',
        background: sel ? 'rgba(45,138,78,0.04)' : '#fff',
    }),
    errorBox: {
        background: '#fde8e8', color: '#c0392b', border: '1px solid #f5c6cb',
        borderRadius: 'var(--radius-sm, 8px)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem',
    },
    badge: { background: 'var(--primary, #2d8a4e)', color: '#fff', borderRadius: '20px', fontSize: '0.7rem', padding: '0.15rem 0.55rem', fontWeight: 700 },
    promoRow: { display: 'flex', gap: '0.5rem' },
    promoInput: { flex: 1, padding: '0.6rem 0.9rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: 'var(--radius-sm, 8px)', fontSize: '0.9rem' },
    promoBtn: (appl) => ({
        padding: '0.6rem 1rem', background: appl ? '#e8f5e9' : 'var(--primary, #2d8a4e)',
        color: appl ? 'var(--primary, #2d8a4e)' : '#fff', border: 'none', borderRadius: 'var(--radius-sm, 8px)',
        fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap',
    }),
    successMsg: { color: 'var(--primary, #2d8a4e)', fontSize: '0.82rem', marginTop: '0.35rem' },
    errorMsg: { color: '#c0392b', fontSize: '0.82rem', marginTop: '0.35rem' },
};

/* ─── Field validation helper ────────────────────────────────────── */
function validate(form) {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.addressLine.trim()) errs.addressLine = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit Indian mobile number';
    return errs;
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function Checkout() {
    const navigate = useNavigate();
    const { cart, clearCart, user, showNotification } = useApp();

    /* ── Address state ─────────────────────────────────────────── */
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null); // null = use typed form
    const [addrMode, setAddrMode] = useState('new'); // 'new' | 'saved'
    const [addrForm, setAddrForm] = useState({
        fullName: user?.name || '',
        addressLine: '',
        city: '',
        state: '',
        pincode: '',
        phone: user?.phone || '',
    });
    const [addrErrors, setAddrErrors] = useState({});
    const [saveAddr, setSaveAddr] = useState(false);

    /* ── Promo state ─────────────────────────────────────────────── */
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount }
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoMsg, setPromoMsg] = useState({ text: '', ok: true });

    /* ── Payment method ─────────────────────────────────────────── */
    const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'ONLINE'

    /* ── Order placement state ───────────────────────────────────── */
    const [placing, setPlacing] = useState(false);
    const [placeError, setPlaceError] = useState('');
    const placingRef = useRef(false); // prevents double-click race condition

    /* ── Computed totals (client-side preview; re-calculated on server) */
    const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
    const delivery = subtotal >= FREE_DELIVERY ? 0 : DELIVERY_CHARGE;
    const discount = appliedPromo ? parseFloat(appliedPromo.discount) : 0;
    const total = Math.max(0, subtotal + delivery - discount);

    /* ── Load saved addresses if user is logged in ─────────────── */
    useEffect(() => {
        if (!user) return;
        addressApi.getAll()
            .then(list => {
                setSavedAddresses(list || []);
                const def = (list || []).find(a => a.isDefault);
                if (def) { setSelectedAddressId(def.id); setAddrMode('saved'); }
            })
            .catch(() => {}); // ignore if backend offline
    }, [user]);

    /* ── Guard: if cart is empty, redirect to cart ───────────────── */
    useEffect(() => {
        if (cart.length === 0) navigate('/cart');
    }, [cart, navigate]);

    /* ── Guard: login required ───────────────────────────────────── */
    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    /* ── Get the active delivery address object ───────────────────── */
    const activeAddress = useCallback(() => {
        if (addrMode === 'saved' && selectedAddressId) {
            const a = savedAddresses.find(x => x.id === selectedAddressId);
            if (a) return { fullName: a.fullName, addressLine: a.addressLine, city: a.city, state: a.state, pincode: a.pincode, phone: a.phone };
        }
        return addrForm;
    }, [addrMode, selectedAddressId, savedAddresses, addrForm]);

    /* ── Apply promo code ────────────────────────────────────────── */
    const handleApplyPromo = async () => {
        const code = promoInput.trim();
        if (!code) { setPromoMsg({ text: 'Please enter a promo code', ok: false }); return; }
        setPromoLoading(true);
        setPromoMsg({ text: '', ok: true });
        try {
            const result = await orderApi.validatePromo(code, subtotal);
            setAppliedPromo({ code: result.code, discount: result.discount });
            setPromoMsg({ text: `✅ "${result.code}" applied! You save ₹${parseFloat(result.discount).toFixed(2)}`, ok: true });
        } catch (err) {
            setPromoMsg({ text: `❌ ${err.message || 'Invalid promo code'}`, ok: false });
            setAppliedPromo(null);
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoInput('');
        setPromoMsg({ text: '', ok: true });
    };

    /* ── Place order ─────────────────────────────────────────────── */
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Prevent double-submit
        if (placingRef.current) return;

        // Validate address
        let addr = activeAddress();
        if (addrMode === 'new') {
            const errs = validate(addrForm);
            if (Object.keys(errs).length > 0) { setAddrErrors(errs); return; }
        }

        placingRef.current = true;
        setPlacing(true);
        setPlaceError('');

        try {
            // Optionally save address
            if (addrMode === 'new' && saveAddr && user) {
                try {
                    await addressApi.save({ ...addrForm, isDefault: savedAddresses.length === 0 });
                } catch { /* don't block order for this */ }
            }

            // Items contain only productId + quantity — NEVER price
            const orderPayload = {
                items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
                promoCode: appliedPromo?.code || null,
                deliveryName: addr.fullName,
                deliveryAddress: addr.addressLine,
                deliveryCity: addr.city,
                deliveryState: addr.state || '',
                deliveryPincode: addr.pincode || '',
                deliveryPhone: addr.phone,
                paymentMethod,
            };

            const order = await orderApi.place(orderPayload);

            if (paymentMethod === 'COD') {
                // COD — order is confirmed immediately
                clearCart();
                navigate('/order-success', {
                    state: {
                        orderRef: order.orderRef,
                        orderId: order.id,
                        total: order.total,
                        paymentMethod: 'COD',
                        paymentStatus: 'pending',
                        deliveryCity: order.deliveryCity,
                        items: order.items,
                    },
                });
            } else {
                // ONLINE — initiate gateway
                const paymentInit = await paymentApi.initiate(order.id);

                // ── DEMO MODE: auto-verify with a fake signature ──────────
                // In production, you would open the Razorpay/Stripe SDK here:
                //   const rzp = new window.Razorpay({
                //     key: 'rzp_test_XXXX', order_id: paymentInit.gatewayOrderId,
                //     amount: paymentInit.amount * 100, currency: 'INR',
                //     handler: async (res) => { await paymentApi.verify({...}); }
                //   });
                //   rzp.open();
                //
                // For now, we simulate a successful verification:
                const verifyResult = await paymentApi.verify({
                    orderId: order.id,
                    gatewayPaymentId: 'DEMO_TXN_' + Date.now(),
                    gatewaySignature: 'DEMO_SIG_' + Date.now(),
                    gatewayOrderId: paymentInit.gatewayOrderId,
                });

                clearCart();
                navigate('/order-success', {
                    state: {
                        orderRef: order.orderRef,
                        orderId: order.id,
                        total: order.total,
                        paymentMethod: 'ONLINE',
                        paymentStatus: verifyResult.success ? 'success' : 'failed',
                        transactionId: verifyResult.transactionId,
                        deliveryCity: order.deliveryCity,
                        items: order.items,
                        paymentMessage: verifyResult.message,
                    },
                });
            }
        } catch (err) {
            setPlaceError(err.message || 'Something went wrong. Please try again.');
            showNotification(err.message || 'Order failed', 'danger');
        } finally {
            setPlacing(false);
            placingRef.current = false;
        }
    };

    if (cart.length === 0) return null; // guarded by useEffect

    return (
        <div style={S.page}>
            {/* Spinner keyframes */}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} .chk-hover:hover{opacity:0.92;transform:translateY(-1px)}`}</style>

            {/* Page Header */}
            <div className="page-header">
                <div className="container">
                    <h1><i className="fas fa-lock" style={{ fontSize: '0.85em', marginRight: '0.5rem' }}></i>Secure Checkout</h1>
                    <p>Complete your order — all transactions are secure &amp; encrypted</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/cart')}>
                            <i className="fas fa-shopping-cart"></i> Cart
                        </span>
                        <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                        <span style={{ fontWeight: 700, color: 'var(--dark)' }}>Checkout</span>
                        <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                        <span>Confirmation</span>
                    </div>

                    <div style={S.layout}>
                        {/* ═══════════════ LEFT COLUMN ═══════════════ */}
                        <div>

                            {/* ── 1. Delivery Address ──────────────────── */}
                            <div style={S.section}>
                                <h3 style={S.secTitle}>
                                    <span style={S.badge}>1</span>
                                    <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary)' }}></i>
                                    Delivery Address
                                </h3>

                                {/* Toggle: Saved / New */}
                                {savedAddresses.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {['saved', 'new'].map(m => (
                                            <button key={m} onClick={() => setAddrMode(m)} style={{
                                                padding: '0.4rem 1rem', borderRadius: '20px', border: '2px solid',
                                                borderColor: addrMode === m ? 'var(--primary)' : 'var(--border)',
                                                background: addrMode === m ? 'var(--primary)' : 'white',
                                                color: addrMode === m ? 'white' : 'var(--dark)',
                                                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                                            }}>
                                                {m === 'saved' ? `Saved Addresses (${savedAddresses.length})` : '+ New Address'}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Saved addresses */}
                                {addrMode === 'saved' && savedAddresses.map(a => (
                                    <div key={a.id} style={S.addressCard(selectedAddressId === a.id)}
                                        onClick={() => setSelectedAddressId(a.id)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '50%',
                                                border: `2px solid var(--primary)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: selectedAddressId === a.id ? 'var(--primary)' : 'white',
                                            }}>
                                                {selectedAddressId === a.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                                            </div>
                                            <strong>{a.fullName}</strong>
                                            {a.isDefault && <span style={S.badge}>Default</span>}
                                        </div>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', paddingLeft: '1.5rem' }}>
                                            {a.addressLine}, {a.city}{a.state ? `, ${a.state}` : ''} {a.pincode}<br />
                                            📞 {a.phone}
                                        </p>
                                    </div>
                                ))}

                                {/* New address form */}
                                {addrMode === 'new' && (
                                    <form onSubmit={(e) => e.preventDefault()}>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Full Name *</label>
                                                <input
                                                    id="chk-fullName"
                                                    className={`form-control ${addrErrors.fullName ? 'is-invalid' : ''}`}
                                                    value={addrForm.fullName}
                                                    onChange={e => { setAddrForm({ ...addrForm, fullName: e.target.value }); setAddrErrors({ ...addrErrors, fullName: '' }); }}
                                                    placeholder="Kishor Kumar"
                                                />
                                                {addrErrors.fullName && <div className="invalid-feedback">{addrErrors.fullName}</div>}
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Mobile Number *</label>
                                                <input
                                                    id="chk-phone"
                                                    className={`form-control ${addrErrors.phone ? 'is-invalid' : ''}`}
                                                    value={addrForm.phone}
                                                    maxLength={10}
                                                    onChange={e => { setAddrForm({ ...addrForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }); setAddrErrors({ ...addrErrors, phone: '' }); }}
                                                    placeholder="9XXXXXXXXX"
                                                />
                                                {addrErrors.phone && <div className="invalid-feedback">{addrErrors.phone}</div>}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">House / Flat No., Street, Locality *</label>
                                            <textarea
                                                id="chk-addressLine"
                                                className={`form-control ${addrErrors.addressLine ? 'is-invalid' : ''}`}
                                                rows={2}
                                                value={addrForm.addressLine}
                                                onChange={e => { setAddrForm({ ...addrForm, addressLine: e.target.value }); setAddrErrors({ ...addrErrors, addressLine: '' }); }}
                                                placeholder="Flat 23B, Green Park Colony, MG Road"
                                            />
                                            {addrErrors.addressLine && <div className="invalid-feedback">{addrErrors.addressLine}</div>}
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">City *</label>
                                                <input
                                                    id="chk-city"
                                                    className={`form-control ${addrErrors.city ? 'is-invalid' : ''}`}
                                                    value={addrForm.city}
                                                    onChange={e => { setAddrForm({ ...addrForm, city: e.target.value }); setAddrErrors({ ...addrErrors, city: '' }); }}
                                                    placeholder="Mumbai"
                                                />
                                                {addrErrors.city && <div className="invalid-feedback">{addrErrors.city}</div>}
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">State</label>
                                                <input
                                                    id="chk-state"
                                                    className="form-control"
                                                    value={addrForm.state}
                                                    onChange={e => setAddrForm({ ...addrForm, state: e.target.value })}
                                                    placeholder="Maharashtra"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">PIN Code</label>
                                                <input
                                                    id="chk-pincode"
                                                    className="form-control"
                                                    value={addrForm.pincode}
                                                    maxLength={6}
                                                    onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                                    placeholder="400001"
                                                />
                                            </div>
                                        </div>
                                        {user && (
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                                                <input type="checkbox" checked={saveAddr} onChange={e => setSaveAddr(e.target.checked)} />
                                                Save this address for future orders
                                            </label>
                                        )}
                                    </form>
                                )}
                            </div>

                            {/* ── 2. Cart Items Summary ─────────────────── */}
                            <div style={S.section}>
                                <h3 style={S.secTitle}>
                                    <span style={S.badge}>2</span>
                                    <i className="fas fa-shopping-bag" style={{ color: 'var(--primary)' }}></i>
                                    Order Items ({cart.reduce((t, i) => t + i.quantity, 0)} items)
                                </h3>
                                {cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '0.85rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--border)' }}>
                                        <img src={item.image} alt={item.name} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                <i className="fas fa-store"></i> {item.farmer || 'OrganicFarm'}
                                            </div>
                                            <div style={{ fontSize: '0.85rem' }}>Qty: <strong>{item.quantity}</strong> × ₹{item.price}</div>
                                        </div>
                                        <div style={{ fontWeight: 800, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── 3. Promo Code ─────────────────────────── */}
                            <div style={S.section}>
                                <h3 style={S.secTitle}>
                                    <span style={S.badge}>3</span>
                                    <i className="fas fa-tag" style={{ color: 'var(--primary)' }}></i>
                                    Promo / Coupon Code
                                </h3>
                                {appliedPromo ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ background: '#e8f5e9', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                                            🏷️ {appliedPromo.code}
                                        </span>
                                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>-₹{parseFloat(appliedPromo.discount).toFixed(2)}</span>
                                        <button onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontWeight: 700 }}>✕ Remove</button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={S.promoRow}>
                                            <input
                                                id="chk-promo"
                                                style={S.promoInput}
                                                placeholder="ORGANIC10 / FIRST20 / SAVE50"
                                                value={promoInput}
                                                onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                                onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                                            />
                                            <button style={S.promoBtn(false)} onClick={handleApplyPromo} disabled={promoLoading}>
                                                {promoLoading ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                        {promoMsg.text && <div style={promoMsg.ok ? S.successMsg : S.errorMsg}>{promoMsg.text}</div>}
                                    </>
                                )}
                            </div>

                            {/* ── 4. Payment Method ────────────────────── */}
                            <div style={S.section}>
                                <h3 style={S.secTitle}>
                                    <span style={S.badge}>4</span>
                                    <i className="fas fa-credit-card" style={{ color: 'var(--primary)' }}></i>
                                    Payment Method
                                </h3>

                                {/* COD */}
                                <div style={S.methodCard(paymentMethod === 'COD')} onClick={() => setPaymentMethod('COD')} id="chk-pay-cod">
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid var(--primary)`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: paymentMethod === 'COD' ? 'var(--primary)' : 'white' }}>
                                        {paymentMethod === 'COD' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                                    </div>
                                    <i className="fas fa-truck" style={{ color: '#e67e22', fontSize: '1.3rem' }}></i>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>Cash on Delivery</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pay when your order arrives</div>
                                    </div>
                                </div>

                                {/* ONLINE */}
                                <div style={S.methodCard(paymentMethod === 'ONLINE')} onClick={() => setPaymentMethod('ONLINE')} id="chk-pay-online">
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid var(--primary)`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: paymentMethod === 'ONLINE' ? 'var(--primary)' : 'white' }}>
                                        {paymentMethod === 'ONLINE' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                                    </div>
                                    <i className="fas fa-credit-card" style={{ color: '#3498db', fontSize: '1.3rem' }}></i>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>Online Payment</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UPI, Cards, Net Banking (Demo Mode — no real charge)</div>
                                    </div>
                                    {paymentMethod === 'ONLINE' && (
                                        <span style={{ ...S.badge, background: '#fff3cd', color: '#856404', marginLeft: 'auto' }}>DEMO</span>
                                    )}
                                </div>

                                {paymentMethod === 'ONLINE' && (
                                    <div style={{ background: '#fff3cd', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#856404', marginTop: '0.5rem' }}>
                                        <i className="fas fa-info-circle"></i>&nbsp;
                                        <strong>Demo Mode:</strong> No actual payment is charged. The gateway integration (Razorpay/Stripe) is ready to plug in — just requires API keys.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ═══════════════ RIGHT COLUMN (Order Summary) ═══════════════ */}
                        <div style={{ position: 'sticky', top: '80px' }}>
                            <div style={S.section}>
                                <h3 style={S.secTitle}>
                                    <i className="fas fa-receipt" style={{ color: 'var(--primary)' }}></i>
                                    Order Summary
                                </h3>

                                {/* Item rows */}
                                {cart.map(item => (
                                    <div key={item.id} style={{ ...S.summaryRow, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <hr style={{ margin: '0.6rem 0' }} />

                                <div style={S.summaryRow}>
                                    <span>Items Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div style={S.summaryRow}>
                                    <span>Delivery</span>
                                    <span style={{ color: delivery === 0 ? 'var(--primary)' : '' }}>
                                        {delivery === 0 ? 'FREE' : `₹${delivery}`}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div style={S.summaryRow}>
                                        <span>Promo Discount</span>
                                        <span style={{ color: 'var(--primary)' }}>-₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                {subtotal < FREE_DELIVERY && (
                                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                        Add ₹{(FREE_DELIVERY - subtotal).toFixed(0)} more for FREE delivery!
                                    </div>
                                )}

                                <div style={S.summaryTotal}>
                                    <span>Grand Total</span>
                                    <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
                                </div>

                                {/* Payment badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0 0.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    <i className="fas fa-lock" style={{ color: 'var(--primary)' }}></i>
                                    {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Secure Online Payment (Demo)'}
                                </div>

                                {/* Error */}
                                {placeError && (
                                    <div style={S.errorBox}>
                                        <i className="fas fa-exclamation-triangle"></i> {placeError}
                                    </div>
                                )}

                                {/* Place Order button */}
                                <button
                                    id="chk-place-order"
                                    className="chk-hover"
                                    style={S.payBtn(placing)}
                                    onClick={handlePlaceOrder}
                                    disabled={placing}
                                >
                                    {placing ? (
                                        <><span style={S.spinner}></span> Processing…</>
                                    ) : (
                                        <><i className="fas fa-lock"></i> Place Order — ₹{total.toFixed(2)}</>
                                    )}
                                </button>

                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem', margin: '0.75rem 0 0' }}>
                                    <i className="fas fa-shield-alt"></i> 100% secure. By placing order you agree to our Terms of Service.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
