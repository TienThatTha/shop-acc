-- =============================================================================
-- BẢO HIỂM GIÀY HUYỀN THOẠI 120 LẦN & TÍCH HỢP VẬT PHẨM GAME VÀO VÒNG QUAY
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào mục SQL Editor trên Supabase Dashboard và bấm RUN
-- =============================================================================

-- 1. Thêm cột shoes_pity vào bảng users (Lưu số lần quay tích lũy chưa ra giày)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS shoes_pity integer DEFAULT 0;

-- 2. Thêm cột shoes vào bảng game_players nếu chưa có
ALTER TABLE public.game_players ADD COLUMN IF NOT EXISTS shoes jsonb DEFAULT '[]'::jsonb;

-- 3. Cập nhật hàm quay m_spin_wheel với cơ chế Bảo hiểm 120 lần:
--    Nếu quay 120 lần bằng lượt không ra giày -> Lần quay 121 CHẮC CHẮN 100% trúng Giày Huyền Thoại!
CREATE OR REPLACE FUNCTION public.m_spin_wheel(
    khach_id text,
    p_wheel_type text,
    p_cost numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user record;
    v_total_rate numeric := 0;
    v_rand numeric;
    v_cumulative numeric := 0;
    v_winner record;
    v_new_balance numeric;
    v_new_spins numeric;
    v_new_fund numeric;
    v_tx_id text;
    v_now text;
    v_item_rate numeric;
    v_item record;
    v_shoes_item record;
    v_curr_pity integer := 0;
    v_new_pity integer := 0;
    v_is_pity_trigger boolean := false;
    v_is_shoes boolean := false;
BEGIN
    -- 1. Lấy thông tin người dùng và khóa dòng
    SELECT * INTO v_user FROM users WHERE id = khach_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Người dùng không tồn tại!');
    END IF;

    -- 2. Kiểm tra số dư / lượt quay
    IF p_wheel_type = 'money' THEN
        IF v_user.balance < p_cost THEN
            RETURN jsonb_build_object('success', false, 'message', 'Số dư không đủ để quay!');
        END IF;
        IF p_cost <= 0 THEN
            RETURN jsonb_build_object('success', false, 'message', 'Chi phí quay không hợp lệ!');
        END IF;
    ELSE
        IF COALESCE(v_user.spins, 0) < p_cost THEN
            RETURN jsonb_build_object('success', false, 'message', 'Bạn không có đủ lượt quay!');
        END IF;
    END IF;

    -- Đọc mức bảo hiểm hiện tại
    v_curr_pity := COALESCE(v_user.shoes_pity, 0);

    -- 3. KIỂM TRA BẢO HIỂM 120 LẦN CHO VÒNG QUAY LƯỢT:
    -- Nếu p_wheel_type = 'spin' và người dùng đã quay 120 lần không trúng Giày (v_curr_pity >= 120)
    -- Thì lần quay thứ 121 sẽ 100% kích hoạt bảo hiểm trúng Giày Huyền Thoại!
    IF p_wheel_type = 'spin' AND v_curr_pity >= 120 THEN
        SELECT * INTO v_shoes_item FROM wheel_items
        WHERE wheel_type = 'spin'
          AND (quantity IS NULL OR quantity > 0)
          AND (
              type = 'game_shoes_legendary'
              OR lower(name) LIKE '%giày huyền thoại%'
              OR lower(name) LIKE '%giày thần tốc%'
          )
        ORDER BY id ASC LIMIT 1;

        IF v_shoes_item IS NOT NULL THEN
            v_winner := v_shoes_item;
            v_is_pity_trigger := true;
            v_is_shoes := true;
        END IF;
    END IF;

    -- Nếu chưa kích hoạt bảo hiểm, quay ngẫu nhiên theo tỉ lệ admin cài đặt
    IF v_winner IS NULL THEN
        -- Tính tổng tỉ lệ (xử lý rate dạng "85%", "0.5%", "0,5%")
        SELECT SUM(CAST(REPLACE(REPLACE(rate::text, '%', ''), ',', '.') AS numeric))
        INTO v_total_rate
        FROM wheel_items
        WHERE wheel_type = p_wheel_type
          AND (quantity IS NULL OR quantity > 0);

        IF v_total_rate IS NULL OR v_total_rate <= 0 THEN
            RETURN jsonb_build_object('success', false, 'message', 'Không có phần thưởng nào khả dụng!');
        END IF;

        -- Quay số ngẫu nhiên
        v_rand := random() * v_total_rate;

        -- Tìm phần thưởng trúng thưởng theo xác suất tích lũy
        FOR v_item IN
            SELECT * FROM wheel_items
            WHERE wheel_type = p_wheel_type
              AND (quantity IS NULL OR quantity > 0)
            ORDER BY id
        LOOP
            v_item_rate := CAST(REPLACE(REPLACE(v_item.rate::text, '%', ''), ',', '.') AS numeric);
            v_cumulative := v_cumulative + v_item_rate;
            IF v_rand <= v_cumulative THEN
                v_winner := v_item;
                EXIT;
            END IF;
        END LOOP;

        -- Fallback: nếu không tìm được, lấy item cuối
        IF v_winner IS NULL THEN
            SELECT * INTO v_winner FROM wheel_items
            WHERE wheel_type = p_wheel_type
              AND (quantity IS NULL OR quantity > 0)
            ORDER BY id DESC LIMIT 1;
        END IF;

        -- Kiểm tra xem có trúng Giày Huyền Thoại tự nhiên không
        IF v_winner.type = 'game_shoes_legendary'
           OR lower(v_winner.name) LIKE '%giày huyền thoại%'
           OR lower(v_winner.name) LIKE '%giày thần tốc%' THEN
            v_is_shoes := true;
        END IF;
    END IF;

    -- 4. Tính số dư mới
    v_new_balance := v_user.balance;
    v_new_spins := COALESCE(v_user.spins, 0);
    v_new_fund := COALESCE(v_user."rentFund", 0);

    -- Trừ chi phí quay
    IF p_wheel_type = 'money' THEN
        v_new_balance := v_new_balance - p_cost;
    ELSE
        v_new_spins := v_new_spins - p_cost;
    END IF;

    -- Phát thưởng tiền/spin/fund trên website
    IF v_winner.type = 'money' THEN
        v_new_balance := v_new_balance + COALESCE(v_winner.value, 0);
    ELSIF v_winner.type = 'spin' THEN
        v_new_spins := v_new_spins + COALESCE(v_winner.value, 0);
    ELSIF v_winner.type = 'fund' THEN
        v_new_fund := v_new_fund + COALESCE(v_winner.value, 0);
    END IF;

    -- Giảm số lượng phần thưởng
    IF v_winner.quantity IS NOT NULL THEN
        UPDATE wheel_items SET quantity = quantity - 1 WHERE id = v_winner.id;
    END IF;

    -- 5. CẬP NHẬT CHỈ SỐ BẢO HIỂM (PITY COUNTER):
    -- Nếu trúng Giày Huyền Thoại (dù tự nhiên hay qua bảo hiểm): reset về 0
    -- Nếu quay vòng quay lượt mà không trúng giày: tăng thêm 1
    IF p_wheel_type = 'spin' THEN
        IF v_is_shoes THEN
            v_new_pity := 0;
        ELSE
            v_new_pity := v_curr_pity + 1;
        END IF;
    ELSE
        v_new_pity := v_curr_pity;
    END IF;

    -- 6. Cập nhật người dùng
    UPDATE users
    SET balance = v_new_balance,
        spins = v_new_spins,
        "rentFund" = v_new_fund,
        shoes_pity = v_new_pity
    WHERE id = khach_id;

    -- 7. Ghi lịch sử giao dịch
    v_now := to_char(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');
    v_tx_id := gen_random_uuid()::text;

    INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost")
    VALUES (
        v_tx_id,
        v_user.name,
        CASE
            WHEN v_winner.type = 'none' THEN 'Chúc may mắn lần sau'
            ELSE 'Trúng phần thưởng: ' || v_winner.name
        END,
        COALESCE(v_winner.value, 0),
        v_now,
        'Thành công',
        'spin_win',
        CASE WHEN v_winner.type = 'spin' THEN true ELSE false END
    );

    -- 8. Trả về kết quả cho Frontend
    RETURN jsonb_build_object(
        'success', true,
        'item_id', v_winner.id,
        'item_name', v_winner.name,
        'item_type', v_winner.type,
        'item_value', v_winner.value,
        'new_balance', v_new_balance,
        'new_spins', v_new_spins,
        'new_fund', v_new_fund,
        'shoes_pity', v_new_pity,
        'is_pity_trigger', v_is_pity_trigger,
        'is_shoes', v_is_shoes
    );
END;
$$;

-- 4. Thêm các phần thưởng mẫu In-Game & Giày Huyền Thoại vào bảng wheel_items cho Vòng Quay Lượt (nếu chưa có)
DO $$
BEGIN
    -- Chèn hoặc cập nhật 6 phần thưởng chuẩn cho Vòng Quay Lượt
    INSERT INTO wheel_items (id, name, type, value, rate, quantity, color, image, wheel_type)
    VALUES 
    ('WHEEL_SHOES_LEGENDARY', 'Giày Thần Tốc (Huyền Thoại)', 'game_shoes_legendary', 1, '0.5%', 999, '#f59e0b', '/game-assets/shoes_huyen_thoai.jpg', 'spin'),
    ('WHEEL_GAME_ATTACKS', '+5 Lượt Đánh Boss', 'game_attacks', 5, '20%', 999, '#3b82f6', NULL, 'spin'),
    ('WHEEL_GAME_CHEST_BOSS', '+3 Hòm Boss', 'game_boss_chests', 3, '25%', 999, '#10b981', '/game-assets/mystery_box_closed.png', 'spin'),
    ('WHEEL_GAME_CHEST_ROYAL', '+1 Hòm Hoàng Kim', 'game_royal_chests', 1, '5%', 999, '#8b5cf6', '/game-assets/royal_chest.png', 'spin'),
    ('WHEEL_GAME_COINS', '+20 Xu Nâng Cấp', 'game_coins', 20, '5%', 999, '#eab308', NULL, 'spin'),
    ('WHEEL_GAME_NONE', 'Chúc may mắn lần sau', 'none', 0, '44.5%', 999, '#475569', NULL, 'spin')
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        value = EXCLUDED.value,
        rate = EXCLUDED.rate,
        color = EXCLUDED.color,
        wheel_type = EXCLUDED.wheel_type;

    -- Đồng bộ ngay các bản ghi cũ nếu đã tồn tại
    UPDATE public.wheel_items
    SET type = 'game_coins',
        name = '+20 Xu Nâng Cấp',
        value = 20,
        rate = '5%'
    WHERE id = 'WHEEL_GAME_COINS' OR lower(name) LIKE '%xu%';

    UPDATE public.wheel_items
    SET rate = '44.5%'
    WHERE id = 'WHEEL_GAME_NONE' OR type = 'none';

    -- Cấp quyền an toàn cho bảng wheel_items
    ALTER TABLE public.wheel_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all on wheel_items" ON public.wheel_items;
    CREATE POLICY "Allow all on wheel_items" ON public.wheel_items FOR ALL TO public USING (true) WITH CHECK (true);
END $$;

-- 5. Cập nhật hàm quay x10 m_spin_wheel_x10 (Quay liền 10 lượt và trả về danh sách 10 món trúng)
CREATE OR REPLACE FUNCTION public.m_spin_wheel_x10(
    khach_id text,
    p_wheel_type text,
    p_cost numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user record;
    v_total_cost numeric;
    v_new_balance numeric;
    v_new_spins numeric;
    v_new_fund numeric;
    v_curr_pity integer := 0;
    v_items_json jsonb := '[]'::jsonb;
    v_total_rate numeric := 0;
    v_rand numeric;
    v_cumulative numeric := 0;
    v_winner record;
    v_item record;
    v_item_rate numeric;
    v_shoes_item record;
    v_is_pity_trigger boolean;
    v_is_shoes boolean;
    v_spin_num integer;
    v_now text;
    v_tx_id text;
    v_item_obj jsonb;
    v_shoes_won_count integer := 0;
BEGIN
    v_total_cost := p_cost * 10;

    SELECT * INTO v_user FROM users WHERE id = khach_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Người dùng không tồn tại!');
    END IF;

    IF p_wheel_type = 'money' THEN
        IF COALESCE(v_user.balance, 0) < v_total_cost THEN
            RETURN jsonb_build_object('success', false, 'message', 'Số dư ví không đủ 10 lần quay!', 'required', v_total_cost, 'current', COALESCE(v_user.balance, 0));
        END IF;
    ELSE
        IF COALESCE(v_user.spins, 0) < v_total_cost THEN
            RETURN jsonb_build_object('success', false, 'message', 'Bạn không có đủ 10 lượt quay!', 'required', v_total_cost, 'current', COALESCE(v_user.spins, 0));
        END IF;
    END IF;

    v_new_balance := COALESCE(v_user.balance, 0);
    v_new_spins := COALESCE(v_user.spins, 0);
    v_new_fund := COALESCE(v_user.rentFund, 0);
    v_curr_pity := COALESCE(v_user.shoes_pity, 0);

    IF p_wheel_type = 'money' THEN
        v_new_balance := v_new_balance - v_total_cost;
    ELSE
        v_new_spins := v_new_spins - v_total_cost;
    END IF;

    FOR v_spin_num IN 1..10 LOOP
        v_winner := NULL;
        v_is_pity_trigger := false;
        v_is_shoes := false;

        IF p_wheel_type = 'spin' AND v_curr_pity >= 120 THEN
            SELECT * INTO v_shoes_item FROM wheel_items
            WHERE wheel_type = 'spin'
              AND (quantity IS NULL OR quantity > 0)
              AND (
                  type = 'game_shoes_legendary'
                  OR lower(name) LIKE '%giày huyền thoại%'
                  OR lower(name) LIKE '%giày thần tốc%'
              )
            ORDER BY id ASC LIMIT 1;

            IF v_shoes_item IS NOT NULL THEN
                v_winner := v_shoes_item;
                v_is_pity_trigger := true;
                v_is_shoes := true;
            END IF;
        END IF;

        IF v_winner IS NULL THEN
            SELECT SUM(CAST(REPLACE(REPLACE(rate::text, '%', ''), ',', '.') AS numeric))
            INTO v_total_rate
            FROM wheel_items
            WHERE wheel_type = p_wheel_type
              AND (quantity IS NULL OR quantity > 0);

            IF v_total_rate IS NULL OR v_total_rate <= 0 THEN
                RETURN jsonb_build_object('success', false, 'message', 'Không có phần thưởng khả dụng!');
            END IF;

            v_rand := random() * v_total_rate;
            v_cumulative := 0;

            FOR v_item IN
                SELECT * FROM wheel_items
                WHERE wheel_type = p_wheel_type
                  AND (quantity IS NULL OR quantity > 0)
                ORDER BY id
            LOOP
                v_item_rate := CAST(REPLACE(REPLACE(v_item.rate::text, '%', ''), ',', '.') AS numeric);
                v_cumulative := v_cumulative + v_item_rate;
                IF v_rand <= v_cumulative THEN
                    v_winner := v_item;
                    EXIT;
                END IF;
            END LOOP;

            IF v_winner IS NULL THEN
                SELECT * INTO v_winner FROM wheel_items
                WHERE wheel_type = p_wheel_type
                  AND (quantity IS NULL OR quantity > 0)
                ORDER BY id LIMIT 1;
            END IF;

            IF v_winner.type = 'game_shoes_legendary'
               OR lower(v_winner.name) LIKE '%giày huyền thoại%'
               OR lower(v_winner.name) LIKE '%giày thần tốc%' THEN
                v_is_shoes := true;
            END IF;
        END IF;

        IF p_wheel_type = 'spin' THEN
            IF v_is_shoes THEN
                v_curr_pity := 0;
                v_shoes_won_count := v_shoes_won_count + 1;
            ELSE
                v_curr_pity := v_curr_pity + 1;
            END IF;
        END IF;

        IF v_winner.quantity IS NOT NULL AND v_winner.quantity > 0 THEN
            UPDATE wheel_items SET quantity = quantity - 1 WHERE id = v_winner.id;
        END IF;

        IF v_winner.type = 'money' THEN
            v_new_balance := v_new_balance + COALESCE(v_winner.value, 0);
        ELSIF v_winner.type = 'spin' THEN
            v_new_spins := v_new_spins + COALESCE(v_winner.value, 0);
        ELSIF v_winner.type = 'fund' THEN
            v_new_fund := v_new_fund + COALESCE(v_winner.value, 0);
        END IF;

        v_item_obj := jsonb_build_object(
            'spin_index', v_spin_num,
            'id', v_winner.id,
            'name', v_winner.name,
            'type', v_winner.type,
            'value', COALESCE(v_winner.value, 0),
            'image', v_winner.image,
            'color', v_winner.color,
            'is_shoes', v_is_shoes,
            'is_pity_trigger', v_is_pity_trigger,
            'pity_at_spin', v_curr_pity
        );
        v_items_json := v_items_json || jsonb_build_array(v_item_obj);
    END LOOP;

    UPDATE users
    SET balance = v_new_balance,
        spins = v_new_spins,
        rentFund = v_new_fund,
        shoes_pity = v_curr_pity
    WHERE id = khach_id;

    v_now := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');
    v_tx_id := 'SPIN10_' || floor(extract(epoch from now()) * 1000)::text || '_' || substr(md5(random()::text), 1, 4);

    INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost")
    VALUES (
        v_tx_id,
        COALESCE(v_user.name, 'Khách hàng'),
        'Quay Vòng Quay x10 (10 Lượt)' || CASE WHEN v_shoes_won_count > 0 THEN ' - 👟 Trúng Giày Huyền Thoại!' ELSE '' END,
        CASE WHEN p_wheel_type = 'money' THEN -v_total_cost ELSE -10 END,
        v_now,
        'Thành công',
        'spin_win',
        (p_wheel_type = 'spin')
    );

    RETURN jsonb_build_object(
        'success', true,
        'items', v_items_json,
        'new_balance', v_new_balance,
        'new_spins', v_new_spins,
        'new_fund', v_new_fund,
        'new_pity', v_curr_pity,
        'shoes_won_count', v_shoes_won_count
    );
END;
$$;

