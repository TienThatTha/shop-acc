const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

const start = 'const cleanEncoding = (text) => {';
const end = '  return cleanText;\n};';
const startIndex = code.indexOf(start);
const endIndex = code.indexOf(end) + end.length;

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = 'const cleanEncoding = (text) => {\n  return text || "";\n};';
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/App.jsx', code);
  console.log('cleanEncoding replaced successfully');
} else {
  console.log('cleanEncoding not found');
}
