import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Revert "Lịch sử Vòng quay" from globalSpinHistory to transactionsDb (personal)
content = content.replace(
  /\{globalSpinHistory\.sort\(\(a, b\) => new Date\(b\.created_at\) - new Date\(a\.created_at\)\)\.slice\(0, visibleSpinsClient\)\.map\(\(tx, idx\) => \{/g,
  '{transactionsDb.filter(t => t.type === \'spin_win\' && t.user === currentUser?.name).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, visibleSpinsClient).map((tx, idx) => {'
);
content = content.replace(
  /globalSpinHistory\.length === 0/g,
  'transactionsDb.filter(t => t.type === \'spin_win\' && t.user === currentUser?.name).length === 0'
);

fs.writeFileSync('src/App.jsx', content);
console.log('Reverted Lịch sử vòng quay to personal.');
