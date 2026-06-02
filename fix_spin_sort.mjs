import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// The date string is like "10/05/2026 15:16:31"
const newSortLogic = `transactionsDb.filter(t => t.type === 'spin_win' && t.user === currentUser?.name).sort((a, b) => {
                      const parseD = (str) => {
                        if (!str) return 0;
                        const parts = str.split(' ');
                        if (parts.length < 2) return 0;
                        const [d, m, y] = parts[0].split('/');
                        return new Date(\`\${y}-\${m}-\${d}T\${parts[1]}\`).getTime();
                      };
                      return parseD(b.date) - parseD(a.date);
                    }).slice(0, visibleSpinsClient).map((tx, idx) => {`;

content = content.replace(
  /transactionsDb\.filter\(t => t\.type === 'spin_win' && t\.user === currentUser\?\.name\)\.sort\(\(a, b\) => new Date\(b\.created_at\) - new Date\(a\.created_at\)\)\.slice\(0, visibleSpinsClient\)\.map\(\(tx, idx\) => \{/g,
  newSortLogic
);

// Also need to fix the issue where handleSpin fetches limit(2) and might get random stuff due to created_at: null.
// Let's modify handleSpin to sort by id or date? Supabase cannot sort by the date string easily because it's DD/MM/YYYY.
// We can order by 'id' descending, since UUIDs are not ordered, but wait, they are UUIDv4. We cannot order by UUID.
// Actually, if we just remove the manual fetch in handleSpin, Realtime will handle it perfectly!
// But wait, Realtime might be blocked by RLS for guests? Guests can't spin anyway!
// So let's just let handleSpin fetch, but order by 'id' { ascending: false }?
// Let's just fix the sort logic in Lịch sử Vòng quay first.

fs.writeFileSync('src/App.jsx', content);
console.log('Fixed spin history sort by parsing date string.');
