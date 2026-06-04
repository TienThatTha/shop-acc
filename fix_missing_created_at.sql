-- Khôi phục cấu hình tự động điền thời gian (now) cho các cột created_at
ALTER TABLE transactions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE deposit_requests ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE rent_requests ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE boosting_requests ALTER COLUMN created_at SET DEFAULT now();

-- Chữa cháy cho các dòng dữ liệu cũ đã lỡ bị lưu trống (NULL) trong quá trình dùng DB mới
UPDATE deposit_requests SET created_at = now() WHERE created_at IS NULL;
UPDATE transactions SET created_at = now() WHERE created_at IS NULL;
UPDATE rent_requests SET created_at = now() WHERE created_at IS NULL;
UPDATE boosting_requests SET created_at = now() WHERE created_at IS NULL;
