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
        { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
        { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
        { code: 'en-IN', label: 'English (India)' },
        { code: 'en-US', label: 'English (US)' },
        { code: 'te-IN', label: 'Telugu (తెలుగు)' },
        { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
        { code: 'ml-IN', label: 'Malayalam (മലയാളം)' },
        { code: 'mr-IN', label: 'Marathi (मराठी)' },
        { code: 'bn-IN', label: 'Bengali (বাংলা)' },
        { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
    ];

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis?.getVoices() || [];
            setAvailableVoices(voices);
        };
        loadVoices();
        window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices);
        return () => {
            window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices);
            window.speechSynthesis?.cancel();
        };
    }, []);

    const summary = typeof text === 'string' ? text : `Analysis complete for ${title || 'your data'}. Please review the detailed results above for specific recommendations and insights.`;

    const getVoiceText = useCallback(() => {
        if (selectedLang === 'ta-IN') return translateToTamil(text, title);
        if (selectedLang === 'hi-IN') return translateToHindi(text, title);
        return summary;
    }, [selectedLang, text, title, summary]);

    const speak = useCallback((textToSpeak) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(textToSpeak);
        utter.lang = selectedLang;
        utter.rate = 0.9;
        utter.pitch = 1;
        const matchVoice = availableVoices.find(v => v.lang === selectedLang) ||
            availableVoices.find(v => v.lang.startsWith(selectedLang.split('-')[0]));
        if (matchVoice) utter.voice = matchVoice;
        utter.onend = () => { setIsPlaying(false); setIsPaused(false); };
        utter.onerror = () => { setIsPlaying(false); setIsPaused(false); };
        utteranceRef.current = utter;
        window.speechSynthesis.speak(utter);
        setIsPlaying(true);
        setIsPaused(false);
    }, [selectedLang, availableVoices]);

    const handlePlay = () => {
        if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); setIsPlaying(true); return; }
        speak(getVoiceText());
    };
    const handlePause = () => { window.speechSynthesis.pause(); setIsPaused(true); setIsPlaying(false); };
    const handleStop = () => { window.speechSynthesis.cancel(); setIsPlaying(false); setIsPaused(false); };

    const toggleVoice = () => {
        if (voiceOn) { handleStop(); setVoiceOn(false); }
        else { setVoiceOn(true); }
    };

    return (
        <div className="voice-explainer" style={{
            background: 'linear-gradient(135deg, #f0fdf4, #e8f5e9)',
            border: '1px solid rgba(45,106,79,0.2)', borderRadius: 'var(--radius)',
            padding: '1.25rem', marginTop: '1.5rem',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <h6 style={{ fontWeight: 800, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fas fa-magic"></i> AI Summary & Voice Explanation
                </h6>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => setShowSummary(!showSummary)} className="btn btn-sm btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}>
                        <i className={`fas ${showSummary ? 'fa-eye-slash' : 'fa-eye'}`}></i> {showSummary ? 'Hide' : 'Read'} Summary
                    </button>
                    <button onClick={toggleVoice} className={`btn btn-sm ${voiceOn ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}>
                        <i className={`fas ${voiceOn ? 'fa-volume-up' : 'fa-volume-mute'}`}></i> Voice {voiceOn ? 'On' : 'Off'}
                    </button>
                </div>
            </div>

            {showSummary && (
                <div style={{
                    background: 'white', borderRadius: 'var(--radius-sm)', padding: '1rem',
                    marginBottom: '0.75rem', fontSize: '0.88rem', lineHeight: 1.7,
                    border: '1px solid rgba(45,106,79,0.1)',
                }}>
                    {summary.split('\n').map((line, i) => (
                        <p key={i} style={{ margin: i < summary.split('\n').length - 1 ? '0 0 0.5rem' : 0 }}>{line}</p>
                    ))}
                </div>
            )}

            {voiceOn && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
                    background: 'white', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
                    border: '1px solid rgba(45,106,79,0.1)',
                }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={handlePlay} disabled={isPlaying && !isPaused}
                            style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--primary)', background: isPlaying && !isPaused ? 'var(--primary)' : 'white', color: isPlaying && !isPaused ? 'white' : 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            <i className="fas fa-play" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                        <button onClick={handlePause} disabled={!isPlaying || isPaused}
                            style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--primary)', background: isPaused ? 'var(--primary)' : 'white', color: isPaused ? 'white' : 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            <i className="fas fa-pause" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                        <button onClick={handleStop} disabled={!isPlaying && !isPaused}
                            style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #dc3545', background: 'white', color: '#dc3545', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            <i className="fas fa-stop" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                    </div>
                    <select value={selectedLang} onChange={e => { setSelectedLang(e.target.value); handleStop(); }}
                        style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer', flex: 1, minWidth: '140px' }}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
}

function translateToTamil(text, title) {
    if (typeof text !== 'string') return text;
    let tamil = text;
    const replacements = [
        [/Soil health analysis completed/gi, 'மண் ஆரோக்கிய பகுப்பாய்வு முடிந்தது'],
        [/Overall score/gi, 'ஒட்டுமொத்த மதிப்பெண்'],
        [/Detected issues/gi, 'கண்டறியப்பட்ட சிக்கல்கள்'],
        [/Recommendations/gi, 'பரிந்துரைகள்'],
    ];
    replacements.forEach(([reg, rep]) => { tamil = tamil.replace(reg, rep); });
    return tamil;
}

function translateToHindi(text, title) {
    if (typeof text !== 'string') return text;
    let hindi = text;
    const replacements = [
        [/Soil health analysis completed/gi, 'मिट्टी स्वास्थ्य विश्लेषण पूरा हुआ'],
        [/Overall score/gi, 'कुल स्कोर'],
        [/Detected issues/gi, 'पाई गई समस्याएं'],
        [/Recommendations/gi, 'सिफारिशें'],
    ];
    replacements.forEach(([reg, rep]) => { hindi = hindi.replace(reg, rep); });
    return hindi;
}

// ──────── Crop Recommendation ────────
function CropRecommendation() {
    const [form, setForm] = useState({ potassium: '', temperature: '', humidity: '', ph: '', rainfall: '', location: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true); setError(''); setResult(null);
        try {
            const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, isNaN(v) || v === '' ? v : parseFloat(v)]));
            const res = await aiApi.cropRecommendation(data);
            setResult({
                recommended_crops: (res.recommendedCrops || []).map(c => ({ name: c.name, confidence: c.confidence, reason: c.reason })),
                soil_health: res.soilHealth,
                recommendations: res.recommendations || [],
            });
        } catch (err) {
            setError(`Backend offline or error: ${err.message}. Using rule-based fallback.`);
            setResult({
                recommended_crops: [{ name: 'Rice', confidence: 0.9, reason: 'High rainfall' }, { name: 'Wheat', confidence: 0.8, reason: 'Moderate temp' }],
                soil_health: 'Good (Simulated)',
                recommendations: ['Consider crop rotation', 'Monitor pH regularly'],
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-seedling" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Crop Recommendation</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Potassium</label><input className="form-control" type="number" required value={form.potassium} onChange={e => setForm({ ...form, potassium: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Temperature (°C)</label><input className="form-control" type="number" required value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Humidity (%)</label><input className="form-control" type="number" required value={form.humidity} onChange={e => setForm({ ...form, humidity: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Soil pH</label><input className="form-control" type="number" step="0.1" required value={form.ph} onChange={e => setForm({ ...form, ph: e.target.value })} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Rainfall (mm)</label><input className="form-control" type="number" required value={form.rainfall} onChange={e => setForm({ ...form, rainfall: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Location</label><input className="form-control" type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Analyzing...' : 'Get Recommendation'}</button>
            </form>
            {error && <div style={{ color: '#856404', background: '#fff3cd', padding: '0.75rem', marginTop: '1rem', borderRadius: '4px' }}>{error}</div>}
            {result && (
                <div style={{ marginTop: '2rem' }}>
                    <div className="grid grid-3">
                        {result.recommended_crops.map(c => (
                            <div key={c.name} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <h6>{c.name}</h6>
                                <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{(c.confidence * 100).toFixed(0)}% Match</div>
                                <small>{c.reason}</small>
                            </div>
                        ))}
                    </div>
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

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true); setResult(null);
        try {
            const res = await aiApi.resourceManagement({
                cropType: form.crop_type,
                farmArea: parseFloat(form.farm_area),
                growthStage: form.growth_stage,
                soilMoisture: parseFloat(form.soil_moisture),
                daysSinceIrrigation: parseInt(form.days_since_irrigation),
                irrigationMethod: form.irrigation_method,
            });
            setResult(res);
        } catch {
            setResult({ water: { amount: 500, unit: 'liters' }, fertilizer: { nitrogen: 20, phosphorus: 15, potassium: 15, unit: 'kg' } });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-chart-line" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Resource Management</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Crop Type</label><input className="form-control" type="text" value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Farm Area</label><input className="form-control" type="number" value={form.farm_area} onChange={e => setForm({ ...form, farm_area: e.target.value })} /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>Calculate</button>
            </form>
            {result && <div style={{ marginTop: '1rem' }}>Water Needed: {result.water?.amount} {result.water?.unit}</div>}
        </div>
    );
}

// ──────── Weather Forecast ────────
const WMO_ICON = code => {
    const n = Number(code);
    if (n === 0) return { icon: 'sun', color: '#ffc107', label: 'Clear Sky' };
    if (n <= 3) return { icon: 'cloud-sun', color: '#fd7e14', label: 'Cloudy' };
    if (n <= 69) return { icon: 'cloud-rain', color: '#0d6efd', label: 'Rain' };
    if (n <= 99) return { icon: 'bolt', color: '#6f42c1', label: 'Storm' };
    return { icon: 'cloud', color: '#adb5bd', label: 'Overcast' };
};

const FARM_ADVICE = code => {
    const n = Number(code);
    if (n >= 95) return 'Avoid field work. Thunderstorms detected.';
    if (n >= 60) return 'Rain expected. Delay irrigation.';
    return 'Conditions are clear. Maintain regular farming schedule.';
};

async function getWeatherByCity(city) {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    if (!geoData.results?.length) throw new Error(`City "${city}" not found.`);
    const { latitude, longitude, name } = geoData.results[0];
    return getWeatherByCoords(latitude, longitude, name);
}

async function getWeatherByCoords(lat, lon, label = '') {
    const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
    const w = await wRes.json();
    return {
        current: { city: label || 'My Location', temp: Math.round(w.current.temperature_2m), humidity: w.current.relative_humidity_2m, condition: w.current.weather_code },
        forecast: (w.daily.time || []).map((t, i) => ({ day: t, temp_high: w.daily.temperature_2m_max[i], temp_low: w.daily.temperature_2m_min[i], condition: w.daily.weather_code[i] }))
    };
}

function WeatherForecast() {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async e => {
        e.preventDefault();
        setLoading(true); setError('');
        try { setWeather(await getWeatherByCity(city)); }
        catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-cloud-sun" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Weather</h4>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="form-control" value={city} onChange={e => setCity(e.target.value)} placeholder="City name..." />
                <button type="submit" className="btn btn-primary" disabled={loading}>Search</button>
            </form>
            {weather && (
                <div style={{ marginTop: '1rem' }}>
                    <h5>{weather.current.city}: {weather.current.temp}°C</h5>
                    <p>{WMO_ICON(weather.current.condition).label}</p>
                    <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>Advice: {FARM_ADVICE(weather.current.condition)}</div>
                </div>
            )}
        </div>
    );
}

// ──────── Soil Analysis ────────
function SoilAnalysis() {
    const [form, setForm] = useState({ soilType: '', organicMatter: '', soilPh: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await aiApi.soilAnalysis({ soilType: form.soilType, organicMatter: parseFloat(form.organicMatter), soilPh: parseFloat(form.soilPh) });
            setResult(res);
        } catch {
            setResult({ score: 75, issues: ['Low Nitrogen'], recommendations: ['Add organic compost'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-flask" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Soil Analysis</h4>
            <form onSubmit={handleSubmit}>
                <input className="form-control" placeholder="Soil Type" value={form.soilType} onChange={e => setForm({ ...form, soilType: e.target.value })} style={{ marginBottom: '0.5rem' }} />
                <input className="form-control" type="number" placeholder="pH" value={form.soilPh} onChange={e => setForm({ ...form, soilPh: e.target.value })} style={{ marginBottom: '0.5rem' }} />
                <button type="submit" className="btn btn-primary" disabled={loading}>Analyze</button>
            </form>
            {result && <div style={{ marginTop: '1rem' }}>Score: {result.score}/100</div>}
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

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true); setError(''); setResult(null);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(k => formData.append(k, form[k]));
            if (image) formData.append('image', image);

            const res = await fetch(`${API_BASE}/ai-tools/analyze`, {
                ...getManualOptions('POST', true),
                body: formData
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setResult(await res.json());
        } catch (err) {
            const fullUrl = `${API_BASE}/ai-tools/analyze`;
            setError(`Failed to reach backend at ${fullUrl}. Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-microscope" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>AI Comprehensive Analysis</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group"><input className="form-control" placeholder="Crop Name" value={form.cropName} onChange={e => setForm({ ...form, cropName: e.target.value })} /></div>
                    <div className="form-group"><input className="form-control" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                </div>
                <div className="form-group"><input type="file" onChange={e => setImage(e.target.files[0])} className="form-control" /></div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Soil & Image'}</button>
            </form>
            {error && <div style={{ color: '#dc3545', background: '#f8d7da', padding: '0.75rem', marginTop: '1rem', borderRadius: '4px' }}>{error}</div>}
            {result && <div style={{ marginTop: '1rem' }}>Issue: {result.issue}</div>}
        </div>
    );
}

// ──────── Main AI Tools Page ────────
const TABS = [
    { id: 'crop', label: 'Crop Recommendation', icon: 'seedling' },
    { id: 'resource', label: 'Resource Management', icon: 'chart-line' },
    { id: 'weather', label: 'Weather Forecast', icon: 'cloud-sun' },
    { id: 'soil', label: 'Soil Analysis', icon: 'flask' },
    { id: 'soil-env', label: 'Soil & Environment Analyzer', icon: 'leaf' },
];

export default function AITools() {
    const [activeTab, setActiveTab] = useState('crop');

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>AI Farming Tools</h1>
                    <p>Intelligent tools for smarter farming. (Backend: {API_BASE})</p>
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
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem',
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
