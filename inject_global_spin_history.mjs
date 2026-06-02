import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add globalSpinHistory state
content = content.replace(
  /const \[globalRecentWinners, setGlobalRecentWinners\] = useState\(\[\]\);/g,
  'const [globalRecentWinners, setGlobalRecentWinners] = useState([]);\n  const [globalSpinHistory, setGlobalSpinHistory] = useState([]);'
);

// 2. Add fetch logic for globalSpinHistory
const fetchLogic = `
      const winnersPromise = supabase.from('transactions').select('*').eq('type', 'spin_win').neq('amount', 0).order('created_at', { ascending: false }).limit(20).then(({ data }) => { if (data) setGlobalRecentWinners(data.filter(t => !t.isSpinCost)); });
      const historyPromise = supabase.from('transactions').select('*').eq('type', 'spin_win').order('created_at', { ascending: false }).limit(20).then(({ data }) => { if (data) setGlobalSpinHistory(data); });
`;
content = content.replace(
  /const winnersPromise = supabase\.from\('transactions'\)\.select\('\*'\)\.eq\('type', 'spin_win'\)\.neq\('amount', 0\)\.order\('created_at', \{ ascending: false \}\)\.limit\(20\)\.then\(\(\{ data \}\) => \{ if \(data\) setGlobalRecentWinners\(data\.filter\(t => !t\.isSpinCost\)\); \}\);/g,
  fetchLogic
);

// 3. Update Realtime channel to update globalSpinHistory
const realtimeUpdate = `
        // Cập nhật globalSpinHistory cho mọi người (cả trúng và trượt)
        if (payload.new.type === 'spin_win') {
          setGlobalSpinHistory(prev => {
            if (prev.find(t => t.id === payload.new.id)) return prev;
            return [payload.new, ...prev].slice(0, 20);
          });
        }
`;
content = content.replace(
  /\/\/ Cập nhật globalRecentWinners cho mọi người/g,
  realtimeUpdate + '\n        // Cập nhật globalRecentWinners cho mọi người'
);

// 4. Update the Lịch sử Vòng quay rendering
content = content.replace(
  /\{transactionsDb\.filter\(t => t\.type === 'spin_win' && t\.user === currentUser\?\.name\)\.sort\(\(a, b\) => new Date\(b\.created_at\) - new Date\(a\.created_at\)\)\.slice\(0, visibleSpinsClient\)\.map\(\(tx, idx\) => \{/g,
  '{globalSpinHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, visibleSpinsClient).map((tx, idx) => {'
);
content = content.replace(
  /transactionsDb\.filter\(t => t\.type === 'spin_win' && t\.user === currentUser\?\.name\)\.length === 0/g,
  'globalSpinHistory.length === 0'
);

fs.writeFileSync('src/App.jsx', content);
console.log('globalSpinHistory injected successfully');
