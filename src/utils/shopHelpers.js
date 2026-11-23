import { supabase } from '../supabaseClient';

let _imageCompressionPromise = null;
export const compressImageFile = async (file, options) => {
  if (!_imageCompressionPromise) {
    _imageCompressionPromise = import('browser-image-compression').then((m) => m.default);
  }
  const compress = await _imageCompressionPromise;
  return compress(file, options);
};

// Helper lưu cấu hình bật/tắt thông báo cho từng món vòng quay (chống lỗi schema & sync realtime)
export const getWheelNotifyFallback = (itemId) => {
  if (!itemId) return false;
  try {
    const map = JSON.parse(localStorage.getItem('wheel_notify_map') || '{}');
    return Boolean(map[itemId]);
  } catch {
    return false;
  }
};

export const saveWheelNotifyFallback = (itemId, val) => {
  if (!itemId) return;
  try {
    const map = JSON.parse(localStorage.getItem('wheel_notify_map') || '{}');
    map[itemId] = Boolean(val);
    localStorage.setItem('wheel_notify_map', JSON.stringify(map));
  } catch { /* ignore */ }
};

// Helper định dạng ngày giờ cho input datetime-local (YYYY-MM-DDTHH:mm)
export const formatDateTimeLocal = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

export const getRecordTime = (item) => {
  if (item.created_at) return new Date(item.created_at).getTime();
  if (item.date) {
    const dStr = item.date;
    let d = 0;
    const p1 = dStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    const p2 = dStr.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/);
    if (p1 && p2) d = new Date(`${p1[3]}-${p1[2].padStart(2, '0')}-${p1[1].padStart(2, '0')}T${p2[1].padStart(2, '0')}:${p2[2].padStart(2, '0')}:${p2[3].padStart(2, '0')}`).getTime();
    if (d > 0 && !isNaN(d)) return d;
  }
  if (item.id) {
    const num = parseInt(String(item.id).replace(/\D/g, ''));
    if (!isNaN(num) && num > 1000000000000) return num;
  }
  return 0;
};

export const getActiveStatus = (lastActiveTime) => {
  if (!lastActiveTime) return { text: 'Ngoại tuyến', isOnline: false };
  const diffInMinutes = Math.floor((new Date() - new Date(lastActiveTime)) / 60000);
  if (diffInMinutes < 3) return { text: 'Đang trực tuyến', isOnline: true };
  if (diffInMinutes < 60) return { text: `${diffInMinutes} phút trước`, isOnline: false };
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return { text: `${diffInHours} giờ trước`, isOnline: false };
  const diffInDays = Math.floor(diffInHours / 24);
  return { text: `${diffInDays} ngày trước`, isOnline: false };
};

export const enforceNumberInput = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
};

// --- TÍCH HỢP R2 CDN (ƯU TIÊN CLOUDFLARE PAGES FUNCTION) + DỰ PHÒNG IMGBB ---
const IMGBB_API_KEY = '129f0f9c5449d2dc93e7cc00b153eeab';
let r2UploadEndpointMissing = false;

export const uploadToImgBB = async (base64String, category = 'general') => {
  if (!base64String || !base64String.startsWith('data:image')) return base64String;
  try {
    // 1. Ưu tiên tải lên Cloudflare R2 qua Pages Function /api/upload-r2 (0đ egress, bền vững vĩnh viễn)
    const isLocalHost =
      typeof window !== 'undefined' &&
      ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (typeof window !== 'undefined' && !isLocalHost && !r2UploadEndpointMissing) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const r2Res = await fetch('/api/upload-r2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ dataUrl: base64String, category }),
          });
          if (r2Res.ok) {
            const r2Json = await r2Res.json();
            if (r2Json?.ok && r2Json?.url) {
              return r2Json.url;
            }
          } else if (r2Res.status === 404 || r2Res.status === 405) {
            r2UploadEndpointMissing = true;
          }
        }
      } catch (r2Err) {
        console.warn('Chuyển dự phòng ImgBB do /api/upload-r2 chưa sẵn sàng:', r2Err);
      }
    }

    // 2. Dự phòng ImgBB (vẫn tuyệt đối không lưu base64 data:image vào Supabase DB)
    const base64Data = base64String.split(',')[1];
    const formData = new FormData();
    formData.append('image', base64Data);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      return data.data.url;
    } else {
      console.error("Lỗi ImgBB:", data);
      throw new Error(data.error?.message || "Không thể upload ảnh lên máy chủ lưu trữ");
    }
  } catch (err) {
    console.error("Lỗi upload ảnh:", err);
    throw err;
  }
};

export const getCustomerFriendlyError = (details) => {
  if (!details) return null;
  const match = details.match(/^\[(.*?)\]/);
  if (!match) return null;
  const errorMsg = match[1].toLowerCase();

  const allowedErrors = [
    'được sử dụng',
    'sai mệnh giá',
    'sai mã số seri',
    'không tồn tại',
    'sai định dạng',
    'không hợp lệ'
  ];

  if (allowedErrors.some(allowed => errorMsg.includes(allowed))) {
    return match[1]; // Trả về chính xác câu lỗi từ API (ko thêm chữ Lỗi)
  }
  return null;
};
