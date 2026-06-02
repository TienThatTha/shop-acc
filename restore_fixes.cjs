const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

// 1. Add getSortTime
const getSortTimeCode = `
const getSortTime = (tx) => {
  if (tx.created_at) {
    const t = new Date(tx.created_at).getTime();
    if (!isNaN(t)) return t;
  }
  if (tx.date) {
    const [datePart, timePart] = tx.date.split(' ');
    if (datePart && timePart) {
      const [day, month, year] = datePart.split('/');
      const t = new Date(\`\${year}-\${month}-\${day}T\${timePart}\`).getTime();
      if (!isNaN(t)) return t;
    }
  }
  return 0;
};

const App = () => {`;
code = code.replace('const App = () => {', getSortTimeCode);

// 2. Add handleRegister admin check
const registerCheckCode = `  const handleRegister = async (e) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      toast.error('Tên phải có ít nhất 3 ký tự!');
      return;
    }
    
    // Chặn mạo danh Admin
    const forbidden = ['admin', 'hệ thống', 'shop', 'system', 'quantri'];
    if (forbidden.some(word => name.toLowerCase().includes(word))) {
      toast.error('Tên không hợp lệ! Vui lòng chọn tên khác.');
      return;
    }`;
code = code.replace(`  const handleRegister = async (e) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      toast.error('Tên phải có ít nhất 3 ký tự!');
      return;
    }`, registerCheckCode);

// 3. Add sorting to Client Spin History
const clientSpinHistoryCode = `                    {transactionsDb.filter(t => t.type === 'spin_win' && t.user === currentUser?.name)
                      .sort((a, b) => getSortTime(b) - getSortTime(a))
                      .slice(0, visibleSpinsClient).map((tx, idx) => {`;
code = code.replace(`                    {transactionsDb.filter(t => t.type === 'spin_win' && t.user === currentUser?.name).slice(0, visibleSpinsClient).map((tx, idx) => {`, clientSpinHistoryCode);

// 4. Add sorting to Admin Spin History
const adminSpinHistoryCode = `                          {transactionsDb.filter(t => t.type === 'spin_win')
                            .sort((a, b) => getSortTime(b) - getSortTime(a))
                            .slice(0, visibleSpinsAdmin).map((tx, idx) => (`;
code = code.replace(`                          {transactionsDb.filter(t => t.type === 'spin_win').slice(0, visibleSpinsAdmin).map((tx, idx) => (`, adminSpinHistoryCode);

fs.writeFileSync('src/App.jsx', code);
console.log('Restored previously lost fixes');
