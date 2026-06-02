-- ==============================================================================
-- 1. SỬA CÁC TEXT BỊ LỖI FONT TRONG BẢNG TRANSACTIONS (LỊCH SỬ CŨ) BẰNG CÁCH CẮT CHUỖI
-- ==============================================================================

-- Xử lý các dòng có action bắt đầu bằng 'TrĂºng phĂ¢' (Lỗi của chữ 'Trúng phần thưởng:')
UPDATE transactions
SET action = 'Trúng thưởng: ' || SPLIT_PART(action, ': ', 2)
WHERE action LIKE 'TrĂºng phĂ¢%';

-- Xử lý các dòng có action bắt đầu bằng 'TrĂºng thÆ°' (Lỗi của chữ 'Trúng thưởng:')
UPDATE transactions
SET action = 'Trúng thưởng: ' || SPLIT_PART(action, ': ', 2)
WHERE action LIKE 'TrĂºng thÆ°%';

-- Xử lý các dòng có action là 'CĂ´ng 1 LÆ°á»£t'
UPDATE transactions 
SET action = 'Cộng 1 Lượt'
WHERE action LIKE 'CĂ´ng 1 LÆ°%';

-- Xử lý status bị lỗi font tương tự
UPDATE transactions 
SET status = 'Cộng 1 Lượt'
WHERE status LIKE 'CĂ´ng 1 LÆ°%';

UPDATE transactions 
SET status = 'Thành công'
WHERE status LIKE 'ThĂ nh cĂ´ng%';

UPDATE transactions 
SET status = 'Trượt'
WHERE status LIKE 'TrÆ°á»£t%';

UPDATE transactions 
SET action = 'Chúc may mắn lần sau'
WHERE action LIKE 'ChĂºc may mĂ¡n lĂ¡%';

UPDATE transactions 
SET status = 'Chúc may mắn lần sau'
WHERE status LIKE 'ChĂºc may mĂ¡n lĂ¡%';
