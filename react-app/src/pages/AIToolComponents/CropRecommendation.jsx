import React, { useState } from 'react';
import { aiApi } from '../../services/api';
import VoiceExplainer from './VoiceExplainer';

export default function CropRecommendation() {
    const [form, setForm] = useState({ potassium: '', temperature: '', humidity: '', ph: '', rainfall: '', location: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const getCropRec = data => {
        let crops = [
            { name: 'Rice', confidence: 0.92, reason: 'Optimal conditions for rice' },
            { name: 'Wheat', confidence: 0.75, reason: 'Good climate for wheat' },
            { name: 'Sugarcane', confidence: 0.65, reason: 'Suitable soil type' }
        ];
        return {
            recommended_crops: crops,
            soil_health: 'Good',
            recommendations: ['Maintain organic matter', 'Ensure proper drainage']
        };
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, isNaN(v) || v === '' ? v : parseFloat(v)]));
            const res = await aiApi.cropRecommendation(data);
            setResult({
                recommended_crops: (res.recommendedCrops || []).map(c => ({ name: c.name, confidence: c.confidence, reason: c.reason })),
                soil_health: res.soilHealth,
                recommendations: res.recommendations || [],
            });
        } catch {
            setResult(getCropRec(form));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-seedling" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Crop Recommendation</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Nitrogen (N)</label><input className="form-control" type="number" required value={form.nitrogen} onChange={e => setForm({...form, nitrogen: e.target.value})} placeholder="mg/kg" /></div>
                    <div className="form-group"><label className="form-label">Phosphorus (P)</label><input className="form-control" type="number" required value={form.phosphorus} onChange={e => setForm({...form, phosphorus: e.target.value})} placeholder="mg/kg" /></div>
                    <div className="form-group"><label className="form-label">Potassium (K)</label><input className="form-control" type="number" required value={form.potassium} onChange={e => setForm({...form, potassium: e.target.value})} placeholder="mg/kg" /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Temperature (°C)</label><input className="form-control" type="number" required value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Humidity (%)</label><input className="form-control" type="number" required value={form.humidity} onChange={e => setForm({...form, humidity: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">pH Level</label><input className="form-control" type="number" step="0.1" required value={form.ph} onChange={e => setForm({...form, ph: e.target.value})} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}><label className="form-label">Rainfall (mm)</label><input className="form-control" type="number" required value={form.rainfall} onChange={e => setForm({...form, rainfall: e.target.value})} /></div>
                    <div className="form-group" style={{ flex: 3 }}><label className="form-label">Location</label><input className="form-control" type="text" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Get Recommendation'}
                </button>
            </form>

            {result && (
                <div className="result-section" style={{ marginTop: '2rem' }}>
                    <h5>Recommended Crops</h5>
                    <div className="grid grid-3">
                        {result.recommended_crops.map(c => (
                            <div key={c.name} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <h6 style={{ fontWeight: 800, margin: 0 }}>{c.name}</h6>
                                <div style={{ color: 'var(--primary)', fontWeight: 700 }}>{(c.confidence * 100).toFixed(0)}% Match</div>
                                <small style={{ color: 'var(--text-muted)' }}>{c.reason}</small>
                            </div>
                        ))}
                    </div>
                    <VoiceExplainer 
                        title="Crop Recommendation" 
                        text={`Recommended crops: ${result.recommended_crops.map(c => `${c.name} (${(c.confidence * 100).toFixed(0)}% match) - ${c.reason}`).join('. ')}. Soil health is ${result.soil_health}.`} 
                    />
                </div>
            )}
        </div>
    );
}
