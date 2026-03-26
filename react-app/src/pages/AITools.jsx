import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { aiApi } from '../services/api';

// ──────── Crop Recommendation ────────
function CropRecommendation() {
    const { showNotification } = useApp();
    const [form, setForm] = useState({ nitrogen: '', phosphorus: '', potassium: '', temperature: '', humidity: '', ph: '', rainfall: '', location: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const getCropRec = data => {
        let crops = [
            { name: 'Rice', confidence: 0.92, reason: 'Optimal NPK ratio and high rainfall' },
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
                recommendations: res.recommendations,
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
                <div className="form-row"><div className="form-group"><label className="form-label">Nitrogen (N) kg/ha</label><input className="form-control" id="nitrogen" type="number" required value={form.nitrogen} onChange={e => setForm({ ...form, nitrogen: e.target.value })} placeholder="e.g. 50" /></div>
                    <div className="form-group"><label className="form-label">Phosphorus (P) kg/ha</label><input className="form-control" id="phosphorus" type="number" required value={form.phosphorus} onChange={e => setForm({ ...form, phosphorus: e.target.value })} placeholder="e.g. 40" /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Potassium (K) kg/ha</label><input className="form-control" id="potassium" type="number" required value={form.potassium} onChange={e => setForm({ ...form, potassium: e.target.value })} placeholder="e.g. 45" /></div>
                    <div className="form-group"><label className="form-label">Temperature (°C)</label><input className="form-control" id="temperature" type="number" required value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} placeholder="e.g. 28" /></div></div>
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
                        {result.recommendations.map(r => <li key={r}><i className="fas fa-check-circle" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>{r}</li>)}
                    </ul>
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
                fertilizer: { nitrogen: res.fertilizer?.nitrogen, phosphorus: res.fertilizer?.phosphorus, potassium: res.fertilizer?.potassium, unit: res.fertilizer?.unit },
                schedule: (res.schedule || []).map(s => ({ task: s.task, timing: s.timing })),
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
                            <h6><i className="fas fa-leaf" style={{ color: 'var(--primary)' }}></i> Fertilizer (NPK)</h6>
                            <p style={{ marginBottom: '0.2rem' }}>Nitrogen: <strong>{result.fertilizer.nitrogen} {result.fertilizer.unit}</strong></p>
                            <p style={{ marginBottom: '0.2rem' }}>Phosphorus: <strong>{result.fertilizer.phosphorus} {result.fertilizer.unit}</strong></p>
                            <p style={{ margin: 0 }}>Potassium: <strong>{result.fertilizer.potassium} {result.fertilizer.unit}</strong></p>
                        </div></div>
                    </div>
                    <h6 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Farm Management Schedule</h6>
                    <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                        <table>
                            <thead><tr><th>Task</th><th>Timing</th></tr></thead>
                            <tbody>{result.schedule.map(s => <tr key={s.task}><td>{s.task}</td><td>{s.timing}</td></tr>)}</tbody>
                        </table>
                    </div>
                    <div className="card"><div className="card-body">
                        <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}><i className="fas fa-rupee-sign"></i> Cost Estimate</h6>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                            {[['Water', `₹${result.cost.water}`], ['Fertilizer', `₹${result.cost.fertilizer}`], ['Labor', `₹${result.cost.labor}`], ['Total', `₹${result.cost.total}`]].map(([l, v]) => (
                                <div key={l}><small style={{ color: 'var(--text-muted)' }}>{l}</small><p style={{ fontWeight: 800, color: l === 'Total' ? 'var(--primary)' : '' }}>{v}</p></div>
                            ))}
                        </div>
                    </div></div>
                </div>
            )}
        </div>
    );
}

// ──────── Weather Forecast ────────
// Uses Open-Meteo (https://open-meteo.com) — FREE, no API key required

// WMO weather code → { icon, color, label }
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
    if (n >= 95) return '⚠️ Avoid field work. Protect equipment from thunderstorms.';
    if (n >= 60) return '🌧️ Good for irrigation-free growth. Delay pesticide spraying.';
    if (n >= 70) return '❄️ Protect crops with frost covers.';
    if (n >= 45) return '🌫️ Watch for fungal diseases. Improve airflow.';
    if (n >= 1) return '⛅ Ideal conditions for transplanting seedlings.';
    return '☀️ Great sunny conditions. Monitor soil moisture closely.';
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
        city: cityLabel || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
        temp: Math.round(cur.temperature_2m),
        feels_like: Math.round(cur.apparent_temperature),
        humidity: cur.relative_humidity_2m,
        wind_speed: cur.wind_speed_10m != null ? cur.wind_speed_10m.toFixed(1) : '—',
        condition: cur.weather_code,
        pressure: Math.round(cur.surface_pressure),
        visibility: cur.visibility != null ? (cur.visibility / 1000).toFixed(1) : '—',
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
                Real-time weather powered by Open-Meteo (free, no API key) — enter a city or use GPS.
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
                                        <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, color: 'var(--primary)' }}>{weather.temp}°C</div>
                                        <div style={{ color: 'var(--text-muted)' }}>{WMO_ICON(weather.condition).label}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Feels like {weather.feels_like}°C</div>
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
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{d.temp_high}°C</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{d.temp_low}°C</div>
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

// ──────── Soil Analysis ────────
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
        if (!issues.length) { recs.push('Soil health is good — maintain current practices'); recs.push('Continue crop rotation'); }
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
                        <div><h6 style={{ fontWeight: 700 }}>Detected Issues:</h6><ul style={{ listStyle: 'none', paddingLeft: 0 }}>{result.issues.map(i => <li key={i} style={{ marginBottom: '0.4rem' }}><i className="fas fa-exclamation-triangle" style={{ color: '#ffc107', marginRight: '0.5rem' }}></i>{i}</li>)}</ul></div>
                        <div><h6 style={{ fontWeight: 700 }}>Recommendations:</h6><ul style={{ listStyle: 'none', paddingLeft: 0 }}>{result.recs.map(r => <li key={r} style={{ marginBottom: '0.4rem' }}><i className="fas fa-check-circle" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>{r}</li>)}</ul></div>
                    </div>
                    <div style={{ background: '#d1ecf1', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                        <h6 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Suitable Crops for {form.soilType} soil:</h6>
                        <p style={{ margin: 0 }}>{result.crops.join(', ')}</p>
                    </div>
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
                </div>
            </section>
        </>
    );
}
