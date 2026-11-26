const BANNED_EXACT_TOKENS = new Set([
  'dm', 'dmm', 'vcl', 'vkl', 'vl', 'clmm', 'clm', 'cc', 'lon', 'cac', 'buoi',
  'dit', 'du', 'fuck', 'bitch', 'shit', 'kubet', 'sunwin', 'go88', 'hitclub',
  '789club', 'f8bet', 'jun88', 'hi88', 'shbet', 'new88', 'okvip', 'mb66', '8xbet'
]);

const BANNED_PHRASES = [
  'dit me', 'du ma', 'du me', 'mat day', 'oc cho', 'ngu nguc', 'cho chet',
  'me may', 'bo may', 'nha cai', 'tai xiu', 'ca do', 'ca cuoc', 'no hu',
  'xoc dia', 'ban dam', 'ma tuy', 'hang trang', 'tu tu', 'giet nguoi'
];

function stripAccents(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export const DONATE_MSG_BASE_MAX_LEN = 150;
export const DONATE_MSG_BONUS_STEP_VND = 10000;
export const DONATE_MSG_BONUS_CHARS_PER_STEP = 50;
export const DONATE_MSG_HARD_CAP = 10000;

export function getDonateMessageMaxLen(rawAmount) {
  const num = Math.max(0, Math.floor(Number(String(rawAmount ?? '').replace(/\D/g, '')) || 0));
  const steps = Math.floor(num / DONATE_MSG_BONUS_STEP_VND);
  return Math.min(DONATE_MSG_HARD_CAP, DONATE_MSG_BASE_MAX_LEN + steps * DONATE_MSG_BONUS_CHARS_PER_STEP);
}

export function validateDonateAmount(rawAmount) {
  const num = Math.floor(Number(String(rawAmount || '').replace(/\D/g, '')) || 0);
  if (num < 5000) {
    return { ok: false, amount: num, error: 'Số tiền Donate tối thiểu là 5.000đ.' };
  }
  return { ok: true, amount: num, error: '' };
}

export function validateDonateMessage(rawText, maxLen = DONATE_MSG_BASE_MAX_LEN) {
  const cleaned = String(rawText || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return { ok: true, cleaned: '', error: '' };
  }
  if (cleaned.length > maxLen) {
    return { ok: false, cleaned: '', error: `Lời nhắn tối đa ${maxLen} ký tự (hiện tại ${cleaned.length}).` };
  }
  if (/(https?:\/\/|www\.|t\.me\/|zalo\.me\/|fb\.com\/|\b[a-z0-9-]{2,}\.(com|net|org|vn|io|xyz|club|bet|vip|win|info|top|co|me)\b)/i.test(cleaned)) {
    return { ok: false, cleaned: '', error: 'Lời nhắn không được chứa liên kết website.' };
  }
  if (/(\+?84|0)(?:[\s.\-_]*\d){8,10}\b/.test(cleaned)) {
    return { ok: false, cleaned: '', error: 'Lời nhắn không được chứa số điện thoại.' };
  }
  if (/(.)\1{5,}/i.test(cleaned)) {
    return { ok: false, cleaned: '', error: 'Lời nhắn chứa ký tự lặp lại quá nhiều (spam).' };
  }
  const noSpace = cleaned.replace(/\s+/g, '').toLowerCase();
  if (noSpace.length >= 10) {
    const counts = {};
    let maxFreq = 0;
    for (const ch of noSpace) {
      counts[ch] = (counts[ch] || 0) + 1;
      if (counts[ch] > maxFreq) maxFreq = counts[ch];
    }
    if (maxFreq / noSpace.length > 0.7) {
      return { ok: false, cleaned: '', error: 'Lời nhắn bị đánh dấu spam ký tự lặp.' };
    }
  }
  const norm = stripAccents(cleaned).toLowerCase();
  const padded = ` ${norm} `;
  for (const phrase of BANNED_PHRASES) {
    if (padded.includes(phrase)) {
      return { ok: false, cleaned: '', error: 'Lời nhắn chứa từ ngữ không phù hợp trên sóng Live TikTok.' };
    }
  }
  const tokens = norm.match(/[a-z0-9]+/g) || [];
  for (const tok of tokens) {
    if (BANNED_EXACT_TOKENS.has(tok)) {
      return { ok: false, cleaned: '', error: 'Lời nhắn chứa từ ngữ không phù hợp trên sóng Live TikTok.' };
    }
  }
  return { ok: true, cleaned, error: '' };
}
