const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

const regexToRemove = /const cleanEncoding = \(text\) => \{[\s\S]*?return cleanText;\n\};/m;

code = code.replace(regexToRemove, `const cleanEncoding = (text) => {
  return text || '';
};`);

fs.writeFileSync('src/App.jsx', code);
console.log('cleanEncoding stripped');
