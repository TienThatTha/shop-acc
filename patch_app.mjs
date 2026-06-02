import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(/let val = parseInt\(e\.target\.value\) \|\| 1;\s*if \(val > maxLimit\) val = maxLimit;\s*if \(val < 1\) val = 1;\s*setBuyQuantity\(val\);/g, 
  `if (e.target.value === '') { setBuyQuantity(''); return; }
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) return;
                            if (val > maxLimit) val = maxLimit;
                            setBuyQuantity(val);`);

content = content.replace(/let val = parseInt\(e\.target\.value\) \|\| 1;\s*if \(maxLimit > 0 && val > maxLimit\) val = maxLimit;\s*setBoostQuantity\(Math\.max\(1, val\)\);/g,
  `if (e.target.value === '') { setBoostQuantity(''); return; }
                                  let val = parseInt(e.target.value);
                                  if (isNaN(val)) return;
                                  if (maxLimit > 0 && val > maxLimit) val = maxLimit;
                                  setBoostQuantity(val);`);

content = content.replace(/className="w-20 p-2 bg-\[#151D2F\] border border-slate-700 rounded-lg text-white font-bold text-center outline-none focus:border-blue-500"/g,
  `onBlur={() => { if (buyQuantity === '' || buyQuantity < 1) setBuyQuantity(1); }}\n                          className="w-20 p-2 bg-[#151D2F] border border-slate-700 rounded-lg text-white font-bold text-center outline-none focus:border-blue-500"`);

content = content.replace(/className="w-full p-2.5 bg-\[#0B1120\] border border-emerald-500\/50 rounded-lg text-emerald-400 font-bold outline-none shadow-inner"/g,
  `onBlur={() => { if (boostQuantity === '' || boostQuantity < 1) setBoostQuantity(1); }}\n                                className="w-full p-2.5 bg-[#0B1120] border border-emerald-500/50 rounded-lg text-emerald-400 font-bold outline-none shadow-inner"`);

content = content.replace(/format\(buyModalData\.price \* buyQuantity\)/g, 'format(buyModalData.price * (buyQuantity || 1))');
content = content.replace(/executeBuyAccount\(buyModalData, buyQuantity\)/g, 'executeBuyAccount(buyModalData, buyQuantity || 1)');

content = content.replace(/const timeOnly = tx\.date\.split\(' '\)\.pop\(\);/g, 
  "const timeOnly = tx.date.replace(/\\/\\d{4}/, '');");

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx updated successfully.');
