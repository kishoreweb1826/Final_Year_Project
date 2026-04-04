import { useState, useRef, useEffect } from 'react';

const QUICK_REPLIES = [
    { text: '🌱 Crop Advice', query: 'crop recommendation' },
    { text: '🛒 How to Order', query: 'how to order' },
    { text: '🌤️ Weather Info', query: 'weather forecast' },
    { text: '🧪 Soil Analysis', query: 'soil analysis' },
    { text: '👨‍🌾 Become Farmer', query: 'farmer registration' },
];

function getBotResponse(message) {
    const msg = message.toLowerCase().trim();
    if (msg.includes('crop') || msg.includes('recommend') || msg.includes('grow'))
        return 'I can help with crop recommendations! 🌱\n\nVisit our AI Tools section → Crop Recommendation tab. Enter your soil and climate parameters to get AI-powered crop suggestions.\n\nYou can also use our Soil & Environment Analyzer for a comprehensive report!';
    if (msg.includes('order') || msg.includes('buy') || msg.includes('purchase'))
        return 'Here\'s how to place an order: 🛒\n\n1. Browse the Products page\n2. Add items to your Cart\n3. Go to Checkout\n4. Enter delivery details\n5. Choose payment method\n6. Place order!\n\nTrack orders in Your Dashboard → My Orders.';
    if (msg.includes('weather') || msg.includes('rain') || msg.includes('forecast'))
        return 'Check real-time weather in AI Tools → Weather Forecast tab! 🌤️\n\nSearch by city name or use GPS for your current location. Includes farming advice based on weather conditions.';
    if (msg.includes('soil') || msg.includes('analysis') || msg.includes('ph'))
        return 'For soil analysis, visit AI Tools → Soil Analysis tab! 🧪\n\nEnter soil type, pH, organic matter, and more to get health scores and recommendations. We also have an AI Soil & Crop Analysis Tool!';
    if (msg.includes('farmer') || msg.includes('sell') || msg.includes('register'))
        return 'Want to sell your organic products? 👨‍🌾\n\n1. Go to the For Farmers page\n2. Register as a farmer with certification\n3. Once verified, manage products from Dashboard!\n\nFarmers get access to all AI farming tools.';
    if (msg.includes('price') || msg.includes('cost') || msg.includes('expensive'))
        return 'Our products are priced by organic farmers. 💰\n\nPrices vary by produce type, certification, and season. Visit Products to see current prices. Farmers get AI price suggestions when listing!';
    if (msg.includes('organic') || msg.includes('certified'))
        return 'All products come from certified organic farmers! ✅\n\nLook for the "Certified" badge. Farmers must submit valid organic certification (NPOP, PGS-India, etc.) during registration.';
    if (msg.includes('contact') || msg.includes('support') || msg.includes('help'))
        return 'Need help? Here are your options: 📞\n\n• Visit our Contact page\n• Email: info@organicfarm.com\n• Phone: +91 12345 67890\n• Use this chat for quick answers!\n\nWe\'re here to help.';
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('namaste'))
        return 'Hello! 👋 Welcome to OrganicFarm!\n\nI\'m FarmBot, your AI assistant. I can help with:\n• Crop recommendations\n• Weather forecasts\n• Soil analysis\n• Ordering & delivery\n• Farmer registration\n\nWhat would you like to know?';
    if (msg.includes('thank'))
        return 'You\'re welcome! 😊 Happy to help. Feel free to ask anything else about farming, products, or our services.';
    if (msg.includes('dashboard') || msg.includes('account') || msg.includes('profile'))
        return 'Your Dashboard has everything! 📊\n\n• Account overview & profile\n• Order history & tracking\n• Saved addresses\n• Cart & wishlist\n• Account settings\n\nClick your profile icon or go to Dashboard from the navbar.';
    if (msg.includes('ai') || msg.includes('tool') || msg.includes('feature'))
        return 'Our AI Tools include: 🤖\n\n• Crop Recommendation System\n• Resource Management\n• Weather Forecast (real-time)\n• Soil Analysis\n• AI Soil & Crop Analyzer\n\nAll tools include voice explanations in Tamil & other languages!';
    return 'I can help you with farming advice, products, and our AI tools! 🌿\n\nTry asking about:\n• Crop recommendations\n• Weather forecast\n• Soil analysis\n• How to order\n• Farmer registration\n• Your dashboard\n\nOr visit our AI Tools page for detailed analysis.';
}

export default function FloatingAIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Hello! 👋 I\'m FarmBot, your OrganicFarm AI assistant. How can I help you today?', time: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen, isMinimized]);

    const sendMessage = (text) => {
        if (!text.trim()) return;
        const userMsg = { id: Date.now(), type: 'user', text: text.trim(), time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        setTimeout(() => {
            const response = getBotResponse(text);
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: response, time: new Date() }]);
            setIsTyping(false);
        }, 500 + Math.random() * 700);
    };

    const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };

    const toggleChat = () => {
        if (isMinimized) { setIsMinimized(false); return; }
        setIsOpen(!isOpen);
    };

    const formatText = (text) => {
        return text.split('\n').map((line, i) => (
            <span key={i}>
                {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**'))
                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                    return part;
                })}
                {i < text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    return (
        <>
            {isOpen && (
                <div className={`ai-chat-panel ${isMinimized ? 'ai-chat-minimized' : ''}`} id="ai-chat-panel">
                    <div className="ai-chat-header">
                        <div className="ai-chat-header-info">
                            <div className="ai-chat-avatar"><i className="fas fa-robot"></i></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>FarmBot AI</div>
                                <div style={{ fontSize: '0.72rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <span style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }}></span> Online
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button onClick={() => setIsMinimized(true)} title="Minimize" aria-label="Minimize" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.35rem', fontSize: '0.9rem', opacity: 0.8 }}>
                                <i className="fas fa-minus"></i>
                            </button>
                            <button onClick={() => setIsOpen(false)} title="Close" aria-label="Close" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.35rem', fontSize: '0.9rem', opacity: 0.8 }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            <div className="ai-chat-messages">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`ai-msg ${msg.type === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`}>
                                        {msg.type === 'bot' && (
                                            <div className="ai-msg-icon"><i className="fas fa-leaf"></i></div>
                                        )}
                                        <div className={`ai-msg-bubble ${msg.type === 'user' ? 'ai-bubble-user' : 'ai-bubble-bot'}`}>
                                            {formatText(msg.text)}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="ai-msg ai-msg-bot">
                                        <div className="ai-msg-icon"><i className="fas fa-leaf"></i></div>
                                        <div className="ai-msg-bubble ai-bubble-bot ai-typing-bubble">
                                            <span className="ai-typing-dot"></span>
                                            <span className="ai-typing-dot"></span>
                                            <span className="ai-typing-dot"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {messages.length <= 2 && (
                                <div className="ai-quick-replies">
                                    {QUICK_REPLIES.map(qr => (
                                        <button key={qr.query} onClick={() => sendMessage(qr.query)}>{qr.text}</button>
                                    ))}
                                </div>
                            )}

                            <form className="ai-chat-input-area" onSubmit={handleSubmit}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ask me anything about farming..."
                                    disabled={isTyping}
                                />
                                <button type="submit" disabled={!input.trim() || isTyping} aria-label="Send message">
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            <button
                className={`ai-float-btn ${isOpen ? 'ai-float-active' : ''}`}
                onClick={toggleChat}
                aria-label="Open AI Assistant"
                id="ai-assistant-toggle"
            >
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-comments'}`}></i>
                {!isOpen && <span className="ai-float-badge">AI</span>}
            </button>
        </>
    );
}
