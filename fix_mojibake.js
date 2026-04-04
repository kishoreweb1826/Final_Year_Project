const fs = require('fs');

const path = 'c:\\Users\\acer\\OneDrive\\Desktop\\Final_Year\\react-app\\src\\pages\\AITools.jsx';
let content = fs.readFileSync(path, 'utf8');

function fixMojibake(str) {
    try {
        return Buffer.from(str, 'latin1').toString('utf8');
    } catch(e) {
        return str;
    }
}

content = content.replace(/['"`](.*?)['"`]/g, (match, p1) => {
    if (p1.includes('à®') || p1.includes('à¤') || p1.includes('Â°')) {
        // Handle template string variables correctly by avoiding altering `${...}` if possible
        // But since the regex matches the whole string literal, we might need a safer replace
        let fixed = fixMojibake(p1);
        if(fixed.includes('')) return match; // If failed slightly
        return match[0] + fixed + match[0];
    }
    return match;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed mojibake');
