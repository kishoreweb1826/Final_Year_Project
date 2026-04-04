import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { aiApi } from '../services/api';

// â”€â”€â”€â”€â”€â”€â”€â”€ Voice Explainer Component â”€â”€â”€â”€â”€â”€â”€â”€
function VoiceExplainer({ text, title }) {
    const [voiceOn, setVoiceOn] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedLang, setSelectedLang] = useState('ta-IN');
    const [availableVoices, setAvailableVoices] = useState([]);
    const [showSummary, setShowSummary] = useState(false);
    const utteranceRef = useRef(null);

    const LANGUAGES = [
        { code: 'ta-IN', label: 'Tamil (à®¤à®®à®¿à®´à¯)' },
        { code: 'hi-IN', label: 'Hindi (à¤¹à¤¿à¤¨à¥à¤¦à¥€)' },
        { code: 'en-IN', label: 'English (India)' },
        { code: 'en-US', label: 'English (US)' },
        { code: 'te-IN', label: 'Telugu (à°¤à±†à°²à±à°—à±)' },
        { code: 'kn-IN', label: 'Kannada (à²•à²¨à³à²¨à²¡)' },
        { code: 'ml-IN', label: 'Malayalam (à´®à´²à´¯à´¾à´³à´‚)' },
        { code: 'mr-IN', label: 'Marathi (à¤®à¤°à¤¾à¤ à¥€)' },
        { code: 'bn-IN', label: 'Bengali (à¦¬à¦¾à¦‚à¦²à¦¾)' },
        { code: 'gu-IN', label: 'Gujarati (àª—à«àªœàª°àª¾àª¤à«€)' },
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

    const summary = generateSummary(text, title);

    // Get the text to speak based on selected language
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
        // Try to find a matching voice
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
                            style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--primary)', background: isPlaying && !isPaused ? 'var(--primary)' : 'white', color: isPlaying && !isPaused ? 'white' : 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            title="Play" aria-label="Play voice">
                            <i className="fas fa-play" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                        <button onClick={handlePause} disabled={!isPlaying || isPaused}
                            style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--primary)', background: isPaused ? 'var(--primary)' : 'white', color: isPaused ? 'white' : 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            title="Pause" aria-label="Pause voice">
                            <i className="fas fa-pause" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                        <button onClick={handleStop} disabled={!isPlaying && !isPaused}
                            style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #dc3545', background: 'white', color: '#dc3545', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            title="Stop" aria-label="Stop voice">
                            <i className="fas fa-stop" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                    </div>
                    <select value={selectedLang} onChange={e => { setSelectedLang(e.target.value); handleStop(); }}
                        style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer', flex: 1, minWidth: '140px' }}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                    {isPlaying && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span className="voice-wave-dot"></span>
                            <span className="voice-wave-dot" style={{ animationDelay: '0.15s' }}></span>
                            <span className="voice-wave-dot" style={{ animationDelay: '0.3s' }}></span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Speaking...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function generateSummary(text, title) {
    if (typeof text === 'string') return text;
    return `Analysis complete for ${title || 'your data'}. Please review the detailed results above for specific recommendations and insights.`;
}

function translateToTamil(text, title) {
    if (typeof text !== 'string' || !text.trim()) {
        const titleTam = title ? `பகுப்பாய்வு: ${title}` : "பகுப்பாய்வு முடிவுகள்";
        return `வணக்கம். ${titleTam} இன்னும் கிடைக்கவில்லை. தயவுசெய்து உங்கள் தகவல்களை உள்ளிட்டு பகுப்பாய்வு செய்யவும்.`;
    }

    let tamil = text;

    const replacements = [
        [/Based on your soil and climate parameters, the top recommended crops are:/gi, 'உங்கள் மண் மற்றும் காலநிலை சூழலின்படி, இந்த பயிர்கள் விளைவிக்க சிறந்தவை என்று பரிந்துரைக்கப்படுகின்றன:'],
        [/Soil health analysis completed\. Overall score: (\d+) out of 100\./gi, 'மண் ஆரோக்கிய பகுப்பாய்வு வெற்றிகரமாக முடிந்தது. உங்கள் மண்ணின் ஒட்டுமொத்த தரம் 100-க்கு $1 என்று கணக்கிடப்பட்டுள்ளது.'],
        [/Analysis complete for /gi, 'பகுப்பாய்வு முடிந்தது: '],
        [/Please review the detailed results above for specific recommendations and insights/gi, 'விரிவான பரிந்துரைகள் மற்றும் தகவல்களுக்கு மேலே உள்ள முடிவுகளைப் பார்க்கவும்'],
        [/Overall score/gi, 'மொத்த மதிப்பெண்'],
        [/out of 100/gi, '100-க்கு'],
        [/Detected issues/gi, 'கண்டறியப்பட்ட பிரச்சினைகள்'],
        [/Recommendations/gi, 'பரிந்துரைகள்'],
        [/Suitable crops for /gi, 'பயிர் செய்ய ஏற்ற பயிர்கள் '],
        [/soil/gi, 'மண்'],
        [/Water requirement is/gi, 'நீர் தேவை'],
        [/frequency/gi, 'அதிர்வெண்'],
        [/high/gi, 'அதிகம்'],
        [/medium/gi, 'மிதமான'],
        [/low/gi, 'குறைவு'],
        [/good/gi, 'நல்லது'],
        [/poor/gi, 'மோசம்'],
        [/excellent/gi, 'மிகச் சிறப்பு'],
        [/vegetables/gi, 'காய்கறிகள்'],
        [/fruits/gi, 'பழங்கள்'],
        [/grains/gi, 'தானியங்கள்'],
        [/rice/gi, 'அரிசி'],
        [/wheat/gi, 'கோதுமை'],
        [/tomato/gi, 'தக்காளி'],
        [/potato/gi, 'உருளைக்கிழங்கு'],
        [/onion/gi, 'வெங்காயம்'],
        [/carrot/gi, 'கேரட்'],
        [/banana/gi, 'வாழை'],
        [/mango/gi, 'மாம்பழம்'],
        [/coconut/gi, 'தேங்காய்'],
        [/Root causes/gi, 'மூல காரணங்கள்'],
        [/Recommended solutions/gi, 'பரிந்துரைக்கப்பட்ட தீர்வுகள்'],
        [/match/gi, 'பொருத்தம்'],
        [/per kg/gi, 'ஒரு கிலோவிற்கு'],
        [/using/gi, 'பயன்படுத்தி'],
        [/method/gi, 'முறை'],
        [/amount/gi, 'அளவு'],
        [/liters/gi, 'லிட்டர்'],
    ];

    for (const [pattern, replacement] of replacements) {
        tamil = tamil.replace(pattern, replacement);
    }
    
    if (title) return `வணக்கம். உங்கள் ${title} ஆய்வு முடிவுகள் தயார். ${tamil}. விவசாயம் செழிக்க எமது வாழ்த்துக்கள்!`;
    return tamil;
}

