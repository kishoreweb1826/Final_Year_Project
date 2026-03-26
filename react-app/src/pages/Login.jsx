import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Known fake/disposable email domains to block
const BLOCKED_DOMAINS = [
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
    'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
    'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net',
    'guerrillamail.org', 'spam4.me', 'trashmail.com', 'trashmail.me', 'trashmail.net',
    'dispostable.com', 'mailnull.com', 'maildrop.cc', 'fakeinbox.com', 'fakeinbox.org',
    'spamgourmet.com', 'spamgourmet.org', 'spamgourmet.net', '10minutemail.com',
    '10minutemail.net', 'discard.email', 'mailnesia.com', 'mailnull.com', 'spamevader.com',
    'tempr.email', 'tempinbox.com', 'getairmail.com', 'armyspy.com', 'cuvox.de',
    'dayrep.com', 'einrot.com', 'fleckens.hu', 'gustr.com', 'jourrapide.com',
    'rhyta.com', 'superrito.com', 'teleworm.us', 'spambog.com', 'spamfree24.org',
    'spammotel.com', 'spam.la', 'spaml.com', 'spamoff.de', 'spamservice.net',
    'tempinbox.co.uk', 'tempemail.co', 'throwam.com', 'trashmail.at', 'trashmail.io',
    'trashmail.xyz', 'mohmal.com', 'mailtemp.net', 'dispostable.com', 'mp-j.tk',
];

// Known real, widely-used email providers
const REAL_PROVIDERS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
    'icloud.com', 'me.com', 'mac.com', 'protonmail.com', 'proton.me',
    'zoho.com', 'aol.com', 'yandex.com', 'yandex.ru', 'mail.com',
    'rediffmail.com', 'tutanota.com', 'fastmail.com', 'gmx.com', 'gmx.net',
    'inbox.com', 'mail.ru', 'qq.com', '163.com', '126.com', 'sina.com',
    // Indian providers
    'sify.com', 'indiatimes.com', 'in.com',
    // Common institutional suffixes
    'edu', 'ac.in', 'gov.in', 'co.in', 'org', 'net',
];

function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getEmailDomain(email) {
    return email.split('@')[1]?.toLowerCase() || '';
}

function isBlockedDomain(email) {
    const domain = getEmailDomain(email);
    return BLOCKED_DOMAINS.includes(domain);
}

function isRealProvider(email) {
    const domain = getEmailDomain(email);
    // Allow if it's a known real provider
    if (REAL_PROVIDERS.some(p => domain === p || domain.endsWith('.' + p))) return true;
    // Allow institutional / business emails (has at least 2-char TLD and domain has dot)
    const parts = domain.split('.');
    if (parts.length >= 2 && parts[parts.length - 1].length >= 2) return true;
    return false;
}

function validateEmail(email) {
    if (!email) return { valid: false, msg: '' };
    if (!isEmailValid(email)) return { valid: false, msg: 'Please enter a valid email (e.g. name@example.com)' };
    if (isBlockedDomain(email)) return { valid: false, msg: 'Disposable/temporary email addresses are not allowed. Please use a real email.' };
    if (!isRealProvider(email)) return { valid: false, msg: 'Please use a real, active email address.' };
    return { valid: true, msg: '' };
}

