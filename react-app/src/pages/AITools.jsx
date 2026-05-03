import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { aiApi, API_BASE, getManualOptions } from '../services/api';

// ──────── Voice Explainer Component ────────
function VoiceExplainer({ text, title }) {
    const [voiceOn, setVoiceOn] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedLang, setSelectedLang] = useState('ta-IN');
    const [availableVoices, setAvailableVoices] = useState([]);
    const [showSummary, setShowSummary] = useState(false);
    const utteranceRef = useRef(null);
    const LANGUAGES = [
        { code: 'ta-IN', label: 'Tamil' }, { code: 'hi-IN', label: 'Hindi' },
        { code: 'en-IN', label: 'English (India)' }, { code: 'en-US', label: 'English (US)' },
        { code: 'te-IN', label: 'Telugu' }, { code: 'kn-IN', label: 'Kannada' },
    ];
    useEffect(() => {
        const loadVoices = () => setAvailableVoices(window.speechSynthesis?.getVoices() || []);
        loadVoices();
        window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices);
        return () => { window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices); window.speechSynthesis?.cancel(); };
    }, []);
    const summary = typeof text === 'string' ? text : `Analysis complete for ${title || 'your data'}.`;
    const speak = useCallback((t) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(t); u.lang = selectedLang; u.rate = 0.9;
        const v = availableVoices.find(v => v.lang === selectedLang) || availableVoices.find(v => v.lang.startsWith(selectedLang.split('-')[0]));
        if (v) u.voice = v;
        u.onend = () => { setIsPlaying(false); setIsPaused(false); };
        u.onerror = () => { setIsPlaying(false); setIsPaused(false); };
        utteranceRef.current = u; window.speechSynthesis.speak(u); setIsPlaying(true); setIsPaused(false);
    }, [selectedLang, availableVoices]);
    const handlePlay = () => { if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); setIsPlaying(true); return; } speak(summary); };
    const handlePause = () => { window.speechSynthesis.pause(); setIsPaused(true); setIsPlaying(false); };
    const handleStop = () => { window.speechSynthesis.cancel(); setIsPlaying(false); setIsPaused(false); };
    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #e8f5e9)', border: '1px solid rgba(45,106,79,0.2)', borderRadius: 'var(--radius)', padding: '1.25rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <h6 style={{ fontWeight: 800, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-magic"></i> AI Summary & Voice</h6>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setShowSummary(!showSummary)} className="btn btn-sm btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}><i className={`fas ${showSummary ? 'fa-eye-slash' : 'fa-eye'}`}></i> {showSummary ? 'Hide' : 'Read'}</button>
                    <button onClick={() => { if (voiceOn) { handleStop(); setVoiceOn(false); } else setVoiceOn(true); }} className={`btn btn-sm ${voiceOn ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}><i className={`fas ${voiceOn ? 'fa-volume-up' : 'fa-volume-mute'}`}></i> Voice</button>
                </div>
            </div>
            {showSummary && <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '0.75rem', fontSize: '0.88rem', lineHeight: 1.7, border: '1px solid rgba(45,106,79,0.1)' }}>{summary.split('\n').map((l, i) => <p key={i} style={{ margin: '0 0 0.5rem' }}>{l}</p>)}</div>}
            {voiceOn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', background: 'white', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', border: '1px solid rgba(45,106,79,0.1)' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {[['play', handlePlay, isPlaying && !isPaused], ['pause', handlePause, isPaused], ['stop', handleStop, false]].map(([icon, fn, active]) => (
                            <button key={icon} onClick={fn} style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${icon === 'stop' ? '#dc3545' : 'var(--primary)'}`, background: active ? 'var(--primary)' : 'white', color: active ? 'white' : icon === 'stop' ? '#dc3545' : 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className={`fas fa-${icon}`} style={{ fontSize: '0.75rem' }}></i></button>
                        ))}
                    </div>
                    <select value={selectedLang} onChange={e => { setSelectedLang(e.target.value); handleStop(); }} style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', fontSize: '0.8rem', cursor: 'pointer', flex: 1, minWidth: '140px' }}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
}

// Helper: styled result section
const ResultCard = ({ icon, title, children, color = 'var(--primary)' }) => (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem', borderLeft: `4px solid ${color}` }}>
        <h6 style={{ fontWeight: 700, color, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className={`fas fa-${icon}`}></i> {title}</h6>
        {children}
    </div>
);

const Badge = ({ label, value, color }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: `${color}15`, color, border: `1px solid ${color}30` }}>
        {label}: <strong>{value}</strong>
    </span>
);

