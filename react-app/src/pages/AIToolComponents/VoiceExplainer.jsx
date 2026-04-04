import React, { useState, useEffect, useRef, useCallback } from 'react';
import { translateToTamil, translateToHindi } from './AILocalization';

export default function VoiceExplainer({ text, title }) {
    const [voiceOn, setVoiceOn] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedLang, setSelectedLang] = useState('ta-IN');
    const utteranceRef = useRef(null);

    const LANGUAGES = [
        { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
        { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
        { code: 'en-IN', label: 'English (India)' },
        { code: 'en-US', label: 'English (US)' },
    ];

    useEffect(() => {
        return () => window.speechSynthesis?.cancel();
    }, []);

    const getVoiceText = useCallback(() => {
        if (selectedLang === 'ta-IN') return translateToTamil(text, title);
        return text;
    }, [selectedLang, text, title]);

    const speak = useCallback((textToSpeak) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = selectedLang;
        
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang === selectedLang) || voices.find(v => v.lang.startsWith(selectedLang.split('-')[0]));
        if (voice) utterance.voice = voice;
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
        utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [selectedLang]);

    const handlePlay = () => {
        if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); setIsPlaying(true); }
        else speak(getVoiceText());
    };

    const handlePause = () => { window.speechSynthesis.pause(); setIsPaused(true); setIsPlaying(false); };
    const handleStop = () => { window.speechSynthesis.cancel(); setIsPlaying(false); setIsPaused(false); };

    return (
        <div className="voice-explainer-card" style={{ marginTop: '1.5rem', background: '#f0f9f1', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid #c8e6c9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className={`voice-pulse ${isPlaying ? 'active' : ''}`} onClick={() => setVoiceOn(!voiceOn)}>
                        <i className={`fas fa-volume-${isPlaying ? 'up' : 'mute'}`}></i>
                    </div>
                    <div>
                        <h6 style={{ margin: 0, fontWeight: 800 }}>Voice AI Explainer</h6>
                        <small style={{ color: 'var(--text-muted)' }}>Hear analysis in your language</small>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select className="form-select" value={selectedLang} onChange={e => setSelectedLang(e.target.value)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                    {!isPlaying ? (
                        <button className="btn btn-primary" onClick={handlePlay} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}><i className="fas fa-play"></i> Listen</button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn" onClick={handlePause} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#fff', border: '1px solid var(--border)' }} title="Pause"><i className="fas fa-pause"></i></button>
                            <button className="btn btn-danger" onClick={handleStop} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} title="Stop"><i className="fas fa-stop"></i></button>
                        </div>
                    )}
                </div>
            </div>
            {isPlaying && (
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="voice-wave">
                        <span></span><span></span><span></span><span></span>
                    </div>
                    <small style={{ color: 'var(--primary)', fontWeight: 600 }}>Speaking in {LANGUAGES.find(l => l.code === selectedLang)?.label}...</small>
                </div>
            )}
        </div>
    );
}
