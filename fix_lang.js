const fs = require('fs');
const path = 'c:\\Users\\acer\\OneDrive\\Desktop\\Final_Year\\react-app\\src\\pages\\AITools.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `function translateToTamil(text, title) {
    if (typeof text !== 'string' || !text.trim()) {
        const titleTam = title ? \`பகுப்பாய்வு: \${title}\` : "பகுப்பாய்வு முடிவுகள்";
        return \`வணக்கம். \${titleTam} இன்னும் கிடைக்கவில்லை. தயவுசெய்து உங்கள் தகவல்களை உள்ளிட்டு பகுப்பாய்வு செய்யவும்.\`;
    }

    let tamil = text;

    const replacements = [
        [/Based on your soil and climate parameters, the top recommended crops are:/gi, 'உங்கள் மண் மற்றும் காலநிலை சூழலின்படி, இந்த பயிர்கள் விளைவிக்க சிறந்தவை என்று பரிந்துரைக்கப்படுகின்றன:'],
        [/Soil health analysis completed\\. Overall score: (\\d+) out of 100\\./gi, 'மண் ஆரோக்கிய பகுப்பாய்வு வெற்றிகரமாக முடிந்தது. உங்கள் மண்ணின் ஒட்டுமொத்த தரம் 100-க்கு $1 என்று கணக்கிடப்பட்டுள்ளது.'],
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
    
    if (title) return \`வணக்கம். உங்கள் \${title} ஆய்வு முடிவுகள் தயார். \${tamil}. விவசாயம் செழிக்க எமது வாழ்த்துக்கள்!\`;
    return tamil;
}

function translateToHindi(text, title) {
    if (typeof text !== 'string' || !text.trim()) {
        return \`\${title || 'आपके डेटा'} का विश्लेषण पूरा हुआ। कृपया विस्तृत परिणाम देखें।\`;
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
// ──────── Crop Recommendation`;

const startIndex = content.indexOf('function translateToTamil');
const endIndex = content.indexOf('//', startIndex); // The next comment should be the crop recommendation comment
// we want to find "// ──────── Crop Recommendation" or similar.
const cropIndex = content.indexOf('function CropRecommendation()');
let previousCommentIndex = content.lastIndexOf('//', cropIndex);

if (startIndex !== -1 && cropIndex !== -1) {
    content = content.substring(0, startIndex) + replacement + content.substring(cropIndex);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success");
} else {
    console.log("Could not find blocks");
}
