import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetRegex = /if \(!currentUser\.is_email_verified\) return showToast\("Vui lòng vào mục Cá nhân để xác thực Email trước khi thanh toán!", "error"\);/g;
content = content.replace(targetRegex, '// if (!currentUser.is_email_verified) return showToast("Vui lòng vào mục Cá nhân để xác thực Email trước khi thanh toán!", "error");');

fs.writeFileSync('src/App.jsx', content);
console.log('Removed email verification checks from App.jsx');
