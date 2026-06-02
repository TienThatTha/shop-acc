const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

code = code.replace(/cleanText = cleanText\.replace\(\/Ch\.\*c may m\.\*n l\.\*n sau\/gi, 'Chúc may mắn lần sau'\);/, "cleanText = cleanText.replace(/Ch[^a-zA-Z0-9\\\\s]+c may m[^a-zA-Z0-9\\\\s]+n l[^a-zA-Z0-9\\\\s]+n sau/gi, 'Chúc may mắn lần sau');");
code = code.replace(/cleanText = cleanText\.replace\(\/Tr\.\*ng ph\.\*n th\.\*ng:\/gi, 'Trúng phần thưởng:'\);/, "cleanText = cleanText.replace(/Tr[^a-zA-Z0-9\\\\s]+ng ph[^a-zA-Z0-9\\\\s]+n th[^a-zA-Z0-9\\\\s]+ng:/gi, 'Trúng phần thưởng:');");
code = code.replace(/cleanText = cleanText\.replace\(\/Tr\.\*ng th\.\*ng:\/gi, 'Trúng thưởng:'\);/, "cleanText = cleanText.replace(/Tr[^a-zA-Z0-9\\\\s]+ng th[^a-zA-Z0-9\\\\s]+ng:/gi, 'Trúng thưởng:');");
code = code.replace(/cleanText = cleanText\.replace\(\/C\.\*ng 1 L\.\*t\/gi, 'Cộng 1 Lượt'\);/, "cleanText = cleanText.replace(/C[^a-zA-Z0-9\\\\s]+ng 1 L[^a-zA-Z0-9\\\\s]+t/gi, 'Cộng 1 Lượt');");
code = code.replace(/cleanText = cleanText\.replace\(\/Th\.\*nh c\.\*ng\/gi, 'Thành công'\);/, "cleanText = cleanText.replace(/Th[^a-zA-Z0-9\\\\s]+nh c[^a-zA-Z0-9\\\\s]+ng/gi, 'Thành công');");
code = code.replace(/cleanText = cleanText\.replace\(\/Tr\.\*t\/gi, 'Trượt'\);/, "cleanText = cleanText.replace(/Tr[^a-zA-Z0-9\\\\s]+t/gi, 'Trượt');");

fs.writeFileSync('src/App.jsx', code);
console.log('Regex fix applied properly');
