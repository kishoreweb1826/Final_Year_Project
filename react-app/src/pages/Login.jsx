import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { farmerApi } from '../services/api';

// ─── Email format helpers ─────────────────────────────────────────────────────

function isEmailFormatValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateEmailField(email) {
    const trimmed = (email || '').trim();
    if (!trimmed) return { valid: false, msg: 'Enter your email' };
    if (!isEmailFormatValid(trimmed)) return { valid: false, msg: 'Enter a valid email address' };
    return { valid: true, msg: '' };
}

// ─── OTP Input Component ──────────────────────────────────────────────────────

function OtpInput({ length = 6, value, onChange, disabled }) {
    const inputs = useRef([]);

    const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

    const handleKey = (i, e) => {
        if (e.key === 'Backspace') {
            const next = [...digits];
            if (next[i]) { next[i] = ''; onChange(next.join('')); }
            else if (i > 0) { inputs.current[i - 1]?.focus(); }
        } else if (e.key === 'ArrowLeft' && i > 0) {
            inputs.current[i - 1]?.focus();
        } else if (e.key === 'ArrowRight' && i < length - 1) {
            inputs.current[i + 1]?.focus();
        }
    };

    const handleChange = (i, e) => {
        const char = e.target.value.replace(/\D/g, '').slice(-1);
        if (!char) return;
        const next = [...digits];
        next[i] = char;
        onChange(next.join(''));
        if (i < length - 1) inputs.current[i + 1]?.focus();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (pasted) { onChange(pasted.padEnd(length, '').slice(0, length)); inputs.current[Math.min(pasted.length, length - 1)]?.focus(); }
        e.preventDefault();
    };

    return (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '1.5rem 0' }}>
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    disabled={disabled}
                    onChange={e => handleChange(i, e)}
                    onKeyDown={e => handleKey(i, e)}
                    onPaste={handlePaste}
                    onFocus={e => e.target.select()}
                    style={{
                        width: '48px', height: '56px', textAlign: 'center', fontSize: '1.5rem',
                        fontWeight: 700, borderRadius: '12px', border: `2px solid ${d ? 'var(--primary)' : 'var(--border, #dee2e6)'}`,
                        background: d ? 'rgba(40,167,69,0.06)' : '#fafafa',
                        color: 'var(--dark)', outline: 'none', transition: 'all 0.2s',
                        boxShadow: d ? '0 2px 8px rgba(40,167,69,0.15)' : 'none',
                    }}
                />
            ))}
        </div>
    );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function useCountdown(initialSeconds) {
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef(null);

    const start = useCallback((secs) => {
        setSeconds(secs);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => () => clearInterval(timerRef.current), []);

    return { seconds, start };
}

// ─── OTP Verification Screen ──────────────────────────────────────────────────

function OtpVerificationScreen({ email, onVerified, onBack }) {
    const { verificationApi, showNotification } = useApp();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const { seconds: cooldown, start: startCooldown } = useCountdown(60);

    // Start cooldown immediately when screen mounts (OTP was just sent during register)
    useEffect(() => { startCooldown(60); }, [startCooldown]);

    const handleVerify = async () => {
        if (otp.length !== 6) { showNotification('Please enter the 6-digit code', 'warning'); return; }
        setLoading(true);
        try {
            const res = await verificationApi.verify(email, otp);
            if (res?.success) {
                showNotification('Email verified successfully! 🎉', 'success');
                onVerified();
            } else {
                showNotification(res?.message || 'Invalid or expired verification code', 'danger');
                setOtp('');
            }
        } catch (err) {
            showNotification(err.message || 'Verification failed. Please try again.', 'danger');
            setOtp('');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            const res = await verificationApi.resend(email);
            if (res?.success) {
                showNotification('Verification code resent!', 'success');
                const wait = res.cooldownSeconds || 60;
                startCooldown(wait);
                setOtp('');
            } else {
                const wait = res.cooldownSeconds || 60;
                if (wait > 0) startCooldown(wait);
                showNotification(res?.message || 'Please wait before resending.', 'warning');
            }
        } catch (err) {
            showNotification(err.message || 'Could not resend. Try again later.', 'danger');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="auth-card-body">
            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#d8f3dc,#b7e4c7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto', boxShadow: '0 4px 20px rgba(40,167,69,0.2)',
                }}>
                    <i className="fas fa-envelope-open-text" style={{ fontSize: '1.8rem', color: '#2d6a4f' }} />
                </div>
            </div>

            <h4 style={{ textAlign: 'center', color: 'var(--dark)', fontWeight: 700, marginBottom: '0.4rem' }}>
                Check your email
            </h4>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                We sent a 6-digit verification code to
            </p>
            <p style={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {email}
            </p>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 0 }}>
                Enter the code below. It expires in <strong>10 minutes</strong>.
            </p>

            <OtpInput length={6} value={otp} onChange={setOtp} disabled={loading} />

            <button
                className="btn btn-primary btn-block"
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
                style={{ marginBottom: '0.75rem' }}
            >
                {loading ? <><span className="spinner" /> Verifying...</> : <><i className="fas fa-check-circle" /> Verify Email</>}
            </button>

            {/* Resend */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {cooldown > 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        Resend code in <strong style={{ color: 'var(--primary)' }}>{cooldown}s</strong>
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading}
                        style={{
                            background: 'none', border: 'none', color: 'var(--primary)',
                            fontSize: '0.88rem', cursor: 'pointer', fontWeight: 600, padding: 0,
                        }}
                    >
                        {resendLoading ? 'Sending...' : '↩ Resend verification code'}
                    </button>
                )}
            </div>

            {/* Info box */}
            <div style={{
                background: 'rgba(40,167,69,0.06)', border: '1px solid rgba(40,167,69,0.2)',
                borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#2d6a4f',
                display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
            }}>
                <i className="fas fa-info-circle" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>Check your spam/junk folder if you don't see the email. Only OTP/link verification proves email ownership.</span>
            </div>

            <div className="auth-toggle" style={{ marginTop: '1rem' }}>
                <span onClick={onBack} style={{ cursor: 'pointer' }}>← Back to register</span>
            </div>
        </div>
    );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────

