/**
 * Cloudflare Pages Function: POST /api/verify-turnstile
 * Verifies a Cloudflare Turnstile token server-side before sensitive auth/comment actions.
 * Expects env.TURNSTILE_SECRET_KEY in Cloudflare Pages environment variables.
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };

  if (!env.TURNSTILE_SECRET_KEY) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Turnstile chưa được cấu hình TURNSTILE_SECRET_KEY trên Pages' }),
      { status: 503, headers: corsHeaders }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Dữ liệu JSON không hợp lệ' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const token = String(body?.token || '').trim();
  if (!token || token.length > 4096) {
    return new Response(JSON.stringify({ ok: false, error: 'Thiếu mã xác minh chống bot' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const formData = new FormData();
  formData.append('secret', env.TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) formData.append('remoteip', ip);

  const verifyResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });
  const outcome = await verifyResp.json();

  if (!outcome?.success) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Xác minh chống bot thất bại, vui lòng thử lại', codes: outcome?.['error-codes'] || [] }),
      { status: 403, headers: corsHeaders }
    );
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
}
