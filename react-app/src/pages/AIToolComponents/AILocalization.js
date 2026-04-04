export function translateToTamil(text, title) {
    if (typeof text !== 'string' || !text.trim()) {
        const titleTam = title ? `பகுப்பாய்வு: ${title}` : "பகுப்பாய்வு முடிவுகள்";
        return `வணக்கம். ${titleTam} முடிவுகள் இன்னும் கிடைக்கவில்லை. தயவுசெய்து உங்கள் தகவல்களை உள்ளிட்டு பகுப்பாய்வு செய்யவும்.`;
    }
    let tamil = text;
    const mappings = {
        "Based on your soil and climate parameters, the top recommended crops are:": "உங்கள் மண் மற்றும் காலநிலை நிலவரப்படி, பரிந்துரைக்கப்படும் பயிர்கள்:",
        "Soil health status": "மண் ஆரோக்கியம்",
        "Overall score": "மொத்த மதிப்பெண்",
        "Detected issues": "கண்டறியப்பட்ட பிரச்சனைகள்",
        "Recommendations": "பரிந்துரைகள்",
        "Water requirement is": "நீர் தேவை:",
        "Fertilizer needs:": "உரத் தேவைகள்:",
        "Nitrogen": "தழைச்சத்து (Nitrogen)",
        "Phosphorus": "மணிச்சத்து (Phosphorus)",
        "Potassium": "சாம்பல்சத்து (Potassium)",
        "Temperature": "வெப்பநிலை",
        "Humidity": "ஈரப்பதம்",
        "Rainfall": "மழைப்பொழிவு",
        "Rice": "நெல்",
        "Wheat": "கோதுமை",
        "Maize": "சோளம்",
        "Cotton": "பருத்தி",
        "Sugarcane": "கரும்பு",
        "Banana": "வாழை",
        "Coconut": "தேங்காய்",
        "Tomato": "தக்காளி",
        "Onion": "வெங்காயம்",
        "Chilli": "மிளகாய்",
        "Groundnut": "நிலக்கடலை",
        "Analysis complete for": "ஆய்வு முடிந்தது:",
        "Please review the detailed results above": "மேலே உள்ள விரிவான முடிவுகளைக் காணவும்",
        "detected issue": "கண்டறியப்பட்ட பிரச்சனை",
        "severity level": "தீவிர நிலை",
        "image observation": "படத்தின் அவதானிப்பு",
        "root causes": "முக்கிய காரணங்கள்",
        "recommended solutions": "பரிந்துரைக்கப்பட்ட தீர்வுகள்",
        "High": "அதிகம்",
        "Medium": "மிதமான",
        "Low": "குறைவு"
    };
    Object.entries(mappings).forEach(([eng, tam]) => {
        const regex = new RegExp(eng, 'gi');
        tamil = tamil.replace(regex, tam);
    });

    if (title) {
        const titleTam = mappings[title] || title;
        return `வணக்கம். உங்கள் ${titleTam} ஆய்வு முடிவுகள் தயார். ${tamil}. விவசாயம் செழிக்க எமது வாழ்த்துக்கள்!`;
    }
    return tamil;
}

export function translateToHindi(text, title) {
    if (typeof text !== 'string' || !text.trim()) return "鄐菽凶鄐嗣鄐耜鄐獅不 鄐芹鄐啤冗 鄐嫩鄐奶"; // Hindi placeholder
    return text; // Basic fallback for now to avoid corrupted fonts
}
