import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Task 1: Quantity inputs
content = content.replace(
  /let val = parseInt\(e\.target\.value\) \|\| 1;\s*if \(val > maxLimit\) val = maxLimit;\s*if \(val < 1\) val = 1;\s*setBuyQuantity\(val\);/g, 
  `if (e.target.value === '') { setBuyQuantity(''); return; }
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) return;
                            if (val > maxLimit) val = maxLimit;
                            setBuyQuantity(val);`
);

content = content.replace(
  /let val = parseInt\(e\.target\.value\) \|\| 1;\s*if \(maxLimit > 0 && val > maxLimit\) val = maxLimit;\s*setBoostQuantity\(Math\.max\(1, val\)\);/g,
  `if (e.target.value === '') { setBoostQuantity(''); return; }
                                  let val = parseInt(e.target.value);
                                  if (isNaN(val)) return;
                                  if (maxLimit > 0 && val > maxLimit) val = maxLimit;
                                  setBoostQuantity(val);`
);

content = content.replace(
  /className="w-20 p-2 bg-\[#151D2F\] border border-slate-700 rounded-lg text-white font-bold text-center outline-none focus:border-blue-500"/g,
  `onBlur={() => { if (buyQuantity === '' || buyQuantity < 1) setBuyQuantity(1); }}\n                          className="w-20 p-2 bg-[#151D2F] border border-slate-700 rounded-lg text-white font-bold text-center outline-none focus:border-blue-500"`
);

content = content.replace(
  /className="w-full p-2.5 bg-\[#0B1120\] border border-emerald-500\/50 rounded-lg text-emerald-400 font-bold outline-none shadow-inner"/g,
  `onBlur={() => { if (boostQuantity === '' || boostQuantity < 1) setBoostQuantity(1); }}\n                                className="w-full p-2.5 bg-[#0B1120] border border-emerald-500/50 rounded-lg text-emerald-400 font-bold outline-none shadow-inner"`
);

content = content.replace(/format\(buyModalData\.price \* buyQuantity\)/g, 'format(buyModalData.price * (buyQuantity || 1))');
content = content.replace(/executeBuyAccount\(buyModalData, buyQuantity\)/g, 'executeBuyAccount(buyModalData, buyQuantity || 1)');


// Task 2: Ticker time format
content = content.replace(
  /const timeOnly = tx\.date\.split\(' '\)\.pop\(\);/g, 
  "const timeOnly = tx.date.replace(/\\/\\d{4}/, '');"
);

// Task 3: Remove email verifications
content = content.replace(
  /if \(!currentUser\.is_email_verified\) return showToast\("Vui lòng vào mục Cá nhân để xác thực Email trước khi thanh toán!", "error"\);/g, 
  '// if (!currentUser.is_email_verified) return showToast("Vui lòng vào mục Cá nhân để xác thực Email trước khi thanh toán!", "error");'
);

// Task 4: Global recent winners
// 4a. Add state
content = content.replace(
  /const \[transactionsDb, setTransactionsDb\] = useState[^\n]+\n/,
  match => match + '  const [globalRecentWinners, setGlobalRecentWinners] = useState([]);\n'
);

// 4b. Add fetch logic
content = content.replace(
  /const configPromise = supabase\.from\('site_config'\)[\s\S]+?\}\);\n/,
  match => match + `\n      const winnersPromise = supabase.from('transactions').select('*').eq('type', 'spin_win').neq('amount', 0).order('created_at', { ascending: false }).limit(20).then(({ data }) => { if (data) setGlobalRecentWinners(data.filter(t => !t.isSpinCost)); });\n`
);

// 4c. Update realtime channel
content = content.replace(
  /(\/\/ Khách chỉ thấy của mình, Admin thấy hết[^\n]+\n\s+if \(\!isAdmin && payload\.new\.user \!== myIdentifier\) return;)/,
  match => `// Cập nhật globalRecentWinners cho mọi người\n        if (payload.new.type === 'spin_win' && payload.new.amount !== 0 && !payload.new.isSpinCost) {\n          setGlobalRecentWinners(prev => {\n            if (prev.find(t => t.id === payload.new.id)) return prev;\n            return [payload.new, ...prev].slice(0, 20);\n          });\n        }\n        \n        ` + match
);

// 4d. Update ticker list var
content = content.replace(
  /const recentWinners = transactionsDb\.filter\([\s\S]+?\.slice\(0, 5\);/,
  'const recentWinners = globalRecentWinners.slice(0, 5);'
);

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx completely patched successfully');
