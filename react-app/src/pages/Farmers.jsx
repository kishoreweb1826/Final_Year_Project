import { useNavigate } from 'react-router-dom';

export default function Farmers() {
    const navigate = useNavigate();

    const BENEFITS = [
        { icon: 'store', title: 'Direct Market Access', desc: 'Sell directly to thousands of conscious consumers without middlemen cutting your profits.' },
        { icon: 'robot', title: 'Free AI Farming Tools', desc: 'Get free access to AI-powered crop recommendation, soil analysis, and resource planning tools.' },
        { icon: 'rupee-sign', title: 'Fair & Transparent Prices', desc: 'Set your own prices and receive payments directly with full transparency.' },
        { icon: 'users', title: 'Farmer Community', desc: 'Connect with a growing network of thousands of organic farmers across India.' },
        { icon: 'shield-alt', title: 'Verified Organic Badge', desc: 'Get a verified organic badge on your profile after certification review — builds buyer trust.' },
        { icon: 'chart-line', title: 'Sales Analytics', desc: 'Track your orders, revenue, and customer insights from your personal farmer dashboard.' },
    ];

    const STEPS = [
        { step: '01', icon: 'user-plus', title: 'Create Your Account', desc: 'Click "Register Now" and select Farmer as your account type.' },
        { step: '02', icon: 'certificate', title: 'Submit Certification', desc: 'Fill in your farm details and upload your organic certification document during sign-up.' },
        { step: '03', icon: 'envelope-open-text', title: 'Verify Your Email', desc: 'Enter the 6-digit OTP sent to your email to activate your account.' },
        { step: '04', icon: 'check-circle', title: 'Get Approved & Sell', desc: 'Our team reviews your certification within 24–48 hours. Once approved, list your products!' },
    ];

    return (
        <>
            {/* Hero */}
            <div className="page-header" style={{
                background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)',
                padding: '5rem 0 4rem',
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)', marginBottom: '1.5rem',
                        fontSize: '2rem', backdropFilter: 'blur(8px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    }}>
                        🌾
                    </div>
                    <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: '1rem' }}>
                        Grow Your Farm Business
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 2.5rem' }}>
                        Join thousands of organic farmers on OrganicFarm and reach lakhs of conscious consumers across India.
                    </p>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate('/login')}
                        style={{
                            background: '#fff', color: '#2d6a4f',
                            fontWeight: 800, fontSize: '1rem',
                            padding: '0.9rem 2.5rem', borderRadius: '50px',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                            border: 'none', cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'; }}
                    >
                        <i className="fas fa-tractor" style={{ marginRight: '0.5rem' }} />
                        Register as Farmer — Free
                    </button>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: '0.75rem' }}>
                        No registration fee · Certification reviewed within 24–48 hours
                    </p>
                </div>
            </div>

            {/* Benefits */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Why Join <span>OrganicFarm</span>?</h2>
                    <div className="grid grid-3" style={{ gap: '1.5rem' }}>
                        {BENEFITS.map(b => (
                            <div key={b.title} className="feature-card" style={{ transition: 'transform 0.25s, box-shadow 0.25s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(40,167,69,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                            >
                                <div className="feature-icon">
                                    <i className={`fas fa-${b.icon}`} />
                                </div>
                                <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{b.title}</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section">
                <div className="container" style={{ maxWidth: '860px' }}>
                    <h2 className="section-title">How It <span>Works</span></h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
                        {STEPS.map((s, i) => (
                            <div key={s.step} style={{ textAlign: 'center', position: 'relative' }}>
                                {/* Connector line */}
                                {i < STEPS.length - 1 && (
                                    <div style={{
                                        position: 'absolute', top: '38px', left: '60%', right: '-40%',
                                        height: '2px', background: 'linear-gradient(90deg, #74c69d, #d8f3dc)',
                                        zIndex: 0,
                                    }} className="step-connector" />
                                )}
                                <div style={{
                                    position: 'relative', zIndex: 1,
                                    width: 76, height: 76, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #d8f3dc, #b7e4c7)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    boxShadow: '0 4px 20px rgba(40,167,69,0.2)',
                                    border: '3px solid #74c69d',
                                }}>
                                    <i className={`fas fa-${s.icon}`} style={{ fontSize: '1.6rem', color: '#2d6a4f' }} />
                                </div>
                                <div style={{
                                    display: 'inline-block', background: 'var(--primary)', color: '#fff',
                                    borderRadius: '50px', padding: '0.15rem 0.65rem', fontSize: '0.7rem',
                                    fontWeight: 800, marginBottom: '0.6rem', letterSpacing: '0.04em',
                                }}>
                                    Step {s.step}
                                </div>
                                <h6 style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--dark)' }}>{s.title}</h6>
                                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{
                background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
                padding: '4rem 1rem', textAlign: 'center',
            }}>
                <div className="container">
                    <h2 style={{ color: '#fff', fontWeight: 900, marginBottom: '1rem', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
                        Ready to Start Your Farming Journey?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', fontSize: '1.02rem' }}>
                        Registration is completely free. Just create an account, select <strong>Farmer</strong>, and submit your organic certification — all in one step.
                    </p>
                    <button
                        className="btn btn-lg"
                        onClick={() => navigate('/login')}
                        style={{
                            background: '#fff', color: '#2d6a4f', fontWeight: 800,
                            padding: '0.9rem 2.5rem', borderRadius: '50px', border: 'none',
                            cursor: 'pointer', fontSize: '1rem',
                            boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <i className="fas fa-seedling" style={{ marginRight: '0.5rem' }} />
                        Get Started — Register Now
                    </button>
                </div>
            </section>
        </>
    );
}