export default function Login() {
    const { login, showNotification, authApi } = useApp();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'verify'
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

    const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
    const [regForm, setRegForm] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        userType: '', agreeTerms: false,
        farmName: '', farmLocation: '', farmSize: '', farmingType: 'organic',
        // Certification fields (farmer only)
        certNumber: '', certDate: '', certAuthority: '',
        farmAddress: '', city: '', state: '', pincode: '',
        cropTypes: [],
    });
    const [pwStrength, setPwStrength] = useState(0);
    const [certFile, setCertFile] = useState(null);
    const [certDragging, setCertDragging] = useState(false);
    const certFileRef = useRef(null);

    const handleCertFile = (file) => {
        const valid = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!valid.includes(file.type)) { showNotification('Please upload PDF, JPG, or PNG (max 5MB)', 'danger'); return; }
        if (file.size > 5 * 1024 * 1024) { showNotification('Certificate file must be less than 5MB', 'danger'); return; }
        setCertFile(file);
        showNotification('Certificate uploaded! ✔', 'success');
    };

    // Email field touch states for validation UI
    const [loginEmailTouched, setLoginEmailTouched] = useState(false);
    const [regEmailTouched, setRegEmailTouched] = useState(false);

    // Debounce refs — avoid recalculating validation on every keystroke
    const loginEmailTimer = useRef(null);
    const regEmailTimer = useRef(null);
    const [loginEmailDisplay, setLoginEmailDisplay] = useState('');
    const [regEmailDisplay, setRegEmailDisplay] = useState('');

    const loginEmailResult = validateEmailField(loginEmailDisplay);
    const regEmailResult = validateEmailField(regEmailDisplay);

    const handleLoginEmailChange = (val) => {
        setLoginForm(prev => ({ ...prev, email: val }));
        clearTimeout(loginEmailTimer.current);
        loginEmailTimer.current = setTimeout(() => setLoginEmailDisplay(val), 400);
    };

    const handleRegEmailChange = (val) => {
        setRegForm(prev => ({ ...prev, email: val }));
        clearTimeout(regEmailTimer.current);
        regEmailTimer.current = setTimeout(() => setRegEmailDisplay(val), 400);
    };

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
        setLoginEmailDisplay(email);
        const emailCheck = validateEmailField(email);
        if (!emailCheck.valid) { showNotification(emailCheck.msg, 'warning'); return; }
        if (password.length < 6) { showNotification('Password must be at least 6 characters', 'warning'); return; }
        setLoading(true);
        try {
            const userData = await authApi.login(email, password, remember);
            login(userData, remember);
            if (!userData.emailVerified) {
                // Account exists but email not yet verified — go to OTP screen
                setPendingEmail(email.trim().toLowerCase());
                showNotification('Please verify your email address to continue.', 'warning');
                setMode('verify');
            } else {
                showNotification(`Welcome back, ${userData.name}! 🎉`, 'success');
                navigate('/');
            }
        } catch (err) {
            showNotification(err.message || 'Login failed. Please check your credentials.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const STATES_LIST = ['Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];
    const CROPS_LIST = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Herbs', 'Cotton', 'Sugarcane', 'Other'];

    const handleRegister = async e => {
        e.preventDefault();
        const { name, email, phone, password, confirmPassword, userType, agreeTerms } = regForm;
        if (!name.trim()) { showNotification('Please enter your full name', 'warning'); return; }
        setRegEmailTouched(true);
        setRegEmailDisplay(email);
        const emailCheck = validateEmailField(email);
        if (!emailCheck.valid) { showNotification(emailCheck.msg, 'warning'); return; }
        if (!/^[6-9]\d{9}$/.test(phone)) { showNotification('Enter a valid 10-digit Indian phone number', 'warning'); return; }
        if (password.length < 8) { showNotification('Password must be at least 8 characters', 'warning'); return; }
        if (password !== confirmPassword) { showNotification('Passwords do not match', 'warning'); return; }
        if (!userType) { showNotification('Please select whether you are a Farmer or Customer', 'warning'); return; }
        if (userType === 'farmer') {
            if (!regForm.farmName.trim()) { showNotification('Please enter your farm name', 'warning'); return; }
            if (!regForm.farmAddress.trim()) { showNotification('Please enter your farm address', 'warning'); return; }
            if (!regForm.city.trim()) { showNotification('Please enter your city', 'warning'); return; }
            if (!regForm.state) { showNotification('Please select your state', 'warning'); return; }
            if (!/^\d{6}$/.test(regForm.pincode)) { showNotification('Enter a valid 6-digit pincode', 'warning'); return; }
            if (!regForm.certNumber.trim()) { showNotification('Please enter your certification number', 'warning'); return; }
            if (!regForm.certDate) { showNotification('Please enter the certification date', 'warning'); return; }
            if (!regForm.certAuthority) { showNotification('Please select the certifying authority', 'warning'); return; }
            if (!certFile) { showNotification('Please upload your organic certification document', 'warning'); return; }
        }
        if (!agreeTerms) { showNotification('Please accept terms & conditions', 'warning'); return; }
        setLoading(true);
        try {
            // Step 1: Create the user account
            await authApi.register(name, email, phone, password, confirmPassword, userType);

            // Step 2: If farmer, submit certification application simultaneously
            if (userType === 'farmer') {
                const nameParts = name.trim().split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || firstName;
                try {
                    await farmerApi.register({
                        firstName,
                        lastName,
                        email: email.trim().toLowerCase(),
                        phone,
                        farmName: regForm.farmName,
                        farmAddress: regForm.farmAddress,
                        city: regForm.city,
                        state: regForm.state,
                        pincode: regForm.pincode,
                        farmSize: regForm.farmSize ? parseFloat(regForm.farmSize) : null,
                        cropTypes: regForm.cropTypes,
                        certificationNumber: regForm.certNumber,
                        certificationDate: regForm.certDate || null,
                        certifyingAuthority: regForm.certAuthority,
                    }, certFile);
                } catch (farmerErr) {
                    // Account created — just warn that cert submission had an issue
                    console.warn('Farmer certification submission error:', farmerErr);
                    showNotification('Account created! Certification will need to be resubmitted.', 'warning');
                }
            }

            setPendingEmail(email.trim().toLowerCase());
            showNotification(
                userType === 'farmer'
                    ? '🌾 Farmer account created! Check your email for the verification code.'
                    : 'Account created! A verification code was sent to your email.',
                'success'
            );
            setMode('verify');
        } catch (err) {
            showNotification(err.message || 'Registration failed. Please try again.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleVerified = () => {
        // After OTP success — redirect to login so user logs in properly
        showNotification('Email verified! Please log in now.', 'success');
        setLoginForm(prev => ({ ...prev, email: pendingEmail }));
        setMode('login');
        setPendingEmail('');
    };

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        setTimeout(() => {
            setGoogleLoading(false);
            showNotification('Google Sign-In is not configured yet. Please use email login.', 'warning');
        }, 1200);
    };

    const isFarmer = regForm.userType === 'farmer';

    // ── Render: OTP verify screen ────────────────────────────────────────────
    if (mode === 'verify') {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ maxWidth: '440px' }}>
                    <div className="auth-card-header" style={{
                        background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)'
                    }}>
                        <i className="fas fa-shield-alt fa-2x" style={{ marginBottom: '0.5rem', display: 'block' }} />
                        <h3 style={{ fontWeight: 800, margin: 0 }}>Verify Your Email</h3>
                        <p style={{ opacity: 0.85, margin: '0.25rem 0 0' }}>
                            Enter the code sent to your inbox
                        </p>
                    </div>
                    <OtpVerificationScreen
                        email={pendingEmail}
                        onVerified={handleVerified}
                        onBack={() => setMode('register')}
                    />
                </div>
            </div>
        );
    }

    // ── Render: Login / Register ─────────────────────────────────────────────
    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: isFarmer && mode === 'register' ? '560px' : '460px' }}>
                <div className="auth-card-header" style={{
                    background: isFarmer && mode === 'register'
                        ? 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)'
                        : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark, #218838) 100%)'
                }}>
                    <i className={`fas ${isFarmer && mode === 'register' ? 'fa-tractor' : 'fa-leaf'} fa-2x`} style={{ marginBottom: '0.5rem', display: 'block' }} />
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
                            <><span className="spinner spinner-dark" /> Connecting...</>
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
                                        className={`form-control${loginEmailTouched && loginEmailDisplay ? (loginEmailResult.valid ? ' input-valid' : ' input-invalid') : ''}`}
                                        type="email"
                                        id="loginEmail"
                                        required
                                        value={loginForm.email}
                                        onChange={e => handleLoginEmailChange(e.target.value)}
                                        onBlur={() => { setLoginEmailTouched(true); setLoginEmailDisplay(loginForm.email); }}
                                        placeholder="you@example.com"
                                    />
                                    {loginEmailTouched && loginEmailDisplay && (
                                        <span className={`input-icon ${loginEmailResult.valid ? 'valid' : 'invalid'}`}>
                                            <i className={`fas ${loginEmailResult.valid ? 'fa-check-circle' : 'fa-times-circle'}`} />
                                        </span>
                                    )}
                                </div>
                                {loginEmailTouched && loginEmailDisplay && !loginEmailResult.valid && (
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
                                {loading ? <><span className="spinner" /> Logging in...</> : <><i className="fas fa-sign-in-alt" /> Login</>}
                            </button>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                                Demo: <strong>customer@organicfarm.com</strong> / <strong>Customer@123</strong>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            {/* User Type Selection */}
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
                                                flex: 1, padding: '0.85rem', borderRadius: '12px',
                                                border: `2px solid ${regForm.userType === opt.value ? 'var(--primary)' : 'var(--border, #dee2e6)'}`,
                                                background: regForm.userType === opt.value ? 'rgba(40, 167, 69, 0.08)' : '#fff',
                                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s',
                                                boxShadow: regForm.userType === opt.value ? '0 2px 12px rgba(40,167,69,0.15)' : 'none',
                                            }}
                                        >
                                            <i className={`fas ${opt.icon}`} style={{
                                                fontSize: '1.5rem', color: regForm.userType === opt.value ? 'var(--primary)' : '#aaa',
                                                marginBottom: '0.35rem', display: 'block',
                                            }} />
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
                                    border: '1px solid #74c69d', borderRadius: '10px',
                                    padding: '0.75rem 1rem', marginBottom: '1.25rem',
                                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                                }}>
                                    <i className="fas fa-info-circle" style={{ color: '#2d6a4f', fontSize: '1.1rem' }} />
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
                                            className={`form-control${regEmailTouched && regEmailDisplay ? (regEmailResult.valid ? ' input-valid' : ' input-invalid') : ''}`}
                                            type="email"
                                            required
                                            value={regForm.email}
                                            onChange={e => handleRegEmailChange(e.target.value)}
                                            onBlur={() => { setRegEmailTouched(true); setRegEmailDisplay(regForm.email); }}
                                            placeholder="you@example.com"
                                        />
                                        {regEmailTouched && regEmailDisplay && (
                                            <span className={`input-icon ${regEmailResult.valid ? 'valid' : 'invalid'}`}>
                                                <i className={`fas ${regEmailResult.valid ? 'fa-check-circle' : 'fa-times-circle'}`} />
                                            </span>
                                        )}
                                    </div>
                                    {regEmailTouched && regEmailDisplay && !regEmailResult.valid && (
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
                                    {/* ── Farm Details ─────────────────────── */}
                                    <div style={{ borderTop: '2px dashed #74c69d', margin: '0.75rem 0 0.9rem', paddingTop: '0.9rem' }}>
                                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d6a4f', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <i className="fas fa-seedling" /> Farm Details
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
                                            <label className="form-label">Farm Size (acres)</label>
                                            <input className="form-control" type="number" min="0" step="0.1" value={regForm.farmSize}
                                                onChange={e => setRegForm({ ...regForm, farmSize: e.target.value })}
                                                placeholder="e.g. 5.5" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Farm Address *</label>
                                        <input className="form-control" required value={regForm.farmAddress}
                                            onChange={e => setRegForm({ ...regForm, farmAddress: e.target.value })}
                                            placeholder="Street / Village / Taluk" />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">City *</label>
                                            <input className="form-control" required value={regForm.city}
                                                onChange={e => setRegForm({ ...regForm, city: e.target.value })}
                                                placeholder="e.g. Nashik" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">State *</label>
                                            <select className="form-select" required value={regForm.state}
                                                onChange={e => setRegForm({ ...regForm, state: e.target.value })}>
                                                <option value="">Select state...</option>
                                                {STATES_LIST.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Pincode *</label>
                                            <input className="form-control" required value={regForm.pincode}
                                                onChange={e => setRegForm({ ...regForm, pincode: e.target.value.replace(/\D/, '').slice(0, 6) })}
                                                placeholder="6-digit pincode" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Crop Types</label>
                                        <select className="form-select" multiple style={{ height: '90px' }}
                                            value={regForm.cropTypes}
                                            onChange={e => setRegForm({ ...regForm, cropTypes: Array.from(e.target.selectedOptions, o => o.value) })}>
                                            {CROPS_LIST.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                                        </select>
                                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Ctrl+Click to select multiple</small>
                                    </div>

                                    {/* ── Certification Details ────────────── */}
                                    <div style={{ borderTop: '2px dashed #74c69d', margin: '0.9rem 0', paddingTop: '0.9rem' }}>
                                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d6a4f', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <i className="fas fa-certificate" /> Organic Certification *
                                        </p>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Certification Number *</label>
                                            <input className="form-control" required value={regForm.certNumber}
                                                onChange={e => setRegForm({ ...regForm, certNumber: e.target.value })}
                                                placeholder="e.g. NPOP-2024-12345" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Certification Date *</label>
                                            <input className="form-control" type="date" required value={regForm.certDate}
                                                onChange={e => setRegForm({ ...regForm, certDate: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Certifying Authority *</label>
                                        <select className="form-select" required value={regForm.certAuthority}
                                            onChange={e => setRegForm({ ...regForm, certAuthority: e.target.value })}>
                                            <option value="">Select authority...</option>
                                            <option>NPOP (National Programme for Organic Production)</option>
                                            <option>PGS-India (Participatory Guarantee System)</option>
                                            <option>APEDA</option>
                                            <option>IMO Control</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    {/* Certificate File Upload */}
                                    {!certFile ? (
                                        <div
                                            onClick={() => certFileRef.current?.click()}
                                            onDragOver={e => { e.preventDefault(); setCertDragging(true); }}
                                            onDragLeave={() => setCertDragging(false)}
                                            onDrop={e => { e.preventDefault(); setCertDragging(false); if (e.dataTransfer.files[0]) handleCertFile(e.dataTransfer.files[0]); }}
                                            style={{
                                                border: `2px dashed ${certDragging ? '#2d6a4f' : '#74c69d'}`,
                                                borderRadius: '12px',
                                                padding: '1.5rem',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                background: certDragging ? 'rgba(40,167,69,0.08)' : 'rgba(40,167,69,0.03)',
                                                transition: 'all 0.2s',
                                                marginBottom: '0.75rem',
                                            }}
                                        >
                                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.8rem', color: '#40916c', marginBottom: '0.5rem', display: 'block' }} />
                                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#2d6a4f' }}>Upload Organic Certificate *</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Click or drag & drop — PDF, JPG, PNG (max 5MB)</div>
                                            <input type="file" ref={certFileRef} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={e => e.target.files[0] && handleCertFile(e.target.files[0])} />
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            background: 'rgba(40,167,69,0.08)', border: '1px solid #74c69d',
                                            borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '0.75rem',
                                        }}>
                                            <i className="fas fa-file-alt" style={{ color: 'var(--primary)', fontSize: '1.5rem' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{certFile.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(certFile.size / 1024).toFixed(1)} KB</div>
                                            </div>
                                            <button type="button" onClick={() => setCertFile(null)}
                                                style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem 0.5rem' }}>
                                                <i className="fas fa-times" /> Remove
                                            </button>
                                        </div>
                                    )}
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
                                            <div style={{ width: `${(pwStrength / 6) * 100}%`, background: strengthColor, height: '100%', borderRadius: '3px', transition: 'all 0.3s' }} />
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

                            {/* Email verification notice */}
                            <div style={{
                                background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.4)',
                                borderRadius: '10px', padding: '0.65rem 0.9rem', marginBottom: '1rem',
                                display: 'flex', gap: '0.55rem', alignItems: 'flex-start', fontSize: '0.8rem', color: '#856404',
                            }}>
                                <i className="fas fa-envelope" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <span>After creating your account, we'll send a <strong>6-digit verification code</strong> to your email to confirm ownership.</span>
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
                                    ? <><span className="spinner" /> Creating Account...</>
                                    : <><i className={`fas ${isFarmer ? 'fa-tractor' : 'fa-user-plus'}`} /> {isFarmer ? 'Register as Farmer' : 'Create Account'}</>}
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
