import { Link } from 'react-router-dom';

export default function About() {
    return (
        <>
            <div className="page-header">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h1>About OrganicFarm</h1>
                    <p>Bridging the gap between organic farmers and conscious consumers</p>
                </div>
            </div>

            {/* Our Story */}
            <section className="section">
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
                        <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=700" alt="Our Farm" style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', width: '100%', height: '360px', objectFit: 'cover' }} />
                        <div>
                            <h2 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>Our Story</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>OrganicFarm was founded with a simple yet powerful vision: to create a direct connection between certified organic farmers and health-conscious consumers who value sustainable, chemical-free produce.</p>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>We recognized that many talented organic farmers struggled to reach their target market, while consumers found it challenging to verify the authenticity of organic products and access fresh, locally-grown produce.</p>
                            <p style={{ color: 'var(--text-muted)' }}>By combining traditional agricultural wisdom with cutting-edge technology, including AI-powered farming tools, we've built a platform that benefits both farmers and consumers, creating a sustainable ecosystem for organic agriculture.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="section bg-light">
                <div className="container">
                    <div className="grid grid-2">
                        {[
                            { icon: 'bullseye', title: 'Our Mission', desc: 'To empower organic farmers with technology and market access while providing consumers with verified, fresh, and healthy organic produce.', points: ['Support small-scale organic farmers', 'Ensure product authenticity and quality', 'Promote sustainable agriculture practices', 'Leverage AI for better farming outcomes'] },
                            { icon: 'eye', title: 'Our Vision', desc: 'To become the leading platform for organic produce in India, setting the gold standard for transparency, quality, and farmer welfare.', points: ['Expand to 100+ cities nationwide', 'Onboard 10,000+ certified farmers', 'Serve 1 million+ conscious consumers', 'Pioneer AI-driven sustainable farming'] },
                        ].map(card => (
                            <div key={card.title} className="card" style={{ boxShadow: 'var(--shadow)' }}>
                                <div className="card-body" style={{ padding: '2.5rem', textAlign: 'center' }}>
                                    <i className={`fas fa-${card.icon} fa-4x`} style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'block' }}></i>
                                    <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>{card.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{card.desc}</p>
                                    <ul style={{ textAlign: 'left', listStyle: 'none', paddingLeft: 0 }}>
                                        {card.points.map(p => <li key={p} style={{ marginBottom: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>{p}</li>)}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Our Core <span>Values</span></h2>
                    <div className="grid grid-4">
                        {[
                            { icon: 'certificate', title: 'Authenticity', desc: 'We verify every farmer\'s organic certification.' },
                            { icon: 'balance-scale', title: 'Fair Trade', desc: 'Farmers receive fair prices without middlemen.' },
                            { icon: 'leaf', title: 'Sustainability', desc: 'Promoting eco-friendly farming practices.' },
                            { icon: 'users', title: 'Community', desc: 'Building a supportive community of farmers.' },
                        ].map(v => (
                            <div key={v.title} className="feature-card">
                                <div className="feature-icon"><i className={`fas fa-${v.icon}`}></i></div>
                                <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{v.title}</h5>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">How <span>OrganicFarm</span> Works</h2>
                    <div className="grid grid-4">
                        {[
                            { step: 1, title: 'Farmer Registration', desc: 'Organic farmers register with government-issued certificates.' },
                            { step: 2, title: 'Verification', desc: 'Our team verifies all certifications and farm credentials.' },
                            { step: 3, title: 'Product Listing', desc: 'Farmers list their fresh produce on our platform.' },
                            { step: 4, title: 'Direct Delivery', desc: 'Customers order and receive fresh produce within 24 hours.' },
                        ].map(s => (
                            <div key={s.step} style={{ textAlign: 'center' }}>
                                <div className="step-circle">{s.step}</div>
                                <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h5>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact stats */}
            <section className="stats-section">
                <div className="container">
                    <h2 style={{ textAlign: 'center', fontWeight: 800, color: 'white', marginBottom: '3rem' }}>Our Impact</h2>
                    <div className="grid grid-4">
                        {[
                            { icon: 'tractor', value: '500+', label: 'Certified Farmers' },
                            { icon: 'users', value: '10K+', label: 'Happy Customers' },
                            { icon: 'box', value: '50K+', label: 'Orders Delivered' },
                            { icon: 'tree', value: '1000+', label: 'Acres Organic Farming' },
                        ].map(s => (
                            <div key={s.label} className="stat-item">
                                <i className={`fas fa-${s.icon} fa-2x`} style={{ marginBottom: '0.75rem', display: 'block' }}></i>
                                <h2>{s.value}</h2>
                                <p>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech & Innovation */}
            <section className="section">
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>Technology & Innovation</h2>
                            {[
                                { icon: 'brain', title: 'AI-Powered Crop Recommendations', desc: 'Machine learning models help farmers choose the most suitable crops.' },
                                { icon: 'chart-line', title: 'Resource Management Tools', desc: 'Smart algorithms optimize water usage, fertilizer, and schedules.' },
                                { icon: 'mobile-alt', title: 'Real-Time Tracking', desc: 'Both farmers and customers can track orders and deliveries.' },
                                { icon: 'shield-alt', title: 'Blockchain Verification', desc: 'Immutable records of organic certifications for trust.' },
                            ].map(t => (
                                <div key={t.title} style={{ marginBottom: '1.25rem' }}>
                                    <h5><i className={`fas fa-${t.icon}`} style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>{t.title}</h5>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '1.5rem' }}>{t.desc}</p>
                                </div>
                            ))}
                        </div>
                        <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700" alt="AI Technology" style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', width: '100%', height: '380px', objectFit: 'cover' }} />
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Leadership <span>Team</span></h2>
                    <div className="grid grid-4">
                        {[
                            { name: 'Kishore Kumar', role: 'Team Member', bio: 'Full-stack developer with passion for agri-tech.' },
                            { name: 'Ananthan', role: 'Team Member', bio: 'AI/ML specialist focused on crop intelligence.' },
                            { name: 'Dinesh', role: 'Team Member', bio: 'Backend architect and infrastructure expert.' },
                            { name: 'Manikandan', role: 'Team Member', bio: 'AI/ML specialist focused on crop intelligence.' },
                        ].map(m => (
                            <div key={m.name} className="team-card">
                                <div className="team-avatar"><i className="fas fa-user"></i></div>
                                <h5 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{m.name}</h5>
                                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>{m.role}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)', color: 'white', padding: '5rem 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontWeight: 800, marginBottom: '1rem', color: 'white' }}>Join the Organic Revolution</h2>
                    <p style={{ opacity: 0.9, marginBottom: '2rem', fontSize: '1.1rem' }}>Whether you're a farmer or a consumer seeking authentic organic products, we're here to help.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/farmers" className="btn btn-light btn-lg">Register as Farmer</Link>
                        <Link to="/products" className="btn btn-outline-light btn-lg">Shop Organic</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
