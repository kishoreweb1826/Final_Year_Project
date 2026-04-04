import React, { useState } from 'react';
import { aiApi } from '../../services/api';
import VoiceExplainer from './VoiceExplainer';

export default function SoilAnalysis() {
    const [form, setForm] = useState({ soilType: '', organicMatter: '', soilPh: '', ec: '', cec: '', previousCrop: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyzeLocally = data => {
        let score = 70;
        const issues = [], recs = [];
        if (data.soilPh < 6) { issues.push('Soil is acidic'); recs.push('Add lime to increase pH'); score -= 10; }
        else if (data.soilPh > 7.5) { issues.push('Soil is alkaline'); recs.push('Add sulfur to decrease pH'); score -= 10; }
        if (data.organicMatter < 3) { issues.push('Low organic matter'); recs.push('Add compost'); score -= 15; }
        return { 
            score: Math.max(score, 40), 
            issues: issues.length ? issues : ['No major issues detected'], 
            recs, 
            crops: ['Most vegetables', 'Grains', 'Fruits'] 
        };
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await aiApi.soilAnalysis({
                soilType: form.soilType,
                organicMatter: parseFloat(form.organicMatter) || null,
                soilPh: parseFloat(form.soilPh) || null,
                previousCrop: form.previousCrop,
            });
            setResult({
                score: res.score,
                issues: res.issues,
                recs: res.recommendations,
                crops: res.suitableCrops,
            });
        } catch {
            setResult(analyzeLocally(form));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-flask" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Soil Analysis Tool</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Soil Type</label>
                        <select className="form-select" required value={form.soilType} onChange={e => setForm({...form, soilType: e.target.value})}>
                            <option value="">Select...</option>
                            {['loamy', 'clay', 'sandy', 'silt', 'peaty'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Soil pH</label><input className="form-control" type="number" step="0.1" required value={form.soilPh} onChange={e => setForm({...form, soilPh: e.target.value})} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Organic Matter (%)</label><input className="form-control" type="number" step="0.1" required value={form.organicMatter} onChange={e => setForm({...form, organicMatter: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Previous Crop</label><input className="form-control" type="text" value={form.previousCrop} onChange={e => setForm({...form, previousCrop: e.target.value})} /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Analyze Soil'}
                </button>
            </form>

            {result && (
                <div className="result-section" style={{ marginTop: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h5>Soil Health Score: {result.score}/100</h5>
                        <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${result.score}%`, background: result.score > 70 ? 'var(--primary)' : '#ffc107' }}></div></div>
                    </div>
                    <div className="grid grid-2">
                        <div>
                            <h6 style={{ fontWeight: 800 }}>Issues:</h6>
                            <ul style={{ paddingLeft: '1rem' }}>{result.issues.map(i => <li key={i}>{i}</li>)}</ul>
                        </div>
                        <div>
                            <h6 style={{ fontWeight: 800 }}>Recommendations:</h6>
                            <ul style={{ paddingLeft: '1rem' }}>{result.recs.map(r => <li key={r}>{r}</li>)}</ul>
                        </div>
                    </div>
                    <VoiceExplainer 
                        title="Soil Analysis" 
                        text={`Soil analysis results: Health score is ${result.score} out of 100. Detected issues: ${result.issues.join('. ')}. Recommendations: ${result.recs.join('. ')}.`} 
                    />
                </div>
            )}
        </div>
    );
}