// ──────── Crop Recommendation ────────
function CropRecommendation() {
    const [form, setForm] = useState({ nitrogen: '', phosphorus: '', potassium: '', temperature: '', humidity: '', ph: '', rainfall: '', location: '', soilType: '', season: '', waterAvailability: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async e => {
        e.preventDefault(); setLoading(true); setError(''); setResult(null);
        try {
            const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, isNaN(v) || v === '' ? v : parseFloat(v)]));
            const res = await aiApi.cropRecommendation(data);
            setResult(res);
        } catch (err) {
            setError(`Backend error: ${err.message}`);
            setResult({ recommendedCrops: [{ name: 'Rice', confidence: 0.9, reason: 'High rainfall' }, { name: 'Wheat', confidence: 0.8, reason: 'Moderate temp' }], soilHealth: 'Good (Simulated)', recommendations: ['Consider crop rotation', 'Monitor pH regularly'] });
        } finally { setLoading(false); }
    };

    const summaryText = result ? `Top crop: ${result.recommendedCrops?.[0]?.name} (${(result.recommendedCrops?.[0]?.confidence * 100).toFixed(0)}% match). Soil health: ${result.soilHealth}. ${(result.recommendations || []).join('. ')}` : '';

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}><i className="fas fa-seedling" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Crop Recommendation Engine</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Enter soil nutrients, climate data, and environmental conditions for AI-powered crop suggestions.</p>
            <form onSubmit={handleSubmit}>
                <div style={{ background: '#f8fdf9', border: '1px solid rgba(45,106,79,0.1)', borderRadius: 'var(--radius)', padding: '1rem 1rem 0', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d6a4f', marginBottom: '0.75rem' }}><i className="fas fa-flask"></i> Soil Nutrients (kg/hectare)</p>
                    <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="form-group"><label className="form-label">Nitrogen (N)</label><input className="form-control" type="number" placeholder="e.g. 40" value={form.nitrogen} onChange={e => F('nitrogen', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Phosphorus (P)</label><input className="form-control" type="number" placeholder="e.g. 35" value={form.phosphorus} onChange={e => F('phosphorus', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Potassium (K) *</label><input className="form-control" type="number" required placeholder="e.g. 50" value={form.potassium} onChange={e => F('potassium', e.target.value)} /></div>
                    </div>
                </div>
                <div style={{ background: '#f8fdf9', border: '1px solid rgba(45,106,79,0.1)', borderRadius: 'var(--radius)', padding: '1rem 1rem 0', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d6a4f', marginBottom: '0.75rem' }}><i className="fas fa-cloud-sun"></i> Climate & Environment</p>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Temperature (°C) *</label><input className="form-control" type="number" required placeholder="e.g. 28" value={form.temperature} onChange={e => F('temperature', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Humidity (%) *</label><input className="form-control" type="number" required placeholder="e.g. 65" value={form.humidity} onChange={e => F('humidity', e.target.value)} /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Soil pH *</label><input className="form-control" type="number" step="0.1" required placeholder="e.g. 6.5" value={form.ph} onChange={e => F('ph', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Rainfall (mm) *</label><input className="form-control" type="number" required placeholder="e.g. 120" value={form.rainfall} onChange={e => F('rainfall', e.target.value)} /></div>
                    </div>
                </div>
                <div style={{ background: '#f8fdf9', border: '1px solid rgba(45,106,79,0.1)', borderRadius: 'var(--radius)', padding: '1rem 1rem 0', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d6a4f', marginBottom: '0.75rem' }}><i className="fas fa-map-marker-alt"></i> Farm Details</p>
                    <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="form-group"><label className="form-label">Soil Type</label>
                            <select className="form-select" value={form.soilType} onChange={e => F('soilType', e.target.value)}>
                                <option value="">Select...</option>
                                {['Loamy', 'Clay', 'Sandy', 'Silt', 'Black', 'Red', 'Laterite', 'Peaty'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Season</label>
                            <select className="form-select" value={form.season} onChange={e => F('season', e.target.value)}>
                                <option value="">Select...</option>
                                {['Kharif (Jun-Oct)', 'Rabi (Oct-Mar)', 'Zaid (Mar-Jun)'].map(s => <option key={s} value={s.split(' ')[0]}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Location</label><input className="form-control" placeholder="e.g. Nashik" value={form.location} onChange={e => F('location', e.target.value)} /></div>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><span className="spinner"></span> Analyzing...</> : <><i className="fas fa-brain"></i> Get AI Recommendation</>}</button>
            </form>
            {error && <div style={{ color: '#856404', background: '#fff3cd', padding: '0.75rem', marginTop: '1rem', borderRadius: 'var(--radius-sm)' }}><i className="fas fa-exclamation-triangle"></i> {error}</div>}
            {result && (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <Badge label="Soil Health" value={result.soilHealth} color={result.soilHealth === 'Excellent' ? '#28a745' : result.soilHealth === 'Good' ? '#17a2b8' : '#ffc107'} />
                        <Badge label="Model" value={result.modelVersion || 'rule-based-v1'} color="#6f42c1" />
                    </div>
                    <ResultCard icon="seedling" title={`Top ${result.recommendedCrops?.length || 0} Recommended Crops`}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                            {(result.recommendedCrops || []).map((c, i) => (
                                <div key={c.name} style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center', background: i === 0 ? 'rgba(40,167,69,0.06)' : 'white', position: 'relative' }}>
                                    {i === 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#28a745', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>👑</span>}
                                    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{['🌾', '🌿', '🌻', '🌽', '🥬'][i] || '🌱'}</div>
                                    <h6 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{c.name}</h6>
                                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{(c.confidence * 100).toFixed(0)}%</div>
                                    <small style={{ color: 'var(--text-muted)' }}>{c.reason}</small>
                                </div>
                            ))}
                        </div>
                    </ResultCard>
                    {result.recommendations?.length > 0 && (
                        <ResultCard icon="lightbulb" title="AI Recommendations" color="#e67e22">
                            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                {result.recommendations.map((r, i) => <li key={i} style={{ marginBottom: '0.4rem', fontSize: '0.9rem' }}>{r}</li>)}
                            </ul>
                        </ResultCard>
                    )}
                    <VoiceExplainer text={summaryText} title="Crop Recommendation" />
                </div>
            )}
        </div>
    );
}

// ──────── Resource Management ────────
function ResourceManagement() {
    const [form, setForm] = useState({ crop_type: '', farm_area: '', growth_stage: '', soil_moisture: '', days_since_irrigation: '', irrigation_method: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async e => {
        e.preventDefault(); setLoading(true); setResult(null);
        try {
            const res = await aiApi.resourceManagement({ cropType: form.crop_type, farmArea: parseFloat(form.farm_area), growthStage: form.growth_stage, soilMoisture: parseFloat(form.soil_moisture), daysSinceIrrigation: parseInt(form.days_since_irrigation), irrigationMethod: form.irrigation_method });
            setResult(res);
        } catch { setResult({ water: { amount: '500', unit: 'liters', frequency: 'Every 3 days' }, fertilizer: { nitrogen: '20', phosphorus: '15', potassium: '15', unit: 'kg' }, schedule: [{ task: 'Irrigation', timing: 'Today' }], cost: { water: '25', fertilizer: '1250', labor: '200', total: '1475' } }); }
        finally { setLoading(false); }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}><i className="fas fa-chart-line" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Resource Management</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Calculate water, fertilizer, and cost requirements for your farm.</p>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Crop Type *</label>
                        <select className="form-select" required value={form.crop_type} onChange={e => F('crop_type', e.target.value)}>
                            <option value="">Select...</option>
                            {['rice', 'wheat', 'maize', 'cotton', 'sugarcane', 'vegetables', 'pulses', 'millets'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Farm Area (acres) *</label><input className="form-control" type="number" step="0.1" required placeholder="e.g. 5" value={form.farm_area} onChange={e => F('farm_area', e.target.value)} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Growth Stage *</label>
                        <select className="form-select" required value={form.growth_stage} onChange={e => F('growth_stage', e.target.value)}>
                            <option value="">Select...</option>
                            {['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Soil Moisture (%)</label><input className="form-control" type="number" placeholder="e.g. 45" value={form.soil_moisture} onChange={e => F('soil_moisture', e.target.value)} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Days Since Last Irrigation</label><input className="form-control" type="number" placeholder="e.g. 3" value={form.days_since_irrigation} onChange={e => F('days_since_irrigation', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Irrigation Method</label>
                        <select className="form-select" value={form.irrigation_method} onChange={e => F('irrigation_method', e.target.value)}>
                            <option value="">Select...</option>
                            {['drip', 'sprinkler', 'flood', 'furrow', 'manual'].map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                        </select>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Calculating...' : <><i className="fas fa-calculator"></i> Calculate Resources</>}</button>
            </form>
            {result && (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[{ icon: '💧', label: 'Water', val: `${result.water?.amount} ${result.water?.unit}`, sub: result.water?.frequency, bg: '#e3f2fd' },
                          { icon: '🌿', label: 'Nitrogen', val: `${result.fertilizer?.nitrogen} ${result.fertilizer?.unit}`, sub: 'N requirement', bg: '#e8f5e9' },
                          { icon: '🧪', label: 'Phosphorus', val: `${result.fertilizer?.phosphorus} ${result.fertilizer?.unit}`, sub: 'P requirement', bg: '#fff3e0' },
                          { icon: '⚡', label: 'Potassium', val: `${result.fertilizer?.potassium} ${result.fertilizer?.unit}`, sub: 'K requirement', bg: '#fce4ec' }
                        ].map(c => (
                            <div key={c.label} style={{ padding: '1.25rem', borderRadius: 'var(--radius)', background: c.bg, textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.label}</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark)' }}>{c.val}</div>
                                <small style={{ color: 'var(--text-muted)' }}>{c.sub}</small>
                            </div>
                        ))}
                    </div>
                    {result.schedule?.length > 0 && (
                        <ResultCard icon="calendar-alt" title="Schedule" color="#0d6efd">
                            {result.schedule.map((s, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}><strong>{s.task}</strong><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{s.timing}</span></div>)}
                        </ResultCard>
                    )}
                    {result.cost && (
                        <ResultCard icon="rupee-sign" title="Estimated Cost" color="#28a745">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                                {[['Water', result.cost.water], ['Fertilizer', result.cost.fertilizer], ['Labor', result.cost.labor], ['Total', result.cost.total]].map(([l, v]) => (
                                    <div key={l} style={{ padding: '0.75rem', background: l === 'Total' ? 'rgba(40,167,69,0.1)' : '#f8f9fa', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l}</div>
                                        <div style={{ fontWeight: 800, fontSize: l === 'Total' ? '1.2rem' : '1rem', color: l === 'Total' ? 'var(--primary)' : 'var(--dark)' }}>₹{v}</div>
                                    </div>
                                ))}
                            </div>
                        </ResultCard>
                    )}
                </div>
            )}
        </div>
    );
}

// ──────── Weather Forecast ────────
const WMO_ICON = code => { const n = Number(code); if (n === 0) return { icon: 'sun', color: '#ffc107', label: 'Clear' }; if (n <= 3) return { icon: 'cloud-sun', color: '#fd7e14', label: 'Cloudy' }; if (n <= 69) return { icon: 'cloud-rain', color: '#0d6efd', label: 'Rain' }; if (n <= 99) return { icon: 'bolt', color: '#6f42c1', label: 'Storm' }; return { icon: 'cloud', color: '#adb5bd', label: 'Overcast' }; };
const FARM_ADVICE = code => { const n = Number(code); if (n >= 95) return 'Avoid field work. Thunderstorms detected.'; if (n >= 60) return 'Rain expected. Delay irrigation.'; return 'Clear conditions. Maintain schedule.'; };

async function getWeatherByCity(city) {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    if (!geoData.results?.length) throw new Error(`City "${city}" not found.`);
    const { latitude, longitude, name } = geoData.results[0];
    const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
    const w = await wRes.json();
    return { current: { city: name, temp: Math.round(w.current.temperature_2m), humidity: w.current.relative_humidity_2m, condition: w.current.weather_code }, forecast: (w.daily.time || []).map((t, i) => ({ day: t, temp_high: w.daily.temperature_2m_max[i], temp_low: w.daily.temperature_2m_min[i], condition: w.daily.weather_code[i] })) };
}

function WeatherForecast() {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSearch = async e => { e.preventDefault(); setLoading(true); setError(''); try { setWeather(await getWeatherByCity(city)); } catch (err) { setError(err.message); } finally { setLoading(false); } };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}><i className="fas fa-cloud-sun" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Weather Forecast</h4>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input className="form-control" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city name..." required />
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
            </form>
            {error && <div style={{ color: '#dc3545', padding: '0.5rem' }}>{error}</div>}
            {weather && (
                <div>
                    <div style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', borderRadius: 'var(--radius)', padding: '2rem', color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>
                        <i className={`fas fa-${WMO_ICON(weather.current.condition).icon}`} style={{ fontSize: '3rem', marginBottom: '0.5rem' }}></i>
                        <h3 style={{ margin: '0.5rem 0', fontWeight: 800 }}>{weather.current.city}</h3>
                        <div style={{ fontSize: '3rem', fontWeight: 800 }}>{weather.current.temp}°C</div>
                        <div style={{ opacity: 0.85 }}>{WMO_ICON(weather.current.condition).label} · Humidity: {weather.current.humidity}%</div>
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem' }}>🌾 {FARM_ADVICE(weather.current.condition)}</div>
                    </div>
                    <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>7-Day Forecast</h6>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                        {weather.forecast.map((d, i) => { const w = WMO_ICON(d.condition); return (
                            <div key={i} style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center', background: i === 0 ? '#f0fdf4' : 'white' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{d.day}</div>
                                <i className={`fas fa-${w.icon}`} style={{ fontSize: '1.5rem', color: w.color }}></i>
                                <div style={{ fontWeight: 700, marginTop: '0.5rem' }}>{Math.round(d.temp_high)}° / {Math.round(d.temp_low)}°</div>
                            </div>
                        ); })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ──────── Soil Analysis ────────
function SoilAnalysis() {
    const [form, setForm] = useState({ soilType: '', organicMatter: '', soilPh: '', nitrogen: '', phosphorus: '', potassium: '', ec: '', moisture: '', previousCrop: '', season: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async e => {
        e.preventDefault(); setLoading(true);
        try {
            const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? undefined : isNaN(v) ? v : parseFloat(v)]));
            setResult(await aiApi.soilAnalysis(data));
        } catch { setResult({ score: 65, healthStatus: 'Good', issues: ['Low Nitrogen'], recommendations: ['Add organic compost'], suitableCrops: ['Rice', 'Wheat'], nutrientLevels: { 'Nitrogen (N)': 'Low', 'pH Level': 'Neutral' } }); }
        finally { setLoading(false); }
    };

    const scoreColor = result ? (result.score >= 80 ? '#28a745' : result.score >= 60 ? '#17a2b8' : result.score >= 40 ? '#ffc107' : '#dc3545') : '#aaa';
    const summaryText = result ? `Soil score: ${result.score}/100 (${result.healthStatus}). Issues: ${(result.issues || []).join(', ')}. Recommendations: ${(result.recommendations || []).join('. ')}` : '';

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}><i className="fas fa-flask" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Comprehensive Soil Analysis</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Provide detailed soil data for a thorough health assessment with nutrient analysis and crop suitability.</p>
            <form onSubmit={handleSubmit}>
                <div style={{ background: '#f8fdf9', border: '1px solid rgba(45,106,79,0.1)', borderRadius: 'var(--radius)', padding: '1rem 1rem 0', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d6a4f', marginBottom: '0.75rem' }}><i className="fas fa-vial"></i> Basic Properties</p>
                    <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="form-group"><label className="form-label">Soil Type *</label>
                            <select className="form-select" required value={form.soilType} onChange={e => F('soilType', e.target.value)}>
                                <option value="">Select...</option>
                                {['Loamy', 'Clay', 'Sandy', 'Silt', 'Black', 'Red', 'Laterite', 'Peaty'].map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Soil pH *</label><input className="form-control" type="number" step="0.1" required placeholder="e.g. 6.5" value={form.soilPh} onChange={e => F('soilPh', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Organic Matter (%)</label><input className="form-control" type="number" step="0.1" placeholder="e.g. 3.5" value={form.organicMatter} onChange={e => F('organicMatter', e.target.value)} /></div>
                    </div>
                </div>
                <div style={{ background: '#f8fdf9', border: '1px solid rgba(45,106,79,0.1)', borderRadius: 'var(--radius)', padding: '1rem 1rem 0', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d6a4f', marginBottom: '0.75rem' }}><i className="fas fa-flask"></i> Nutrient Levels (kg/hectare)</p>
                    <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="form-group"><label className="form-label">Nitrogen (N)</label><input className="form-control" type="number" placeholder="e.g. 45" value={form.nitrogen} onChange={e => F('nitrogen', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Phosphorus (P)</label><input className="form-control" type="number" placeholder="e.g. 35" value={form.phosphorus} onChange={e => F('phosphorus', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Potassium (K)</label><input className="form-control" type="number" placeholder="e.g. 40" value={form.potassium} onChange={e => F('potassium', e.target.value)} /></div>
                    </div>
                </div>
                <div style={{ background: '#f8fdf9', border: '1px solid rgba(45,106,79,0.1)', borderRadius: 'var(--radius)', padding: '1rem 1rem 0', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d6a4f', marginBottom: '0.75rem' }}><i className="fas fa-tint"></i> Additional Parameters</p>
                    <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="form-group"><label className="form-label">EC (dS/m)</label><input className="form-control" type="number" step="0.1" placeholder="e.g. 1.2" value={form.ec} onChange={e => F('ec', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Moisture (%)</label><input className="form-control" type="number" placeholder="e.g. 50" value={form.moisture} onChange={e => F('moisture', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Previous Crop</label><input className="form-control" placeholder="e.g. Rice" value={form.previousCrop} onChange={e => F('previousCrop', e.target.value)} /></div>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Analyzing...' : <><i className="fas fa-microscope"></i> Analyze Soil</>}</button>
            </form>
            {result && (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem', padding: '1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', border: `6px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', flexShrink: 0 }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor }}>{result.score}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/100</div>
                        </div>
                        <div>
                            <h5 style={{ fontWeight: 800, margin: '0 0 0.25rem' }}>Soil Health: <span style={{ color: scoreColor }}>{result.healthStatus}</span></h5>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>{result.issues?.[0] || 'Analysis complete'}</p>
                        </div>
                    </div>
                    {result.nutrientLevels && (
                        <ResultCard icon="chart-bar" title="Nutrient Levels">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                                {Object.entries(result.nutrientLevels).map(([k, v]) => (
                                    <div key={k} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: v === 'Low' ? '#fff3cd' : v === 'High' || v === 'Alkaline' ? '#f8d7da' : '#d4edda', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{k}</div>
                                        <div style={{ fontWeight: 700, color: v === 'Low' ? '#856404' : v === 'High' || v === 'Alkaline' ? '#721c24' : '#155724' }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </ResultCard>
                    )}
                    {result.issues?.length > 0 && <ResultCard icon="exclamation-triangle" title="Detected Issues" color="#dc3545"><ul style={{ margin: 0, paddingLeft: '1.25rem' }}>{result.issues.map((s, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{s}</li>)}</ul></ResultCard>}
                    {result.recommendations?.length > 0 && <ResultCard icon="lightbulb" title="Recommendations" color="#e67e22"><ul style={{ margin: 0, paddingLeft: '1.25rem' }}>{result.recommendations.map((s, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{s}</li>)}</ul></ResultCard>}
                    {result.suitableCrops?.length > 0 && <ResultCard icon="leaf" title="Suitable Crops for Your Soil"><div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{result.suitableCrops.map(c => <span key={c} style={{ padding: '0.4rem 1rem', borderRadius: '20px', background: 'rgba(40,167,69,0.1)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>{c}</span>)}</div></ResultCard>}
                    <VoiceExplainer text={summaryText} title="Soil Analysis" />
                </div>
            )}
        </div>
    );
}

// ──────── Soil & Environment Analyzer ────────
function SoilEnvAnalyzer() {
    const [form, setForm] = useState({ cropName: '', location: '', soilPh: '', moisture: '', potassium: '', temperature: '', humidity: '', rainfall: '' });
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async e => {
        e.preventDefault(); setLoading(true); setError(''); setResult(null);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(k => { if (form[k]) formData.append(k, form[k]); });
            if (image) formData.append('image', image);
            const res = await fetch(`${API_BASE}/ai-tools/analyze`, { ...getManualOptions('POST', true), body: formData });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setResult(await res.json());
        } catch (err) { setError(`Failed: ${err.message}`); }
        finally { setLoading(false); }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}><i className="fas fa-microscope" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>AI Comprehensive Analysis</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Upload a crop/soil image with environmental data for disease detection and comprehensive analysis.</p>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Crop Name</label><input className="form-control" placeholder="e.g. Tomato" value={form.cropName} onChange={e => F('cropName', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Location</label><input className="form-control" placeholder="e.g. Nashik" value={form.location} onChange={e => F('location', e.target.value)} /></div>
                </div>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <div className="form-group"><label className="form-label">Soil pH</label><input className="form-control" type="number" step="0.1" placeholder="e.g. 6.5" value={form.soilPh} onChange={e => F('soilPh', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Moisture (%)</label><input className="form-control" type="number" placeholder="e.g. 50" value={form.moisture} onChange={e => F('moisture', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Potassium</label><input className="form-control" type="number" placeholder="e.g. 40" value={form.potassium} onChange={e => F('potassium', e.target.value)} /></div>
                </div>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <div className="form-group"><label className="form-label">Temperature (°C)</label><input className="form-control" type="number" placeholder="e.g. 28" value={form.temperature} onChange={e => F('temperature', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Humidity (%)</label><input className="form-control" type="number" placeholder="e.g. 65" value={form.humidity} onChange={e => F('humidity', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Rainfall (mm)</label><input className="form-control" type="number" placeholder="e.g. 120" value={form.rainfall} onChange={e => F('rainfall', e.target.value)} /></div>
                </div>
                <div className="form-group"><label className="form-label">Upload Crop/Soil Image</label><input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="form-control" /></div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><span className="spinner"></span> Analyzing...</> : <><i className="fas fa-brain"></i> Analyze</>}</button>
            </form>
            {error && <div style={{ color: '#dc3545', background: '#f8d7da', padding: '0.75rem', marginTop: '1rem', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
            {result && (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <Badge label="Issue" value={result.issue} color={result.severity === 'High' ? '#dc3545' : result.severity === 'Medium' ? '#ffc107' : '#28a745'} />
                        <Badge label="Severity" value={result.severity} color={result.severity === 'High' ? '#dc3545' : '#ffc107'} />
                        <Badge label="Confidence" value={`${((result.confidence || 0) * 100).toFixed(0)}%`} color="#6f42c1" />
                    </div>
                    {result.causes?.length > 0 && <ResultCard icon="search" title="Root Causes" color="#dc3545"><ul style={{ margin: 0, paddingLeft: '1.25rem' }}>{result.causes.map((c, i) => <li key={i}>{c}</li>)}</ul></ResultCard>}
                    {result.solutions?.length > 0 && <ResultCard icon="check-circle" title="Solutions" color="#28a745"><ul style={{ margin: 0, paddingLeft: '1.25rem' }}>{result.solutions.map((s, i) => <li key={i}>{s}</li>)}</ul></ResultCard>}
                    {result.image_observation && <ResultCard icon="camera" title="Image Analysis"><p style={{ margin: 0 }}>{result.image_observation}</p></ResultCard>}
                </div>
            )}
        </div>
    );
}

// ──────── Main AI Tools Page ────────
const TABS = [
    { id: 'crop', label: 'Crop Recommendation', icon: 'seedling' },
    { id: 'resource', label: 'Resource Management', icon: 'chart-line' },
    { id: 'weather', label: 'Weather Forecast', icon: 'cloud-sun' },
    { id: 'soil', label: 'Soil Analysis', icon: 'flask' },
    { id: 'soil-env', label: 'AI Analyzer', icon: 'microscope' },
];

export default function AITools() {
    const [activeTab, setActiveTab] = useState('crop');
    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>AI Farming Tools</h1>
                    <p>Intelligent tools powered by AI for smarter, data-driven farming decisions.</p>
                </div>
            </div>
            <section className="section">
                <div className="container">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                                padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-full)', border: '2px solid',
                                borderColor: activeTab === t.id ? 'var(--primary)' : 'var(--border)',
                                background: activeTab === t.id ? 'var(--primary)' : 'white',
                                color: activeTab === t.id ? 'white' : 'var(--dark)',
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600,
                            }}><i className={`fas fa-${t.icon}`}></i> {t.label}</button>
                        ))}
                    </div>
                    {activeTab === 'crop' && <CropRecommendation />}
                    {activeTab === 'resource' && <ResourceManagement />}
                    {activeTab === 'weather' && <WeatherForecast />}
                    {activeTab === 'soil' && <SoilAnalysis />}
                    {activeTab === 'soil-env' && <SoilEnvAnalyzer />}
                </div>
            </section>
        </>
    );
}
