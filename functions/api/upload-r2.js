/**
 * Cloudflare Pages Function: POST /api/upload-r2
 * Stores uploaded WebP/PNG/JPEG shop or avatar images directly into Cloudflare R2 (`MTC_CDN` binding),
 * enforcing Supabase JWT authentication, role permissions, 1.5 MB per-file cap, and a soft 500 MB cap
 * under `shop-uploads/` so Free Tier 10 GB is never exceeded.
 */

const ALLOWED_MIME = {
  'image/webp': 'webp',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};
const MAX_UPLOAD_BYTES = 1536 * 1024; // 1.5 MB
const SOFT_SHOP_UPLOADS_CAP_BYTES = 500 * 1024 * 1024; // 500 MB soft cap inside R2 Free Tier
const PUBLIC_CDN_BASE = 'https://cdn.shoptiengaming.com';

function jsonRes(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function parseDataUrl(dataUrl) {
  const m = String(dataUrl || '').match(/^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!m) return null;
  const mime = m[1].toLowerCase();
  const b64 = m[2].replace(/\s+/g, '');
  const approxBytes = Math.floor((b64.length * 3) / 4);
  if (approxBytes <= 0 || approxBytes > MAX_UPLOAD_BYTES) return null;

  const binStr = atob(b64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  return { mime, ext: ALLOWED_MIME[mime], bytes };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.MTC_CDN) {
    return jsonRes({ ok: false, error: 'Chưa gắn R2 binding MTC_CDN trên Cloudflare Pages' }, 503);
  }
  const supaUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const supaAnon = (env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!supaUrl || !supaAnon) {
    return jsonRes({ ok: false, error: 'Thiếu cấu hình SUPABASE_URL / SUPABASE_ANON_KEY trên Pages' }, 503);
  }

  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return jsonRes({ ok: false, error: 'Yêu cầu đăng nhập để tải ảnh lên R2' }, 401);
  }

  // Verify caller identity & role via Supabase Auth + public.users using caller's JWT (respects RLS)
  const authRes = await fetch(`${supaUrl}/auth/v1/user`, {
    headers: { apikey: supaAnon, Authorization: `Bearer ${token}` },
  });
  if (!authRes.ok) {
    return jsonRes({ ok: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' }, 401);
  }
  const authUser = await authRes.json();
  const userId = authUser?.id;
  if (!userId) {
    return jsonRes({ ok: false, error: 'Không xác định được tài khoản' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRes({ ok: false, error: 'Payload JSON không hợp lệ' }, 400);
  }

  const category = String(body?.category || 'general').replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'general';
  const parsed = parseDataUrl(body?.dataUrl);
  if (!parsed) {
    return jsonRes({ ok: false, error: 'Ảnh phải là WebP/PNG/JPEG hợp lệ và tối đa 1.5MB' }, 400);
  }

  // Only Admin can upload non-avatar shop assets; regular users may only upload their own avatar
  if (category !== 'avatar') {
    const uRes = await fetch(
      `${supaUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=role,is_locked`,
      { headers: { apikey: supaAnon, Authorization: `Bearer ${token}` } }
    );
    if (!uRes.ok) {
      return jsonRes({ ok: false, error: 'Không thể kiểm tra quyền quản trị' }, 403);
    }
    const rows = await uRes.json();
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    if (!row || String(row.role || '').toLowerCase() !== 'admin' || row.is_locked) {
      return jsonRes({ ok: false, error: 'Chỉ Quản trị viên mới được phép tải ảnh cửa hàng lên R2' }, 403);
    }
  }

  // Enforce soft storage budget under shop-uploads/
  let usedBytes = 0;
  let cursor;
  let safetyLoops = 0;
  do {
    const listed = await env.MTC_CDN.list({ prefix: 'shop-uploads/', limit: 1000, cursor });
    for (const obj of listed.objects || []) {
      usedBytes += obj.size || 0;
    }
    cursor = listed.truncated ? listed.cursor : undefined;
    safetyLoops += 1;
  } while (cursor && safetyLoops < 10);

  if (usedBytes + parsed.bytes.byteLength > SOFT_SHOP_UPLOADS_CAP_BYTES) {
    return jsonRes({ ok: false, error: 'Kho ảnh R2 shop-uploads đã chạm ngưỡng an toàn 500MB' }, 507);
  }

  const stamp = new Date().toISOString().slice(0, 7);
  const rand = crypto.randomUUID().slice(0, 12);
  const key = `shop-uploads/${category}/${stamp}/${userId.slice(0, 8)}_${Date.now()}_${rand}.${parsed.ext}`;

  await env.MTC_CDN.put(key, parsed.bytes, {
    httpMetadata: {
      contentType: parsed.mime,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  return jsonRes({
    ok: true,
    key,
    bytes: parsed.bytes.byteLength,
    url: `${PUBLIC_CDN_BASE}/${key}`,
  });
}