export default function Login() {
    const { login, showNotification, authApi } = useApp();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
    const [regForm, setRegForm] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        userType: '', agreeTerms: false,
        // Farmer-specific fields
        farmName: '', farmLocation: '', farmSize: '', farmingType: 'organic',
    });
    const [pwStrength, setPwStrength] = useState(0);

    // Email validation states
    const [loginEmailTouched, setLoginEmailTouched] = useState(false);
    const [regEmailTouched, setRegEmailTouched] = useState(false);

    const loginEmailResult = validateEmail(loginForm.email);
    const regEmailResult = validateEmail(regForm.email);

    const calcStrength = pw => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (pw.length >= 12) s++;
        if (/[a-z]/.test(pw)) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^a-zA-Z0-9]/.test(pw)) s++;
        return s;
    };

    const strengthColor = ['#e9ecef', '#dc3545', '#dc3545', '#ffc107', '#ffc107', '#28a745', '#28a745'][pwStrength] || '#e9ecef';
    const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][pwStrength] || '';

    const handleLogin = async e => {
        e.preventDefault();
        const { email, password, remember } = loginForm;
        setLoginEmailTouched(true);
        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) { showNotification(emailCheck.msg || 'Please enter a valid email address', 'warning'); return; }
        if (password.length < 6) { showNotification('Password must be at least 6 characters', 'warning'); return; }
        setLoading(true);
        try {
            const userData = await authApi.login(email, password, remember);
            login(userData, remember);
            showNotification(`Welcome back, ${userData.name}! 🎉`, 'success');
            navigate('/');
        } catch (err) {
            showNotification(err.message || 'Login failed. Please check your credentials.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async e => {
        e.preventDefault();
        const { name, email, phone, password, confirmPassword, userType, agreeTerms } = regForm;
        if (!name.trim()) { showNotification('Please enter your full name', 'warning'); return; }
        setRegEmailTouched(true);
        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) { showNotification(emailCheck.msg || 'Invalid email address', 'warning'); return; }
        if (!/^[6-9]\d{9}$/.test(phone)) { showNotification('Enter a valid 10-digit Indian phone number', 'warning'); return; }
        if (password.length < 8) { showNotification('Password must be at least 8 characters', 'warning'); return; }
        if (password !== confirmPassword) { showNotification('Passwords do not match', 'warning'); return; }
        if (!userType) { showNotification('Please select whether you are a Farmer or Customer', 'warning'); return; }
        if (userType === 'farmer') {
            if (!regForm.farmName.trim()) { showNotification('Please enter your farm name', 'warning'); return; }
            if (!regForm.farmLocation.trim()) { showNotification('Please enter your farm location', 'warning'); return; }
        }
        if (!agreeTerms) { showNotification('Please accept terms & conditions', 'warning'); return; }
        setLoading(true);
        try {
            const payload = {
                name, email, phone, password, confirmPassword, userType,
                ...(userType === 'farmer' ? {
                    farmName: regForm.farmName,
                    farmLocation: regForm.farmLocation,
                    farmSize: regForm.farmSize,
                    farmingType: regForm.farmingType,
                } : {})
            };
            await authApi.register(
                payload.name, payload.email, payload.phone,
                payload.password, payload.confirmPassword, payload.userType
            );
            showNotification('Account created! Please login.', 'success');
            setMode('login');
            setLoginForm(prev => ({ ...prev, email }));
        } catch (err) {
            showNotification(err.message || 'Registration failed. Please try again.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        setTimeout(() => {
            setGoogleLoading(false);
            showNotification('Google Sign-In is not configured yet. Please use email login.', 'warning');
        }, 1200);
    };

    const isFarmer = regForm.userType === 'farmer';

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: isFarmer && mode === 'register' ? '560px' : '460px' }}>
                <div className="auth-card-header" style={{
                    background: isFarmer && mode === 'register'
                        ? 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)'
                        : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark, #218838) 100%)'
                }}>
                    <i className={`fas ${isFarmer && mode === 'register' ? 'fa-tractor' : 'fa-leaf'} fa-2x`} style={{ marginBottom: '0.5rem', display: 'block' }}></i>
                    <h3 style={{ fontWeight: 800, margin: 0 }}>
                        {mode === 'login' ? 'Welcome Back' : isFarmer ? '🌾 Farmer Registration' : 'Join OrganicFarm'}
                    </h3>
                    <p style={{ opacity: 0.85, margin: '0.25rem 0 0' }}>
                        {mode === 'login'
                            ? 'Login to access your account'
                            : isFarmer
                                ? 'Register as a verified farmer to list your products'
                                : 'Create your customer account for free'}
                    </p>
                </div>

                <div className="auth-card-body">
                    {/* Google Sign-In */}
                    <button
                        type="button"
                        className="btn-google"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                    >
                        {googleLoading ? (
                            <><span className="spinner spinner-dark"></span> Connecting...</>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    <path fill="none" d="M0 0h48v48H0z" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    <div className="auth-divider">
                        <span>or {mode === 'login' ? 'login' : 'register'} with email</span>
                    </div>

                    {mode === 'login' ? (
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-with-icon">
                                    <input
                                        className={`form-control${loginEmailTouched && loginForm.email ? (loginEmailResult.valid ? ' input-valid' : ' input-invalid') : ''}`}
                                        type="email"
                                        id="loginEmail"
                                        required
                                        value={loginForm.email}
                                        onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                                        onBlur={() => setLoginEmailTouched(true)}
                                        placeholder="you@example.com"
                                    />
                                    {loginEmailTouched && loginForm.email && (
                                        <span className={`input-icon ${loginEmailResult.valid ? 'valid' : 'invalid'}`}>
                                            <i className={`fas ${loginEmailResult.valid ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                        </span>
                                    )}
                                </div>
                                {loginEmailTouched && loginForm.email && !loginEmailResult.valid && (
                                    <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>
                                        {loginEmailResult.msg}
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input className="form-control" type="password" id="loginPassword" required value={loginForm.password}
                                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="••••••••" />
                            </div>
                            <div className="form-check" style={{ marginBottom: '1.5rem' }}>
                                <input type="checkbox" id="rememberMe" checked={loginForm.remember}
                                    onChange={e => setLoginForm({ ...loginForm, remember: e.target.checked })} />
                                <label htmlFor="rememberMe">Remember me</label>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                {loading ? <><span className="spinner"></span> Logging in...</> : <><i className="fas fa-sign-in-alt"></i> Login</>}
                            </button>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                                Demo: <strong>customer@organicfarm.com</strong> / <strong>Customer@123</strong>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            {/* User Type Selection — shown first */}
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label">I want to register as *</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {[
                                        { value: 'customer', icon: 'fa-user', label: 'Customer', desc: 'Buy fresh organic products' },
                                        { value: 'farmer', icon: 'fa-tractor', label: 'Farmer', desc: 'Sell your farm products' },
                                    ].map(opt => (
                                        <div
                                            key={opt.value}
                                            onClick={() => setRegForm({ ...regForm, userType: opt.value })}
                                            style={{
                                                flex: 1,
                                                padding: '0.85rem',
                                                borderRadius: '12px',
                                                border: `2px solid ${regForm.userType === opt.value ? 'var(--primary)' : 'var(--border, #dee2e6)'}`,
                                                background: regForm.userType === opt.value ? 'rgba(40, 167, 69, 0.08)' : '#fff',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.25s',
                                                boxShadow: regForm.userType === opt.value ? '0 2px 12px rgba(40,167,69,0.15)' : 'none',
                                            }}
                                        >
                                            <i className={`fas ${opt.icon}`} style={{
                                                fontSize: '1.5rem',
                                                color: regForm.userType === opt.value ? 'var(--primary)' : '#aaa',
                                                marginBottom: '0.35rem',
                                                display: 'block',
                                            }}></i>
                                            <strong style={{ fontSize: '0.95rem', color: regForm.userType === opt.value ? 'var(--primary)' : 'var(--dark)' }}>
                                                {opt.label}
                                            </strong>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{opt.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Farmer Banner */}
                            {isFarmer && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #d8f3dc, #b7e4c7)',
                                    border: '1px solid #74c69d',
                                    borderRadius: '10px',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                }}>
                                    <i className="fas fa-info-circle" style={{ color: '#2d6a4f', fontSize: '1.1rem' }}></i>
                                    <span style={{ fontSize: '0.83rem', color: '#2d6a4f', fontWeight: 500 }}>
                                        As a <strong>Farmer</strong>, you'll get access to the Farmer Dashboard to add, edit and manage your products.
                                    </span>
                                </div>
                            )}

                            {/* Basic Info */}
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input className="form-control" required value={regForm.name}
                                    onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                                    placeholder={isFarmer ? 'Farmer full name' : 'Your full name'} />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <div className="input-with-icon">
                                        <input
                                            className={`form-control${regEmailTouched && regForm.email ? (regEmailResult.valid ? ' input-valid' : ' input-invalid') : ''}`}
                                            type="email"
                                            required
                                            value={regForm.email}
                                            onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                                            onBlur={() => setRegEmailTouched(true)}
                                            placeholder="you@example.com"
                                        />
                                        {regEmailTouched && regForm.email && (
                                            <span className={`input-icon ${regEmailResult.valid ? 'valid' : 'invalid'}`}>
                                                <i className={`fas ${regEmailResult.valid ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                            </span>
                                        )}
                                    </div>
                                    {regEmailTouched && regForm.email && !regEmailResult.valid && (
                                        <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>
                                            {regEmailResult.msg}
                                        </small>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone *</label>
                                    <input className="form-control" type="tel" id="registerPhone" required value={regForm.phone}
                                        onChange={e => setRegForm({ ...regForm, phone: e.target.value.replace(/\D/, '').slice(0, 10) })}
                                        placeholder="10-digit mobile number" />
                                </div>
                            </div>

                            {/* Farmer-specific fields */}
                            {isFarmer && (
                                <>
                                    <div style={{
                                        borderTop: '2px dashed #74c69d',
                                        margin: '0.75rem 0',
                                        paddingTop: '0.75rem',
                                    }}>
                                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d6a4f', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <i className="fas fa-seedling"></i> Farm Details
                                        </p>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Farm Name *</label>
                                            <input className="form-control" required value={regForm.farmName}
                                                onChange={e => setRegForm({ ...regForm, farmName: e.target.value })}
                                                placeholder="e.g. Green Valley Farm" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Farm Location *</label>
                                            <input className="form-control" required value={regForm.farmLocation}
                                                onChange={e => setRegForm({ ...regForm, farmLocation: e.target.value })}
                                                placeholder="e.g. Nashik, Maharashtra" />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Farm Size (acres)</label>
                                            <input className="form-control" type="number" min="0" step="0.1" value={regForm.farmSize}
                                                onChange={e => setRegForm({ ...regForm, farmSize: e.target.value })}
                                                placeholder="e.g. 5.5" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Farming Type</label>
                                            <select className="form-select" value={regForm.farmingType}
                                                onChange={e => setRegForm({ ...regForm, farmingType: e.target.value })}>
                                                <option value="organic">Organic</option>
                                                <option value="natural">Natural</option>
                                                <option value="conventional">Conventional</option>
                                                <option value="mixed">Mixed</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Password */}
                            <div className="form-group">
                                <label className="form-label">Password *</label>
                                <input className="form-control" type="password" id="registerPassword" required value={regForm.password}
                                    onChange={e => { setRegForm({ ...regForm, password: e.target.value }); setPwStrength(calcStrength(e.target.value)); }}
                                    placeholder="Min 8 characters" />
                                {regForm.password && (
                                    <>
                                        <div style={{ background: '#e9ecef', height: '6px', borderRadius: '3px', marginTop: '0.35rem', overflow: 'hidden' }}>
                                            <div style={{ width: `${(pwStrength / 6) * 100}%`, background: strengthColor, height: '100%', borderRadius: '3px', transition: 'all 0.3s' }}></div>
                                        </div>
                                        <small style={{ color: strengthColor }}>{strengthLabel}</small>
                                    </>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password *</label>
                                <input className="form-control" type="password" id="confirmPassword" required value={regForm.confirmPassword}
                                    onChange={e => setRegForm({ ...regForm, confirmPassword: e.target.value })} placeholder="Repeat password" />
                                {regForm.confirmPassword && regForm.password !== regForm.confirmPassword && (
                                    <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>Passwords do not match</small>
                                )}
                            </div>

                            <div className="form-check" style={{ marginBottom: '1.5rem' }}>
                                <input type="checkbox" id="agreeTerms" checked={regForm.agreeTerms}
                                    onChange={e => setRegForm({ ...regForm, agreeTerms: e.target.checked })} />
                                <label htmlFor="agreeTerms">I agree to the <a href="#" style={{ color: 'var(--primary)' }}>Terms &amp; Conditions</a></label>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{
                                background: isFarmer ? 'linear-gradient(135deg, #2d6a4f, #40916c)' : undefined
                            }}>
                                {loading
                                    ? <><span className="spinner"></span> Creating Account...</>
                                    : <><i className={`fas ${isFarmer ? 'fa-tractor' : 'fa-user-plus'}`}></i> {isFarmer ? 'Register as Farmer' : 'Create Account'}</>}
                            </button>
                        </form>
                    )}

                    <div className="auth-toggle">
                        {mode === 'login' ? (
                            <>Don't have an account? <span onClick={() => setMode('register')}>Register</span></>
                        ) : (
                            <>Already have an account? <span onClick={() => setMode('login')}>Login</span></>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
