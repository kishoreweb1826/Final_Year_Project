import React, { useState, useEffect } from 'react';
import VoiceExplainer from './VoiceExplainer';

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
    if (n >= 45) return '🌫️ Watch for fungal diseases. Improve airflow.';
    if (n >= 1) return '🌱 Ideal conditions for transplanting seedlings.';
    return '☀️ Great sunny conditions. Monitor soil moisture closely.';
};

export default function WeatherForecast() {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchWeather = async (cityName) => {
        setLoading(true);
        setError('');
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();
            if (!geoData.results?.length) throw new Error('City not found');
            const { latitude, longitude, name } = geoData.results[0];
            
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
            const wData = await wRes.json();
            
            setWeather({
                city: name,
                temp: Math.round(wData.current.temperature_2m),
                humidity: wData.current.relative_humidity_2m,
                condition: wData.current.weather_code,
                wind_speed: wData.current.wind_speed_10m,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGPS = () => {
        if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async pos => {
                const { latitude, longitude } = pos.coords;
                const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
                const wData = await wRes.json();
                setWeather({
                    city: 'Your Location',
                    temp: Math.round(wData.current.temperature_2m),
                    humidity: wData.current.relative_humidity_2m,
                    condition: wData.current.weather_code,
                    wind_speed: wData.current.wind_speed_10m,
                });
                setLoading(false);
            },
            () => { setError('Location access denied'); setLoading(false); }
        );
    };

    return (
        <div className="tool-container">
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}><i className="fas fa-cloud-sun" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>Weather Forecast</h4>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <input className="form-control" placeholder="Enter city name..." value={city} onChange={e => setCity(e.target.value)} />
                <button className="btn btn-primary" onClick={() => fetchWeather(city)} disabled={loading}>Search</button>
                <button className="btn btn-primary" onClick={handleGPS} disabled={loading} title="GPS"><i className="fas fa-map-marker-alt"></i></button>
            </div>

            {error && <div style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</div>}

            {weather && (
                <div className="card" style={{ padding: '1.5rem', background: '#f8f9fa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <i className={`fas fa-${WMO_ICON(weather.condition).icon}`} style={{ fontSize: '3rem', color: WMO_ICON(weather.condition).color }}></i>
                        <div>
                            <h5 style={{ margin: 0, fontWeight: 800 }}>{weather.city}: {weather.temp}°C</h5>
                            <p style={{ margin: 0 }}>{WMO_ICON(weather.condition).label}</p>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <small>Humidity: {weather.humidity}%</small><br />
                            <small>Wind: {weather.wind_speed} km/h</small>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <strong>Farming Advice:</strong> {FARM_ADVICE(weather.condition)}
                    </div>
                    <VoiceExplainer 
                        title="Weather Forecast" 
                        text={`Current weather in ${weather.city}: Temperature is ${weather.temp}°C with ${WMO_ICON(weather.condition).label}. Humidity is ${weather.humidity}%. ${FARM_ADVICE(weather.condition)}`} 
                    />
                </div>
            )}
        </div>
    );
}
