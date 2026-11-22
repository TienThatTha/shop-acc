# Shop Tiến Gaming (`shoptiengaming.com`)

Website thương mại & cổng chơi **Mộng Thiên Cửu H5** (React 19 + Vite 8 + Tailwind CSS).

## Kiến trúc vận hành hiện tại
- **Hosting Web & API Functions**: **Cloudflare Pages** (`shop-tiengaming`), tự động build & deploy từ nhánh **`main`** (`npm run build` -> `dist/`, `NODE_VERSION=22`).
- **Database, Auth, Nạp tự động & Realtime**: **Supabase** (`supabaseClient.js` + Edge Functions dưới `supabase/functions/`).
- **Kho ảnh tĩnh, APK & Ảnh upload mới**: **Cloudflare R2** (`https://cdn.shoptiengaming.com`, binding `MTC_CDN` trong `wrangler.toml`) có fallback tự động về tệp tĩnh nội bộ qua `src/utils/cdnAsset.js`.
- **Cổng chơi game (`/play/`)**: Nối trực tiếp máy chủ cố định `https://game.shoptiengaming.com` (Cloudflare Named Tunnel QUIC), tự động chuyển qua dự phòng 3 tầng nếu máy chủ tạm nghỉ.
- **Chống spam/bot**: Cloudflare Turnstile (`src/components/TurnstileWidget.jsx` + `functions/api/verify-turnstile.js`), honeypot và cooldown khi đăng ký/bình luận.

## Quy trình cập nhật & deploy chuẩn
> ⚠️ **KHÔNG chạy `npm run deploy` lên nhánh `gh-pages` cũ** — web chính thức đã chuyển sang Cloudflare Pages. Xem chi tiết quy tắc trong [`AGENTS.md`](AGENTS.md).

```bash
# 1. Kiểm tra build cục bộ không lỗi
npm run build

# 2. (Nếu có thêm/sửa ảnh tĩnh hoặc APK trong public/) Đồng bộ lên R2 từ thư mục gốc dự án
python ../tools/shop_r2_sync.py

# 3. Đẩy code lên nhánh main -> Cloudflare Pages tự động build & phát hành
git push origin main
```