function translateToHindi(text, title) {
    if (typeof text !== 'string' || !text.trim()) {
        return `${title || 'आपके डेटा'} का विश्लेषण पूरा हुआ। कृपया विस्तृत परिणाम देखें।`;
    }
    let hindi = text;
    const replacements = [
        [/Based on your soil and climate parameters/gi, 'आपकी मिट्टी और जलवायु मापदंडों के आधार पर'],
        [/the top recommended crops are/gi, 'शीर्ष अनुशंसित फसलें हैं'],
        [/Soil health status/gi, 'मिट्टी स्वास्थ्य स्थिति'],
        [/Additional recommendations/gi, 'अतिरिक्त सिफारिशें'],
        [/Resource analysis results/gi, 'संसाधन विश्लेषण परिणाम'],
        [/Water requirement is/gi, 'पानी की आवश्यकता है'],
        [/Fertilizer needs/gi, 'उर्वरक आवश्यकताएं'],
        [/Total estimated cost is/gi, 'कुल अनुमानित लागत है'],
        [/Soil health analysis completed/gi, 'मिट्टी स्वास्थ्य विश्लेषण पूरा हुआ'],
        [/Overall score/gi, 'कुल स्कोर'],
        [/out of 100/gi, '100 में से'],
        [/Detected issues/gi, 'पाई गई समस्याएं'],
        [/Recommendations/gi, 'सिफारिशें'],
        [/Suitable crops for/gi, 'उपयुक्त फसलें'],
        [/Analysis completed/gi, 'विश्लेषण पूरा हुआ'],
        [/Detected issue/gi, 'पाई गई समस्या'],
        [/confidence/gi, 'विश्वास'],
        [/Severity level/gi, 'गंभीरता स्तर'],
        [/Root causes/gi, 'मूल कारण'],
        [/Recommended solutions/gi, 'अनुशंसित समाधान'],
    ];
    for (const [pattern, replacement] of replacements) {
        hindi = hindi.replace(pattern, replacement);
    }
    return hindi;
}
// ──────── Crop Recommendation
function CropRecommendation() {
    const { showNotification } = useApp();
    const [form, setForm] = useState({ potassium: '', temperature: '', humidity: '', ph: '', rainfall: '', location: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const getCropRec = data => {
        let crops = [
            { name: 'Rice', confidence: 0.92, reason: 'Optimal potassium and high rainfall' },
            { name: 'Wheat', confidence: 0.75, reason: 'Good temperature and pH levels' },
            { name: 'Cotton', confidence: 0.68, reason: 'Suitable climate conditions' },
        ];
        if (data.rainfall > 200) crops[0] = { name: 'Rice', confidence: 0.95, reason: 'High rainfall ideal for rice' };
        else if (data.temperature < 25) crops[0] = { name: 'Wheat', confidence: 0.90, reason: 'Cool temperature perfect for wheat' };
        else if (data.ph > 7) crops[0] = { name: 'Cotton', confidence: 0.88, reason: 'Alkaline soil suits cotton' };
        return {
            recommended_crops: crops.sort((a, b) => b.confidence - a.confidence).slice(0, 3),
            soil_health: data.ph >= 6 && data.ph <= 7.5 ? 'Good' : 'Needs Improvement',
            recommendations: ['Consider crop rotation for better soil health', 'Monitor pH levels regularly', 'Use organic fertilizers to maintain soil quality'],
        };
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, isNaN(v) || v === '' ? v : parseFloat(v)]));
            const res = await aiApi.cropRecommendation(data);
            // Normalise backend response to UI shape
            setResult({
                recommended_crops: (res.recommendedCrops || []).map(c => ({ name: c.name, confidence: c.confidence, reason: c.reason })),
                soil_health: res.soilHealth,
                recommendations: res.recommendations || [],
            });
        } catch {
            // Fallback to local rule-based logic
            const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, isNaN(v) || v === '' ? v : parseFloat(v)]));
            setResult(getCropRec(data));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container" id="crop-recommendation">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-seedling" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Crop Recommendation System</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Enter your soil and climate parameters to get AI-powered crop recommendations.</p>
            <form onSubmit={handleSubmit}>
                <div className="form-row"><div className="form-group"><label className="form-label">Potassium (K) kg/ha</label><input className="form-control" id="potassium" type="number" required value={form.potassium} onChange={e => setForm({ ...form, potassium: e.target.value })} placeholder="e.g. 45" /></div>
                    <div className="form-group"><label className="form-label">Temperature (Â°C)</label><input className="form-control" id="temperature" type="number" required value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} placeholder="e.g. 28" /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Humidity (%)</label><input className="form-control" id="humidity" type="number" min="0" max="100" required value={form.humidity} onChange={e => setForm({ ...form, humidity: e.target.value })} placeholder="e.g. 70" /></div>
                    <div className="form-group"><label className="form-label">Soil pH</label><input className="form-control" id="ph" type="number" step="0.1" min="0" max="14" required value={form.ph} onChange={e => setForm({ ...form, ph: e.target.value })} placeholder="e.g. 6.5" /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Rainfall (mm)</label><input className="form-control" id="rainfall" type="number" required value={form.rainfall} onChange={e => setForm({ ...form, rainfall: e.target.value })} placeholder="e.g. 150" /></div>
                    <div className="form-group"><label className="form-label">Location / Region</label><input className="form-control" id="location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Punjab" /></div></div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <><span className="spinner"></span> Analysing...</> : <><i className="fas fa-brain"></i> Get Recommendation</>}
                </button>
            </form>

            {loading && <div id="cropLoading" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin fa-2x"></i><p>AI is analysing your data...</p></div>}

            {result && (
                <div id="cropResults" style={{ marginTop: '2rem' }}>
                    <h5 style={{ fontWeight: 800, marginBottom: '1rem' }}>Recommended Crops</h5>
                    <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
                        {result.recommended_crops.map((c, i) => (
                            <div key={c.name} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    {i === 0 ? <i className="fas fa-trophy fa-2x" style={{ color: '#ffc107' }}></i> : <i className="fas fa-seedling fa-2x" style={{ color: 'var(--primary)' }}></i>}
                                </div>
                                <h5 style={{ fontWeight: 800 }}>{c.name}</h5>
                                <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${(c.confidence * 100).toFixed(0)}%` }}></div></div>
                                <p style={{ fontWeight: 700, margin: '0.25rem 0' }}>{(c.confidence * 100).toFixed(0)}% Match</p>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.reason}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#d1ecf1', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                        <strong>Soil Health:</strong> {result.soil_health}
                    </div>
                    <h6 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Additional Recommendations:</h6>
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', lineHeight: '2' }}>
                        {(result.recommendations || []).map(r => <li key={r}><i className="fas fa-check-circle" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>{r}</li>)}
                    </ul>
                </div>
            )}

            {result && (
                <VoiceExplainer
                    title="Crop Recommendation"
                    text={`Based on your soil and climate parameters, the top recommended crops are: ${result.recommended_crops.map(c => `${c.name} with ${(c.confidence * 100).toFixed(0)}% match - ${c.reason}`).join('. ')}. Soil health status: ${result.soil_health}. Additional recommendations: ${(result.recommendations || []).join('. ')}`}
                />
            )}
        </div>
    );
}

// â”€â”€â”€â”€â”€â”€â”€â”€ Resource Management â”€â”€â”€â”€â”€â”€â”€â”€
function ResourceManagement() {
    const [form, setForm] = useState({ crop_type: '', farm_area: '', growth_stage: '', soil_moisture: '', days_since_irrigation: '', irrigation_method: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const calc = data => {
        const waterBase = { rice: 1500, wheat: 450, maize: 500, cotton: 700, sugarcane: 2000, vegetables: 400 };
        const base = waterBase[data.crop_type] || 500;
        const waterNeeded = ((base * data.farm_area * (100 - data.soil_moisture)) / 100).toFixed(0);
        const fertBase = (data.farm_area * 50).toFixed(0);
        return {
            water: { amount: waterNeeded, unit: 'liters', frequency: data.growth_stage === 'flowering' ? 'Every 2 days' : 'Every 3-4 days', method: data.irrigation_method },
            fertilizer: { nitrogen: (fertBase * 0.4).toFixed(0), phosphorus: (fertBase * 0.3).toFixed(0), potassium: (fertBase * 0.3).toFixed(0), unit: 'kg' },
            schedule: [
                { task: 'Irrigation', timing: data.days_since_irrigation >= 3 ? 'Urgent - Today' : 'Within 2 days' },
                { task: 'Fertilizer Application', timing: `Weekly during ${data.growth_stage}` },
                { task: 'Pest Monitoring', timing: 'Daily inspection' },
                { task: 'Weed Control', timing: 'Bi-weekly' },
            ],
            cost: { water: (waterNeeded * 0.05).toFixed(0), fertilizer: (fertBase * 25).toFixed(0), labor: (data.farm_area * 200).toFixed(0), total: (waterNeeded * 0.05 + fertBase * 25 + data.farm_area * 200).toFixed(0) },
        };
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
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
            const data = { ...form, farm_area: parseFloat(form.farm_area), soil_moisture: parseFloat(form.soil_moisture), days_since_irrigation: parseInt(form.days_since_irrigation) };
            setResult(calc(data));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container" id="resource-management">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-chart-line" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Resource Management</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Optimize water usage, fertilizer, and crop schedule.</p>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Crop Type *</label>
                        <select className="form-select" id="cropType" required value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })}>
                            <option value="">Select crop...</option>
                            {['rice', 'wheat', 'maize', 'cotton', 'sugarcane', 'vegetables'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select></div>
                    <div className="form-group"><label className="form-label">Farm Area (acres) *</label><input className="form-control" id="farmArea" type="number" required min="0.1" step="0.1" value={form.farm_area} onChange={e => setForm({ ...form, farm_area: e.target.value })} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Growth Stage *</label>
                        <select className="form-select" id="growthStage" required value={form.growth_stage} onChange={e => setForm({ ...form, growth_stage: e.target.value })}>
                            <option value="">Select stage...</option>
                            {['seedling', 'vegetative', 'flowering', 'fruiting', 'maturity'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select></div>
                    <div className="form-group"><label className="form-label">Irrigation Method *</label>
                        <select className="form-select" id="irrigationMethod" required value={form.irrigation_method} onChange={e => setForm({ ...form, irrigation_method: e.target.value })}>
                            <option value="">Select method...</option>
                            {['Drip Irrigation', 'Sprinkler', 'Flood Irrigation', 'Furrow Irrigation'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Soil Moisture (%) *</label><input className="form-control" id="soilMoisture" type="number" min="0" max="100" required value={form.soil_moisture} onChange={e => setForm({ ...form, soil_moisture: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Days Since Last Irrigation *</label><input className="form-control" id="daysSinceIrrigation" type="number" min="0" required value={form.days_since_irrigation} onChange={e => setForm({ ...form, days_since_irrigation: e.target.value })} /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <><span className="spinner"></span> Calculating...</> : <><i className="fas fa-calculator"></i> Calculate Resources</>}
                </button>
            </form>

            {result && (
                <div id="resourceResults" style={{ marginTop: '2rem' }}>
                    <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
                        <div className="card"><div className="card-body">
                            <h6><i className="fas fa-tint" style={{ color: '#007bff' }}></i> Water Requirements</h6>
                            <h4 style={{ color: '#007bff', margin: '0.5rem 0' }}>{result.water.amount} {result.water.unit}</h4>
                            <p style={{ marginBottom: '0.25rem' }}><strong>Frequency:</strong> {result.water.frequency}</p>
                            <p style={{ margin: 0 }}><strong>Method:</strong> {result.water.method}</p>
                        </div></div>
                        <div className="card"><div className="card-body">
                            <h6><i className="fas fa-leaf" style={{ color: 'var(--primary)' }}></i> Fertilizer</h6>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.25rem' }}>
                                <p style={{ margin: 0 }}>Nitrogen (N): <strong>{result.fertilizer.nitrogen} {result.fertilizer.unit}</strong></p>
                                <p style={{ margin: 0 }}>Phosphorus (P): <strong>{result.fertilizer.phosphorus} {result.fertilizer.unit}</strong></p>
                                <p style={{ margin: 0 }}>Potassium (K): <strong>{result.fertilizer.potassium} {result.fertilizer.unit}</strong></p>
                            </div>
                        </div></div>
                    </div>
                    <h6 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Farm Management Schedule</h6>
                    <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                        <table>
                            <thead><tr><th>Task</th><th>Timing</th></tr></thead>
                            <tbody>{(result.schedule || []).map(s => <tr key={s.task}><td>{s.task}</td><td>{s.timing}</td></tr>)}</tbody>
                        </table>
                    </div>
                    <div className="card"><div className="card-body">
                        <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}><i className="fas fa-rupee-sign"></i> Cost Estimate</h6>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                            {[['Water', `â‚¹${result.cost.water}`], ['Fertilizer', `â‚¹${result.cost.fertilizer}`], ['Labor', `â‚¹${result.cost.labor}`], ['Total', `â‚¹${result.cost.total}`]].map(([l, v]) => (
                                <div key={l}><small style={{ color: 'var(--text-muted)' }}>{l}</small><p style={{ fontWeight: 800, color: l === 'Total' ? 'var(--primary)' : '' }}>{v}</p></div>
                            ))}
                        </div>
                    </div></div>
                </div>
            )}

            {result && (
                <VoiceExplainer
                    title="Resource Management"
                    text={`Resource analysis results: Water requirement is ${result.water.amount} ${result.water.unit}, frequency ${result.water.frequency} using ${result.water.method}. Fertilizer needs: Nitrogen ${result.fertilizer.nitrogen} ${result.fertilizer.unit}, Phosphorus ${result.fertilizer.phosphorus} ${result.fertilizer.unit}, Potassium ${result.fertilizer.potassium} ${result.fertilizer.unit}. Total estimated cost is Rs ${result.cost.total}. Schedule: ${(result.schedule || []).map(s => `${s.task}: ${s.timing}`).join('. ')}`}
                />
            )}
        </div>
    );
}

// â”€â”€â”€â”€â”€â”€â”€â”€ Weather Forecast â”€â”€â”€â”€â”€â”€â”€â”€
// Uses Open-Meteo (https://open-meteo.com) â€” FREE, no API key required

// WMO weather code â†’ { icon, color, label }
const WMO_ICON = code => {
    const n = Number(code);
    if (n === 0) return { icon: 'sun', color: '#ffc107', label: 'Clear Sky' };
    if (n <= 2) return { icon: 'cloud-sun', color: '#fd7e14', label: 'Partly Cloudy' };
    if (n === 3) return { icon: 'cloud', color: '#adb5bd', label: 'Overcast' };
    if (n <= 49) return { icon: 'smog', color: '#6c757d', label: 'Foggy' };
    if (n <= 59) return { icon: 'cloud-rain', color: '#0d6efd', label: 'Drizzle' };
    if (n <= 69) return { icon: 'cloud-rain', color: '#0d6efd', label: 'Rain' };
    if (n <= 79) return { icon: 'snowflake', color: '#0dcaf0', label: 'Snow' };
    if (n <= 84) return { icon: 'cloud-showers-heavy', color: '#0a58ca', label: 'Rain Showers' };
    if (n <= 94) return { icon: 'bolt', color: '#6f42c1', label: 'Thunderstorm' };
    return { icon: 'bolt', color: '#6f42c1', label: 'Heavy Thunderstorm' };
};

const FARM_ADVICE = code => {
    const n = Number(code);
    if (n >= 95) return 'âš ï¸ Avoid field work. Protect equipment from thunderstorms.';
    if (n >= 60) return 'ðŸŒ§ï¸ Good for irrigation-free growth. Delay pesticide spraying.';
    if (n >= 70) return 'â„ï¸ Protect crops with frost covers.';
    if (n >= 45) return 'ðŸŒ«ï¸ Watch for fungal diseases. Improve airflow.';
    if (n >= 1) return 'â›… Ideal conditions for transplanting seedlings.';
    return 'â˜€ï¸ Great sunny conditions. Monitor soil moisture closely.';
};

async function getWeatherByCity(city) {
    const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0)
        throw new Error(`City "${city}" not found. Try a different spelling.`);
    const { latitude, longitude, name, country, admin1 } = geoData.results[0];
    const cityLabel = [name, admin1, country].filter(Boolean).join(', ');
    return getWeatherByCoords(latitude, longitude, cityLabel);
}

async function getWeatherByCoords(lat, lon, cityLabel = '') {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure,visibility',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,relative_humidity_2m_min',
        wind_speed_unit: 'kmh',
        timezone: 'auto',
        forecast_days: 5,
    });
    const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!wRes.ok) throw new Error('Weather service unavailable. Please try again later.');
    const w = await wRes.json();
    const cur = w.current;
    const daily = w.daily;
    const currentWeather = {
        city: cityLabel || `${lat.toFixed(2)}Â°N, ${lon.toFixed(2)}Â°E`,
        temp: Math.round(cur.temperature_2m),
        feels_like: Math.round(cur.apparent_temperature),
        humidity: cur.relative_humidity_2m,
        wind_speed: cur.wind_speed_10m != null ? cur.wind_speed_10m.toFixed(1) : 'â€”',
        condition: cur.weather_code,
        pressure: Math.round(cur.surface_pressure),
        visibility: cur.visibility != null ? (cur.visibility / 1000).toFixed(1) : 'â€”',
        precipitation: cur.precipitation,
    };
    const forecastData = (daily.time || []).map((date, i) => ({
        day: new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        temp_high: Math.round(daily.temperature_2m_max[i]),
        temp_low: Math.round(daily.temperature_2m_min[i]),
        humidity: Math.round((daily.relative_humidity_2m_max[i] + daily.relative_humidity_2m_min[i]) / 2),
        rainfall: +(daily.precipitation_sum[i] || 0).toFixed(1),
        condition: daily.weather_code[i],
    }));
    return { current: currentWeather, forecast: forecastData };
}

function WeatherForecast() {
    const [location, setLocation] = useState('');
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);

    const applyResult = result => { setWeather(result.current); setForecast(result.forecast); };

    const fetchByCity = async city => {
        setLoading(true); setError(''); setWeather(null); setForecast([]);
        try { applyResult(await getWeatherByCity(city)); }
        catch (err) { setError(err.message || 'Failed to fetch weather. Please try again.'); }
        finally { setLoading(false); }
    };

    const fetchByCoords = async (lat, lon) => {
        setLoading(true); setError(''); setWeather(null); setForecast([]);
        try {
            const result = await getWeatherByCoords(lat, lon);
            try {
                const rgRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                const rgData = await rgRes.json();
                const addr = rgData.address || {};
                const cityName = [addr.city || addr.town || addr.village, addr.country].filter(Boolean).join(', ');
                if (cityName) { result.current.city = cityName; setLocation(cityName); }
            } catch { /* ignore reverse-geocode failure */ }
            applyResult(result);
        } catch (err) { setError(err.message || 'Failed to fetch weather for your location.'); }
        finally { setLoading(false); }
    };

    const handleGPS = () => {
        if (!navigator.geolocation) { setError('Geolocation is not supported by your browser.'); return; }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            pos => { setGpsLoading(false); fetchByCoords(pos.coords.latitude, pos.coords.longitude); },
            () => { setGpsLoading(false); setError('Unable to get your location. Please allow location access.'); },
        );
    };

    const handleSubmit = e => { e.preventDefault(); if (location.trim()) fetchByCity(location.trim()); };

    return (
        <div className="tool-container" id="weather-forecast">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>
                <i className="fas fa-cloud-sun" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
                Weather Forecast
            </h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Real-time weather powered by Open-Meteo (free, no API key) â€” enter a city or use GPS.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                    className="form-control"
                    id="weatherLocation"
                    placeholder="Enter city name (e.g. Mumbai, Delhi, Chennai)..."
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    style={{ flex: 1, minWidth: '200px' }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <><span className="spinner"></span> Fetching...</> : <><i className="fas fa-search"></i> Get Weather</>}
                </button>
                <button type="button" className="btn btn-primary" onClick={handleGPS} disabled={gpsLoading || loading}
                    style={{ background: 'linear-gradient(135deg,#0d6efd,#0a58ca)', border: 'none' }}>
                    {gpsLoading ? <><span className="spinner"></span></> : <><i className="fas fa-map-marker-alt"></i> My Location</>}
                </button>
            </form>

            {error && (
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#856404', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
            )}

            {weather && (
                <div id="weatherResults">
                    <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)', border: 'none' }}>
                        <div className="card-body" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <i className={`fas fa-${WMO_ICON(weather.condition).icon}`}
                                        style={{ fontSize: '4rem', color: WMO_ICON(weather.condition).color }}></i>
                                    <div>
                                        <h5 style={{ fontWeight: 800, margin: '0 0 0.25rem' }}>{weather.city}</h5>
                                        <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, color: 'var(--primary)' }}>{weather.temp}Â°C</div>
                                        <div style={{ color: 'var(--text-muted)' }}>{WMO_ICON(weather.condition).label}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Feels like {weather.feels_like}Â°C</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', fontSize: '0.88rem' }}>
                                    <div><i className="fas fa-tint" style={{ color: '#0d6efd', marginRight: '0.4rem' }}></i><strong>{weather.humidity}%</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Humidity</span></div>
                                    <div><i className="fas fa-wind" style={{ color: '#6c757d', marginRight: '0.4rem' }}></i><strong>{weather.wind_speed} km/h</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Wind Speed</span></div>
                                    <div><i className="fas fa-eye" style={{ color: '#20c997', marginRight: '0.4rem' }}></i><strong>{weather.visibility} km</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Visibility</span></div>
                                    <div><i className="fas fa-tachometer-alt" style={{ color: '#fd7e14', marginRight: '0.4rem' }}></i><strong>{weather.pressure} hPa</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Pressure</span></div>
                                    <div><i className="fas fa-cloud-rain" style={{ color: '#0d6efd', marginRight: '0.4rem' }}></i><strong>{weather.precipitation} mm</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Precipitation</span></div>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 600 }}>
                                <i className="fas fa-tractor" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
                                <strong>Farming Advice:</strong> {FARM_ADVICE(weather.condition)}
                            </div>
                        </div>
                    </div>

                    {forecast.length > 0 && (
                        <>
                            <h5 style={{ fontWeight: 800, marginBottom: '1rem' }}>5-Day Forecast</h5>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                {forecast.map(d => {
                                    const { icon, color, label } = WMO_ICON(d.condition);
                                    return (
                                        <div key={d.day} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                                            <h6 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.82rem' }}>{d.day}</h6>
                                            <i className={`fas fa-${icon} fa-2x`} style={{ color, marginBottom: '0.5rem', display: 'block' }}></i>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{d.temp_high}Â°C</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{d.temp_low}Â°C</div>
                                            <div style={{ fontSize: '0.78rem' }}><i className="fas fa-tint" style={{ color: '#0d6efd' }}></i> {d.humidity}%</div>
                                            {d.rainfall > 0 && <div style={{ fontSize: '0.78rem', color: '#0d6efd', marginTop: '0.2rem' }}><i className="fas fa-cloud-rain"></i> {d.rainfall}mm</div>}
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// â”€â”€â”€â”€â”€â”€â”€â”€ Soil Analysis â”€â”€â”€â”€â”€â”€â”€â”€
function SoilAnalysis() {
    const [form, setForm] = useState({ soilType: '', organicMatter: '', soilPh: '', ec: '', cec: '', previousCrop: '' });
    const [result, setResult] = useState(null);

    const CROPS_MAP = { loamy: ['Most vegetables', 'Grains', 'Fruits'], clay: ['Rice', 'Wheat', 'Cabbage'], sandy: ['Carrots', 'Potatoes', 'Groundnuts'], silt: ['Vegetables', 'Fruits', 'Grasses'], peaty: ['Berries', 'Root vegetables'] };

    const analyze = data => {
        let score = 70;
        const issues = [], recs = [];
        if (data.ph < 6) { issues.push('Soil is acidic'); recs.push('Add lime to increase pH'); score -= 10; }
        else if (data.ph > 7.5) { issues.push('Soil is alkaline'); recs.push('Add sulfur/organic matter to decrease pH'); score -= 10; }
        if (data.organic < 3) { issues.push('Low organic matter content'); recs.push('Incorporate compost and green manure'); score -= 15; }
        if (!issues.length) { recs.push('Soil health is good â€” maintain current practices'); recs.push('Continue crop rotation'); }
        return { score: Math.max(score, 40), issues: issues.length ? issues : ['No major issues detected'], recs, crops: CROPS_MAP[data.soilType] || ['Consult agricultural expert'] };
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await aiApi.soilAnalysis({
                soilType: form.soilType,
                organicMatter: parseFloat(form.organicMatter) || null,
                soilPh: parseFloat(form.soilPh) || null,
                ec: parseFloat(form.ec) || null,
                cec: parseFloat(form.cec) || null,
                previousCrop: form.previousCrop,
            });
            setResult({
                score: res.score,
                issues: res.issues,
                recs: res.recommendations,
                crops: res.suitableCrops,
            });
        } catch {
            setResult(analyze({ soilType: form.soilType, ph: parseFloat(form.soilPh), organic: parseFloat(form.organicMatter) }));
        }
    };

    const scoreColor = result ? (result.score >= 70 ? 'var(--primary)' : result.score >= 50 ? '#ffc107' : '#dc3545') : '';

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-flask" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Soil Analysis</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Analyze your soil health and get improvement recommendations.</p>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Soil Type *</label>
                        <select className="form-select" id="soilType" required value={form.soilType} onChange={e => setForm({ ...form, soilType: e.target.value })}>
                            <option value="">Select...</option>
                            {['loamy', 'clay', 'sandy', 'silt', 'peaty'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select></div>
                    <div className="form-group"><label className="form-label">Organic Matter (%)</label><input className="form-control" id="organicMatter" type="number" step="0.1" value={form.organicMatter} onChange={e => setForm({ ...form, organicMatter: e.target.value })} placeholder="e.g. 3.5" /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Soil pH *</label><input className="form-control" id="soilPh" type="number" step="0.1" min="0" max="14" required value={form.soilPh} onChange={e => setForm({ ...form, soilPh: e.target.value })} placeholder="e.g. 6.5" /></div>
                    <div className="form-group"><label className="form-label">EC (dS/m)</label><input className="form-control" id="ec" type="number" step="0.01" value={form.ec} onChange={e => setForm({ ...form, ec: e.target.value })} placeholder="e.g. 0.5" /></div>
                    <div className="form-group"><label className="form-label">CEC (meq/100g)</label><input className="form-control" id="cec" type="number" step="0.1" value={form.cec} onChange={e => setForm({ ...form, cec: e.target.value })} placeholder="e.g. 15" /></div>
                </div>
                <div className="form-group"><label className="form-label">Previous Crop</label><input className="form-control" id="previousCrop" value={form.previousCrop} onChange={e => setForm({ ...form, previousCrop: e.target.value })} placeholder="e.g. Wheat" /></div>
                <button type="submit" className="btn btn-primary"><i className="fas fa-vials"></i> Analyze Soil</button>
            </form>

            {result && (
                <div id="soilResults" style={{ marginTop: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h5 style={{ fontWeight: 800 }}>Soil Health Score</h5>
                        <div className="progress-bar-container" style={{ height: '28px', marginBottom: '0.35rem' }}>
                            <div className="progress-bar-fill" style={{ width: `${result.score}%`, background: scoreColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                                {result.score}/100
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
                        <div><h6 style={{ fontWeight: 700 }}>Detected Issues:</h6><ul style={{ listStyle: 'none', paddingLeft: 0 }}>{(result.issues || []).map(i => <li key={i} style={{ marginBottom: '0.4rem' }}><i className="fas fa-exclamation-triangle" style={{ color: '#ffc107', marginRight: '0.5rem' }}></i>{i}</li>)}</ul></div>
                        <div><h6 style={{ fontWeight: 700 }}>Recommendations:</h6><ul style={{ listStyle: 'none', paddingLeft: 0 }}>{(result.recs || []).map(r => <li key={r} style={{ marginBottom: '0.4rem' }}><i className="fas fa-check-circle" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>{r}</li>)}</ul></div>
                    </div>
                    <div style={{ background: '#d1ecf1', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                        <h6 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Suitable Crops for {form.soilType} soil:</h6>
                        <p style={{ margin: 0 }}>{(result.crops || []).join(', ')}</p>
                    </div>
                </div>
            )}

            {result && (
                <VoiceExplainer
                    title="Soil Analysis"
                    text={`Soil health analysis completed. Overall score: ${result.score} out of 100. Detected issues: ${(result.issues || []).join('. ')}. Recommendations: ${(result.recs || []).join('. ')}. Suitable crops for ${form.soilType} soil: ${(result.crops || []).join(', ')}.`}
                />
            )}
        </div>
    );
}

// â”€â”€â”€â”€â”€â”€â”€â”€ Soil & Environment Analyzer â”€â”€â”€â”€â”€â”€â”€â”€
function SoilEnvAnalyzer() {
    const [form, setForm] = useState({ 
        cropName: '', soilPh: '', moisture: '', potassium: '', 
        temperature: '', humidity: '', rainfall: '', location: '' 
    });
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => formData.append(key, form[key]));
            if (image) formData.append('image', image);

            const res = await fetch("http://localhost:8080/api/ai-tools/analyze", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Failed to process request");
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message || 'Error occurred while analyzing data. Make sure backend is running on port 8000.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setImage(e.target.files[0]);
        }
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>
                <i className="fas fa-leaf" style={{ color: '#28a745', marginRight: '0.5rem' }}></i>
                AI Soil & Crop Analysis Tool
            </h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Comprehensive soil and environment analysis using advanced AI.
            </p>
            
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Crop Name</label><input className="form-control" type="text" required value={form.cropName} onChange={e => setForm({...form, cropName: e.target.value})} placeholder="e.g. Wheat" /></div>
                    <div className="form-group"><label className="form-label">Location</label><input className="form-control" type="text" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Punjab" /></div>
                </div>
                
                <h6 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>Soil Parameters</h6>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Soil pH</label><input className="form-control" type="number" step="0.1" required value={form.soilPh} onChange={e => setForm({...form, soilPh: e.target.value})} placeholder="0-14" /></div>
                    <div className="form-group"><label className="form-label">Moisture (%)</label><input className="form-control" type="number" required value={form.moisture} onChange={e => setForm({...form, moisture: e.target.value})} placeholder="0-100" /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Potassium (K)</label><input className="form-control" type="number" required value={form.potassium} onChange={e => setForm({...form, potassium: e.target.value})} placeholder="mg/kg" /></div>
                </div>

                <h6 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>Environment</h6>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Temperature (Â°C)</label><input className="form-control" type="number" required value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} placeholder="e.g. 25" /></div>
                    <div className="form-group"><label className="form-label">Humidity (%)</label><input className="form-control" type="number" required value={form.humidity} onChange={e => setForm({...form, humidity: e.target.value})} placeholder="0-100" /></div>
                    <div className="form-group"><label className="form-label">Rainfall (mm)</label><input className="form-control" type="number" required value={form.rainfall} onChange={e => setForm({...form, rainfall: e.target.value})} placeholder="e.g. 100" /></div>
                </div>

                <h6 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>Visual Analysis</h6>
                <div className="form-group">
                    <label className="form-label">Upload Crop/Leaf Image (Optional)</label>
                    <input className="form-control" type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                    {loading ? <><span className="spinner"></span> Analyzing...</> : <><i className="fas fa-microscope"></i> Analyze Now</>}
                </button>
            </form>

            {error && <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginTop: '1rem', color: '#856404', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-exclamation-triangle"></i> {error}</div>}

            {result && (
                <div className="result-card" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h5 style={{ fontWeight: 800, margin: 0 }}>Analysis Results</h5>
                        <span style={{ 
                            background: result.severity === 'High' ? '#dc3545' : result.severity === 'Medium' ? '#ffc107' : '#28a745', 
                            color: result.severity === 'Medium' ? '#212529' : 'white', 
                            padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' 
                        }}>
                            Severity: {result.severity}
                        </span>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="card" style={{ padding: '1.5rem', background: 'white' }}>
                            <h6 style={{ color: 'var(--primary)', fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-bug" style={{ marginRight: '0.5rem' }}></i> Detected Issue</h6>
                            <p style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{result.issue}</p>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Confidence: {(result.confidence * 100).toFixed(0)}%</div>
                            <div className="progress-bar-container" style={{ marginTop: '0.5rem', height: '6px' }}><div className="progress-bar-fill" style={{ width: `${(result.confidence * 100).toFixed(0)}%`, background: 'var(--primary)' }}></div></div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem', background: 'white' }}>
                            <h6 style={{ color: '#6f42c1', fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-camera" style={{ marginRight: '0.5rem' }}></i> Image Observation</h6>
                            <p style={{ margin: 0, fontWeight: 600 }}>{result.image_observation}</p>
                        </div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="card" style={{ padding: '1.5rem', background: 'white' }}>
                            <h6 style={{ fontWeight: 800, marginBottom: '1rem' }}><i className="fas fa-search-plus" style={{ color: '#fd7e14', marginRight: '0.5rem' }}></i> Root Causes:</h6>
                            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', margin: 0 }}>
                                {(result.causes || []).map((c, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{c}</li>)}
                            </ul>
                        </div>
                        <div className="card" style={{ padding: '1.5rem', background: 'white' }}>
                            <h6 style={{ fontWeight: 800, marginBottom: '1rem' }}><i className="fas fa-tools" style={{ color: '#20c997', marginRight: '0.5rem' }}></i> Recommended Solutions:</h6>
                            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', margin: 0 }}>
                                {(result.solutions || []).map((s, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{s}</li>)}
                            </ul>
                        </div>
                    </div>

                    {result.products && result.products.length > 0 && (
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem' }}>
                            <h6 style={{ fontWeight: 800, marginBottom: '1rem' }}><i className="fas fa-shopping-bag" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i> Recommended for your soil</h6>
                            <div className="grid grid-3" style={{ gap: '1rem' }}>
                                {(result.products || []).map((p, i) => (
                                    <div key={i} className="card" style={{ padding: '1.2rem', textAlign: 'center', background: 'white' }}>
                                        <div style={{ width: '100%', height: '100px', background: '#e9ecef', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="fas fa-box" style={{ fontSize: '2.5rem', color: '#adb5bd' }}></i>
                                        </div>
                                        <h6 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 800 }}>{p.name}</h6>
                                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>â‚¹{p.price}</div>
                                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginTop: '0.75rem', width: '100%' }}>View Product</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {result && (
                <VoiceExplainer
                    title="AI Soil & Crop Analysis"
                    text={`Analysis completed. Detected issue: ${result.issue} with ${(result.confidence * 100).toFixed(0)}% confidence. Severity level: ${result.severity}. Image observation: ${result.image_observation}. Root causes: ${(result.causes || []).join('. ')}. Recommended solutions: ${(result.solutions || []).join('. ')}.`}
                />
            )}
        </div>
    );
}

// â”€â”€â”€â”€â”€â”€â”€â”€ Main AI Tools Page â”€â”€â”€â”€â”€â”€â”€â”€
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
                    <p>Intelligent tools powered by machine learning to help you farm smarter</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: 'var(--radius-full)',
                                border: '2px solid',
                                borderColor: activeTab === t.id ? 'var(--primary)' : 'var(--border)',
                                background: activeTab === t.id ? 'var(--primary)' : 'white',
                                color: activeTab === t.id ? 'white' : 'var(--dark)',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                            }}>
                                <i className={`fas fa-${t.icon}`}></i> {t.label}
                            </button>
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

