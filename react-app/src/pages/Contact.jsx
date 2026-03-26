import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { contactApi } from '../services/api';

const FAQ_DATA = [
    { q: 'How do I register as a farmer?', a: 'Visit our Farmer Registration page. You\'ll need to provide your farm details and upload your government-issued organic certification. Our team will verify your credentials within 24-48 hours.' },
    { q: 'What are the delivery timings?', a: 'We deliver fresh produce within 24 hours of order placement. Delivery slots are available between 8 AM - 8 PM. You can select your preferred time slot during checkout.' },
    { q: 'How are farmers certified organic?', a: 'All our farmers hold valid certifications from recognized bodies like NPOP, PGS-India, or equivalent international standards. We verify all certificates before onboarding farmers.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major payment methods including Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery (COD) for eligible locations.' },
    { q: 'How do the AI farming tools work?', a: 'Our AI tools use machine learning algorithms trained on thousands of farm datasets, providing crop recommendations, resource optimization, soil analysis, and weather forecasts.' },
];

export default function Contact() {
    const { showNotification } = useApp();
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', consent: false });
    const [loading, setLoading] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            await contactApi.send(form);
            showNotification('Message sent successfully! We will get back to you soon.', 'success');
            setForm({ name: '', email: '', phone: '', subject: '', message: '', consent: false });
        } catch (err) {
            showNotification(err.message || 'Failed to send message. Please try again.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>We'd love to hear from you. Get in touch!</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    {/* Contact Info Cards */}
                    <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
                        <div className="contact-info-card">
                            <i className="fas fa-map-marker-alt"></i>
                            <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Visit Us</h5>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>123 Organic Street<br />Green Valley, City<br />State - 123456</p>
                        </div>
                        <div className="contact-info-card">
                            <i className="fas fa-phone"></i>
                            <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Call Us</h5>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Customer Support:<br />+91 12345 67890<br />Farmer Support:<br />+91 98765 43210</p>
                        </div>
                        <div className="contact-info-card">
                            <i className="fas fa-envelope"></i>
                            <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Email Us</h5>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                General: info@organicfarm.com<br />
                                Support: support@organicfarm.com<br />
                                Farmers: farmers@organicfarm.com
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                        <div className="card" style={{ marginBottom: '3rem' }}>
                            <div className="card-header green">
                                <h4 style={{ margin: 0 }}><i className="fas fa-paper-plane"></i> Send us a Message</h4>
                            </div>
                            <div className="card-body" style={{ padding: '2rem' }}>
                                <form id="contactForm" onSubmit={handleSubmit}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="contactName">Full Name *</label>
                                            <input className="form-control" id="contactName" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="contactEmail">Email Address *</label>
                                            <input className="form-control" id="contactEmail" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="contactPhone">Phone Number</label>
                                            <input className="form-control" id="contactPhone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="contactSubject">Subject *</label>
                                            <select className="form-select" id="contactSubject" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                                                <option value="">Select a subject...</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="product">Product Question</option>
                                                <option value="farmer">Farmer Support</option>
                                                <option value="technical">Technical Support</option>
                                                <option value="partnership">Partnership Opportunity</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="contactMessage">Message *</label>
                                        <textarea className="form-control" id="contactMessage" rows={6} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                                    </div>
                                    <div className="form-check">
                                        <input type="checkbox" id="contactConsent" required checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} />
                                        <label htmlFor="contactConsent">I consent to OrganicFarm storing my submitted information</label>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: '1rem' }} disabled={loading}>
                                        {loading ? <><span className="spinner"></span> Sending...</> : <><i className="fas fa-paper-plane"></i> Send Message</>}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* FAQ Accordion */}
                        <div>
                            <h3 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Frequently Asked Questions</h3>
                            {FAQ_DATA.map((faq, i) => (
                                <div key={i} className="accordion-item">
                                    <button className={`accordion-btn ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                                        {faq.q}
                                        <i className={`fas fa-chevron-${openFaq === i ? 'up' : 'down'}`} style={{ fontSize: '0.8rem' }}></i>
                                    </button>
                                    {openFaq === i && <div className="accordion-body">{faq.a}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
