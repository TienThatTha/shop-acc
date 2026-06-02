import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add globalRecentWinners state next to transactionsDb
content = content.replace(
  /const \[transactionsDb, setTransactionsDb\] = useState[^\n]+\n/,
  match => match + '  const [globalRecentWinners, setGlobalRecentWinners] = useState([]);\n'
);

// 2. Add fetch logic in the main useEffect (e.g. near site_config fetching)
content = content.replace(
  /const configPromise = supabase\.from\('site_config'\)[\s\S]+?\}\);\n/,
  match => match + `\n      const winnersPromise = supabase.from('transactions').select('*').eq('type', 'spin_win').neq('amount', 0).order('created_at', { ascending: false }).limit(20).then(({ data }) => { if (data) setGlobalRecentWinners(data.filter(t => !t.isSpinCost)); });\n`
);

// 3. Update the realtime transaction channel logic
content = content.replace(
  /(\/\/ Khách chỉ thấy của mình, Admin thấy hết[^\n]+\n\s+if \(\!isAdmin && payload\.new\.user \!== myIdentifier\) return;)/,
  match => `// Cập nhật globalRecentWinners cho mọi người\n        if (payload.new.type === 'spin_win' && payload.new.amount !== 0 && !payload.new.isSpinCost) {\n          setGlobalRecentWinners(prev => {\n            if (prev.find(t => t.id === payload.new.id)) return prev;\n            return [payload.new, ...prev].slice(0, 20);\n          });\n        }\n        \n        ` + match
);

// 4. Use globalRecentWinners instead of filtering transactionsDb for the ticker
content = content.replace(
  /const recentWinners = transactionsDb\.filter\([\s\S]+?\.slice\(0, 5\);/,
  'const recentWinners = globalRecentWinners.slice(0, 5);'
);

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx patched successfully');
