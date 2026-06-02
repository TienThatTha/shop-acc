const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

const replacements = [
  // Lịch sử giao dịch (Client)
  [
    /\{tx\.status\}\s*<\/p>/g,
    '{cleanEncoding(tx.status)}</p>'
  ],
  // Conditional checks (Client)
  [
    /\$\{tx\.status\.includes\('\+'\)\s*\|\|\s*tx\.status\s*===\s*'Thành công'\s*\?\s*'text-emerald-500 bg-emerald-500\/10'/g,
    "${cleanEncoding(tx.status).includes('+') || cleanEncoding(tx.status) === 'Thành công' ? 'text-emerald-500 bg-emerald-500/10'"
  ],
  [
    /tx\.status\.includes\('cọc'\)/g,
    "cleanEncoding(tx.status).includes('cọc')"
  ],
  [
    /tx\.status\.includes\('Hoàn tác'\)/g,
    "cleanEncoding(tx.status).includes('Hoàn tác')"
  ],
  // Admin Transaction History Conditional checks
  [
    /tx\.status\.includes\('\+'\)\s*\|\|\s*tx\.status\s*===\s*'Thành công'\s*\|\|\s*tx\.status\s*===\s*'Hoàn thành'/g,
    "cleanEncoding(tx.status).includes('+') || cleanEncoding(tx.status) === 'Thành công' || cleanEncoding(tx.status) === 'Hoàn thành'"
  ],
  [
    /tx\.status\s*===\s*'Đang cày'/g,
    "cleanEncoding(tx.status) === 'Đang cày'"
  ],
  [
    /tx\.status\s*===\s*'Chờ xử lý'/g,
    "cleanEncoding(tx.status) === 'Chờ xử lý'"
  ]
];

for (const [pattern, replacement] of replacements) {
  code = code.replace(pattern, replacement);
}

fs.writeFileSync('src/App.jsx', code);
console.log('Done script');
