import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { farmerApi } from '../services/api';

export default function Farmers() {
    const { showNotification } = useApp();
    const [loading, setLoading] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [certFile, setCertFile] = useState(null);
    const fileInputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        farmName: '', farmAddress: '', city: '', state: '', pincode: '',
        farmSize: '', cropTypes: [],
        certNumber: '', certDate: '', certAuthority: '',
        bankName: '', accountNumber: '', ifscCode: '', accountHolder: '',
        terms: false, certify: false,
    });

    const handleFile = file => {
        const valid = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!valid.includes(file.type)) { showNotification('Please upload PDF, JPG, or PNG', 'danger'); return; }
        if (file.size > 5 * 1024 * 1024) { showNotification('File must be less than 5MB', 'danger'); return; }
        setCertFile(file);
        showNotification('Certificate uploaded successfully!', 'success');
    };

    const validateForm = () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { showNotification('Invalid email', 'warning'); return false; }
        if (!/^[6-9]\d{9}$/.test(form.phone)) { showNotification('Enter valid 10-digit phone', 'warning'); return false; }
        if (!/^\d{6}$/.test(form.pincode)) { showNotification('Enter valid 6-digit pincode', 'warning'); return false; }
        if (!certFile) { showNotification('Please upload organic certification', 'warning'); return false; }
        if (!form.terms || !form.certify) { showNotification('Please accept terms and certify information', 'warning'); return false; }
        const ifsc = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (form.ifscCode && !ifsc.test(form.ifscCode.toUpperCase())) { showNotification('Invalid IFSC code format', 'warning'); return false; }
        return true;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await farmerApi.register({
                firstName: form.firstName, lastName: form.lastName,
                email: form.email, phone: form.phone,
                farmName: form.farmName, farmAddress: form.farmAddress,
                city: form.city, state: form.state, pincode: form.pincode,
                farmSize: form.farmSize ? parseFloat(form.farmSize) : null,
                cropTypes: form.cropTypes,
                certificationNumber: form.certNumber,
                certificationDate: form.certDate || null,
                certifyingAuthority: form.certAuthority,
                bankName: form.bankName, accountNumber: form.accountNumber,
                ifscCode: form.ifscCode, accountHolderName: form.accountHolder,
            }, certFile);
            setSuccessOpen(true);
        } catch (err) {
            showNotification(err.message || 'Submission failed. Please try again.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

    const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];
    const CROPS = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Herbs', 'Cotton', 'Sugarcane', 'Other'];

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>Farmer Registration</h1>
                    <p>Join OrganicFarm and reach thousands of conscious consumers</p>
                </div>
            </div>

            {/* Benefits */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Why Join <span>OrganicFarm</span>?</h2>
                    <div className="grid grid-4">
                        {[
                            { icon: 'store', title: 'Direct Market Access', desc: 'Sell directly to consumers without middlemen.' },
                            { icon: 'robot', title: 'AI Farming Tools', desc: 'Free access to AI crop & resource tools.' },
                            { icon: 'rupee-sign', title: 'Fair Prices', desc: 'Get better prices with transparent payments.' },
                            { icon: 'users', title: 'Community Support', desc: 'Connect with thousands of farmers.' },
                        ].map(b => (
                            <div key={b.title} className="feature-card">
                                <div className="feature-icon"><i className={`fas fa-${b.icon}`}></i></div>
                                <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{b.title}</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Registration Form */}
            <section className="section">
                <div className="container" style={{ maxWidth: '900px' }}>
                    <h2 style={{ fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Registration Form</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Personal Info */}
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <div className="card-header">👤 Personal Information</div>
                            <div className="card-body">
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" id="firstName" required value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
                                    <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" id="lastName" required value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">Email *</label><input className="form-control" id="email" type="email" required value={form.email} onChange={e => set('email', e.target.value)} /></div>
                                    <div className="form-group"><label className="form-label">Phone *</label><input className="form-control" id="phone" type="tel" required value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/, '').slice(0, 10))} /></div>
                                </div>
                            </div>
                        </div>

                        {/* Farm Info */}
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <div className="card-header">🌱 Farm Information</div>
                            <div className="card-body">
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">Farm Name *</label><input className="form-control" id="farmName" required value={form.farmName} onChange={e => set('farmName', e.target.value)} /></div>
                                    <div className="form-group"><label className="form-label">Farm Size (acres) *</label><input className="form-control" id="farmSize" type="number" required min="0.1" step="0.1" value={form.farmSize} onChange={e => set('farmSize', e.target.value)} /></div>
                                </div>
                                <div className="form-group"><label className="form-label">Farm Address *</label><input className="form-control" id="farmAddress" required value={form.farmAddress} onChange={e => set('farmAddress', e.target.value)} /></div>
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">City *</label><input className="form-control" id="city" required value={form.city} onChange={e => set('city', e.target.value)} /></div>
                                    <div className="form-group">
                                        <label className="form-label">State *</label>
                                        <select className="form-select" id="state" required value={form.state} onChange={e => set('state', e.target.value)}>
                                            <option value="">Select state...</option>
                                            {STATES.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label className="form-label">Pincode *</label><input className="form-control" id="pincode" required value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/, '').slice(0, 6))} /></div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Crop Types (Ctrl+Click for multiple)</label>
                                    <select className="form-select" id="cropTypes" multiple style={{ height: '120px' }} value={form.cropTypes} onChange={e => set('cropTypes', Array.from(e.target.selectedOptions, o => o.value))}>
                                        {CROPS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Certificate */}
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <div className="card-header">📜 Certification Details</div>
                            <div className="card-body">
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">Certification Number *</label><input className="form-control" id="certificationNumber" required value={form.certNumber} onChange={e => set('certNumber', e.target.value)} /></div>
                                    <div className="form-group"><label className="form-label">Certification Date *</label><input className="form-control" id="certificationDate" type="date" required value={form.certDate} onChange={e => set('certDate', e.target.value)} /></div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Certifying Authority *</label>
                                    <select className="form-select" id="certificationAuthority" required value={form.certAuthority} onChange={e => set('certAuthority', e.target.value)}>
                                        <option value="">Select authority...</option>
                                        <option>NPOP (National Programme for Organic Production)</option>
                                        <option>PGS-India (Participatory Guarantee System)</option>
                                        <option>APEDA</option>
                                        <option>IMO Control</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                {/* Upload */}
                                {!certFile ? (
                                    <div
                                        className={`certificate-upload ${dragging ? 'dragging' : ''}`}
                                        id="certificateUploadArea"
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                        onDragLeave={() => setDragging(false)}
                                        onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                                    >
                                        <i className="fas fa-cloud-upload-alt fa-3x" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'block' }}></i>
                                        <h6 style={{ fontWeight: 700 }}>Upload Organic Certificate</h6>
                                        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Click or drag & drop — PDF, JPG, PNG (max 5MB)</p>
                                        <input type="file" ref={fileInputRef} id="certificateUpload" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
                                    </div>
                                ) : (
                                    <div className="certificate-preview" id="certificatePreview">
                                        <i className="fas fa-file-alt fa-2x" style={{ color: 'var(--primary)' }}></i>
                                        <div style={{ flex: 1 }}>
                                            <div id="fileName" style={{ fontWeight: 700 }}>{certFile.name}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{(certFile.size / 1024).toFixed(1)} KB</div>
                                        </div>
                                        <button type="button" id="removeFile" className="btn btn-sm btn-danger" onClick={() => setCertFile(null)}>
                                            <i className="fas fa-times"></i> Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bank */}
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <div className="card-header">🏦 Bank Details</div>
                            <div className="card-body">
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">Bank Name *</label><input className="form-control" id="bankName" required value={form.bankName} onChange={e => set('bankName', e.target.value)} /></div>
                                    <div className="form-group"><label className="form-label">Account Holder Name *</label><input className="form-control" id="accountHolderName" required value={form.accountHolder} onChange={e => set('accountHolder', e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">Account Number *</label><input className="form-control" id="accountNumber" required value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} /></div>
                                    <div className="form-group">
                                        <label className="form-label">IFSC Code *</label>
                                        <input className="form-control" id="ifscCode" required value={form.ifscCode}
                                            onChange={e => set('ifscCode', e.target.value.toUpperCase())}
                                            onBlur={e => { const v = e.target.value.toUpperCase(); if (v.length === 11) { if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v)) showNotification('Invalid IFSC format', 'warning'); else showNotification('IFSC validated!', 'success'); } }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="form-check">
                            <input type="checkbox" id="terms" checked={form.terms} onChange={e => set('terms', e.target.checked)} />
                            <label htmlFor="terms">I agree to the <a href="#" style={{ color: 'var(--primary)' }}>Terms & Conditions</a> and <a href="#" style={{ color: 'var(--primary)' }}>Privacy Policy</a></label>
                        </div>
                        <div className="form-check" style={{ marginBottom: '2rem' }}>
                            <input type="checkbox" id="certifyInfo" checked={form.certify} onChange={e => set('certify', e.target.checked)} />
                            <label htmlFor="certifyInfo">I certify that all information provided is accurate and my organic certification is valid</label>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                            {loading ? <><span className="spinner"></span> Submitting Registration...</> : <><i className="fas fa-paper-plane"></i> Submit Registration</>}
                        </button>
                    </form>
                </div>
            </section>

            {/* Success Modal */}
            {successOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header" style={{ background: 'var(--primary)', color: 'white' }}>
                            <span><i className="fas fa-check-circle"></i> Registration Successful!</span>
                            <button className="modal-close" style={{ color: 'white' }} onClick={() => setSuccessOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body" style={{ textAlign: 'center', padding: '2.5rem' }}>
                            <i className="fas fa-check-circle fa-4x" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'block' }}></i>
                            <h4 style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Welcome to OrganicFarm!</h4>
                            <p style={{ color: 'var(--text-muted)' }}>Your registration has been submitted. Our team will verify your organic certification and activate your account within 24-48 hours. You'll receive a confirmation email at your registered email address.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setSuccessOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
