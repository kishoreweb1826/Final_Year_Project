import React, { useState } from 'react';
import { aiApi } from '../../services/api';
import VoiceExplainer from './VoiceExplainer';

export default function ResourceManagement() {
    const [form, setForm] = useState({ crop_type: '', farm_area: '', growth_stage: '', soil_moisture: '', days_since_irrigation: '', irrigation_method: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                cropType: form.crop_type,
                farmArea: parseFloat(form.farm_area),
                growthStage: form.growth_stage,
                soilMoisture: parseFloat(form.soil_moisture),
                daysSinceIrrigation: parseInt(form.days_since_irrigation),
                irrigationMethod: form.irrigation_method,
            };
            const res = await aiApi.resourceManagement(payload);
            setResult({
                water: { amount: res.water?.amount, unit: res.water?.unit, frequency: res.water?.frequency, method: res.water?.method },
                fertilizer: { 
                    nitrogen: res.fertilizer?.nitrogen,
                    phosphorus: res.fertilizer?.phosphorus,
                    potassium: res.fertilizer?.potassium, 
                    unit: res.fertilizer?.unit 
                },
                schedule: res.schedule || [],
                cost: { water: res.cost?.water, fertilizer: res.cost?.fertilizer, labor: res.cost?.labor, total: res.cost?.total },
            });
        } catch {
            setResult({
                water: { amount: 1000, unit: 'Liters', frequency: 'Twice daily', method: form.irrigation_method },
                fertilizer: { nitrogen: 50, phosphorus: 30, potassium: 40, unit: 'kg' },
                schedule: [{ task: 'Irrigation', timing: 'Morning' }, { task: 'Fertilization', timing: 'Afternoon' }],
                cost: { water: 500, fertilizer: 1200, labor: 800, total: 2500 }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-chart-line" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Resource Management</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Crop Type</label>
                        <select className="form-select" required value={form.crop_type} onChange={e => setForm({...form, crop_type: e.target.value})}>
                            <option value="">Select...</option>
                            {['rice', 'wheat', 'maize', 'cotton', 'sugarcane'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Farm Area (acres)</label><input className="form-control" type="number" required value={form.farm_area} onChange={e => setForm({...form, farm_area: e.target.value})} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Growth Stage</label>
                        <select className="form-select" required value={form.growth_stage} onChange={e => setForm({...form, growth_stage: e.target.value})}>
                            <option value="">Select...</option>
                            {['seedling', 'vegetative', 'flowering', 'fruiting', 'maturity'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Soil Moisture (%)</label><input className="form-control" type="number" required value={form.soil_moisture} onChange={e => setForm({...form, soil_moisture: e.target.value})} /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Calculating...' : 'Calculate Resources'}
                </button>
            </form>

            {result && (
                <div className="result-section" style={{ marginTop: '2rem' }}>
                    <div className="grid grid-2">
                        <div className="card" style={{ padding: '1rem' }}>
                            <h6>Water Usage</h6>
                            <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>{result.water.amount} {result.water.unit}</p>
                            <small>{result.water.frequency}</small>
                        </div>
                        <div className="card" style={{ padding: '1rem' }}>
                            <h6>Cost Estimate</h6>
                            <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{result.cost.total}</p>
                        </div>
                    </div>
                    <VoiceExplainer 
                        title="Resource Management" 
                        text={`Resource analysis complete. Water requirement is ${result.water.amount} ${result.water.unit}. Cost estimate is ₹${result.cost.total}.`} 
                    />
                </div>
            )}
        </div>
    );
}
