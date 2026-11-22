# AGENTS.md — Quy tắc BẮT BUỘC cho mọi AI Coder trong `shop-acc` (`shoptiengaming.com`)

> Đọc kỹ trước khi sửa bất kỳ tệp nào trong `shop-acc/` (xem thêm `../AGENTS.md` và `../AGENT_MEMORY.md` ở thư mục gốc).

## 1. Quy tắc Deploy — CẤM dùng `gh-pages`
- Website **`https://shoptiengaming.com`** và **`https://www.shoptiengaming.com`** hiện chạy trên **Cloudflare Pages** (project `shop-tiengaming`), tự động build & phát hành trực tiếp khi push lên nhánh **`main`** (`TienThatTha/shop-acc`).
- **TUYỆT ĐỐI KHÔNG** chạy `npm run deploy` hay đẩy thủ công lên nhánh **`gh-pages`** (lệnh `npm run deploy` đã được khóa an toàn để tránh ghi đè nhầm).
- **Quy trình deploy chuẩn**: kiểm tra `npm run build` sạch -> chỉ `git add` đúng file cần thiết (cấm `git add -A`, cấm đưa `.env` / `supabase/.env.local` / `*.bak*`) -> `git push origin main`.
- Yêu cầu môi trường build trên Cloudflare Pages: **`NODE_VERSION=22`** (cho Vite 8), `Build command: npm run build`, `Output: dist`.

## 2. Những tệp hạ tầng & cấu hình TUYỆT ĐỐI KHÔNG ĐƯỢC XÓA / LÀM HỎNG
- [`wrangler.toml`](wrangler.toml): giữ nguyên `name = "shop-tiengaming"`, `pages_build_output_dir = "dist"` và R2 bucket binding **`MTC_CDN` -> `mtc-cdn`**.
- [`public/_headers`](public/_headers): giữ nguyên rule `no-cache` cho `/index.html`, `/play/index.html`, `/download/version.json` và `immutable` cho `/assets/*`, `/game-assets/*`, `/mtc-showcase/*`.
- [`functions/api/upload-r2.js`](functions/api/upload-r2.js): upload ảnh trực tiếp lên R2 (`MTC_CDN`) với xác thực JWT Supabase, giới hạn `1,5 MB`/ảnh và trần mềm `500 MB` trên `shop-uploads/`.
- [`functions/api/verify-turnstile.js`](functions/api/verify-turnstile.js) & [`src/components/TurnstileWidget.jsx`](src/components/TurnstileWidget.jsx): khiên Cloudflare Turnstile chống spam đăng ký (yêu cầu giữ 2 biến `VITE_TURNSTILE_SITE_KEY` và `TURNSTILE_SECRET_KEY` trên Cloudflare Pages; KHÔNG chép `TURNSTILE_SECRET_KEY` vào mã nguồn hay `WORKLOG`).
- [`src/utils/cdnAsset.js`](src/utils/cdnAsset.js) & import trong [`src/main.jsx`](src/main.jsx): ánh xạ ảnh tĩnh sang `https://cdn.shoptiengaming.com/shop/...` kèm cơ chế tự fallback về `/...` nếu CDN lỗi.
- [`public/play/index.html`](public/play/index.html): vào thẳng `https://game.shoptiengaming.com` (song song kiểm tra `mtc_game_config` với cache 60s), vẫn giữ 3 tầng dự phòng khi server nhà tắt.

## 3. Quy tắc bảo vệ Free Tier Supabase & Cloudflare R2 (KHÔNG LÀM HẾT DUNG LƯỢNG / MẤT DATA)
- **Không lưu ảnh `data:image/` (base64) vào bảng Supabase DB**. Mọi upload mới phải nén WebP (`<= 0,35 MB`, avatar `<= 0,2 MB`) rồi đi qua `/api/upload-r2` (hoặc dự phòng ImgBB).
- **Không xóa file ảnh trùng tên trong `public/`** (nhiều dòng dữ liệu cũ trong DB vẫn trỏ đường dẫn `/...` hoặc `/game-assets/...`). Khi thêm/thay ảnh tĩnh hoặc file tải mới trong `public/`, chạy đồng bộ lên R2 từ thư mục cha:
  ```powershell
  python ..\tools\shop_r2_sync.py
  ```
- **Giữ nguyên các tối ưu tiết kiệm băng thông & Realtime Supabase trong `src/App.jsx`**:
  - Gộp truy vấn `site_config` thành 1 lần `.in('id', [...])` — **KHÔNG** select toàn bảng `site_config` (dòng `game_auction_market` nặng ~103 KB).
  - Giữ gộp kênh Realtime (`realtime-public` & `realtime-private`), giữ bộ lọc `users` theo `id=eq.<id>` cho khách thường và giữ nhịp ping `last_active` ở `>= 300000` ms (chỉ gửi khi tab đang mở).
- Kiểm tra hạn mức sau thay đổi lớn (từ thư mục cha): `python ..\tools\shop_free_tier_audit.py` (trần an toàn R2 = `8,0 GB / 10,0 GB` Free Tier).
