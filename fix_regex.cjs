const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

const target = `  cleanText = cleanText.replace(/Ch.*c may m.*n l.*n sau/gi, 'Chúc may mắn lần sau');
  cleanText = cleanText.replace(/Tr.*ng ph.*n th.*ng:/gi, 'Trúng phần thưởng:');
  cleanText = cleanText.replace(/Tr.*ng th.*ng:/gi, 'Trúng thưởng:');
  cleanText = cleanText.replace(/C.*ng 1 L.*t/gi, 'Cộng 1 Lượt');
  cleanText = cleanText.replace(/Th.*nh c.*ng/gi, 'Thành công');
  cleanText = cleanText.replace(/Tr.*t/gi, 'Trượt');
  
  // Khử các mã Unicode Latin-1 bị sai
  try {
    if (cleanText.includes('Báº¡n') || cleanText.includes('lÆ°á»£t') || cleanText.includes('cÃ³') || cleanText.includes('ChĂºc') || cleanText.includes('TrĂºng') || cleanText.includes('ThĂ') || cleanText.includes('Ä') || cleanText.includes('Ă') || cleanText.includes('á»£') || cleanText.includes('áº§')) {
      cleanText = decodeURIComponent(escape(cleanText));
    }
  } catch(e) {}
  
  return cleanText;
};`;

const replacement = `  // Dùng Regex an toàn: chỉ match các ký tự không phải chữ cái tiêu chuẩn, không phải số, và KHÔNG PHẢI KHOẢNG TRẮNG
  cleanText = cleanText.replace(/Ch[^a-zA-Z0-9\\s]+c may m[^a-zA-Z0-9\\s]+n l[^a-zA-Z0-9\\s]+n sau/gi, 'Chúc may mắn lần sau');
  cleanText = cleanText.replace(/Tr[^a-zA-Z0-9\\s]+ng ph[^a-zA-Z0-9\\s]+n th[^a-zA-Z0-9\\s]+ng:/gi, 'Trúng phần thưởng:');
  cleanText = cleanText.replace(/Tr[^a-zA-Z0-9\\s]+ng th[^a-zA-Z0-9\\s]+ng:/gi, 'Trúng thưởng:');
  cleanText = cleanText.replace(/C[^a-zA-Z0-9\\s]+ng 1 L[^a-zA-Z0-9\\s]+t/gi, 'Cộng 1 Lượt');
  cleanText = cleanText.replace(/Th[^a-zA-Z0-9\\s]+nh c[^a-zA-Z0-9\\s]+ng/gi, 'Thành công');
  cleanText = cleanText.replace(/Tr[^a-zA-Z0-9\\s]+t/gi, 'Trượt');
  
  return cleanText;
};`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.jsx', code);
console.log('Done');
