-- ==============================================================================
-- CÁCH CHUẨN NHẤT: BỎ QUA CÁC KÝ TỰ BỊ LỖI, CHỈ TÌM THEO CÁC CHỮ CÁI TIẾNG ANH
-- ==============================================================================

-- 1. Xử lý "Trúng phần thưởng: ..."
-- Tìm các chuỗi bắt đầu bằng Tr, chứa ng ph, chứa n th, chứa ng:
UPDATE transactions
SET action = 'Trúng thưởng: ' || TRIM(SPLIT_PART(action, ':', 2))
WHERE action LIKE 'Tr%ng ph%n th%ng:%';

-- 2. Xử lý "Chúc may mắn lần sau"
UPDATE transactions 
SET action = 'Chúc may mắn lần sau'
WHERE action LIKE 'Ch%c may m%n l%n sau%';

UPDATE transactions 
SET status = 'Chúc may mắn lần sau'
WHERE status LIKE 'Ch%c may m%n l%n sau%';

-- 3. Xử lý "Cộng 1 Lượt" (nếu có bị lỗi)
UPDATE transactions 
SET action = 'Cộng 1 Lượt'
WHERE action LIKE 'C%ng 1 L%t%' AND action != 'Cộng 1 Lượt';

UPDATE transactions 
SET status = 'Cộng 1 Lượt'
WHERE status LIKE 'C%ng 1 L%t%' AND status != 'Cộng 1 Lượt';

-- 4. Xử lý "Thành công"
UPDATE transactions 
SET status = 'Thành công'
WHERE status LIKE 'Th%nh c%ng%' AND status != 'Thành công';

-- 5. Xử lý "Trượt"
UPDATE transactions 
SET status = 'Trượt'
WHERE status LIKE 'Tr%t' AND status != 'Trượt';
