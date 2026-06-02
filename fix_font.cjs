const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

// Replace {tx.action} with {cleanEncoding(tx.action)}
code = code.replace(/\{tx\.action\}/g, '{cleanEncoding(tx.action)}');

// Fix the recentWinners.map occurrences specifically
code = code.replace(/const cleanPrizeName = tx\.action\s*\n\s*\.replace\(\/Trúng phần thưởng:\/gi, ''\)/g, 
  "const cleanPrizeName = cleanEncoding(tx.action)\n                        .replace(/Trúng phần thưởng:/gi, '')");

fs.writeFileSync('src/App.jsx', code);
console.log('Done replacement');
