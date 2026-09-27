-- =============================================================================
-- SQL RPC: QUAY VÒNG QUAY X10 (10 LƯỢT LIÊN TIẾP) & SỔ 10 MÓN TRÚNG THƯỞNG
-- Tích hợp bảo hiểm Giày Huyền Thoại (Pity) qua từng lượt quay trong 10 lượt
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào SQL Editor trên Supabase và bấm RUN
-- =============================================================================

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

    -- 1. Lấy user và lock row chống race condition
    SELECT * INTO v_user FROM users WHERE id = khach_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Người dùng không tồn tại!');
    END IF;

    -- 2. Kiểm tra số dư hoặc lượt quay
    IF p_wheel_type = 'money' THEN
        IF COALESCE(v_user.balance, 0) < v_total_cost THEN
            RETURN jsonb_build_object(
                'success', false, 
                'message', 'Số dư ví không đủ 10 lần quay!',
                'required', v_total_cost,
                'current', COALESCE(v_user.balance, 0)
            );
        END IF;
    ELSE
        IF COALESCE(v_user.spins, 0) < v_total_cost THEN
            RETURN jsonb_build_object(
                'success', false, 
                'message', 'Bạn không có đủ 10 lượt quay!',
                'required', v_total_cost,
                'current', COALESCE(v_user.spins, 0)
            );
        END IF;
    END IF;

    v_new_balance := COALESCE(v_user.balance, 0);
    v_new_spins := COALESCE(v_user.spins, 0);
    v_new_fund := COALESCE(v_user.rentFund, 0);
    v_curr_pity := COALESCE(v_user.shoes_pity, 0);

    -- Khấu trừ chi phí 10 lượt quay
    IF p_wheel_type = 'money' THEN
        v_new_balance := v_new_balance - v_total_cost;
    ELSE
        v_new_spins := v_new_spins - v_total_cost;
    END IF;

    -- 3. Tiến hành quay tuần tự 10 lượt và tính bảo hiểm chuẩn xác từng lượt
    FOR v_spin_num IN 1..10 LOOP
        v_winner := NULL;
        v_is_pity_trigger := false;
        v_is_shoes := false;

        -- Kiểm tra bảo hiểm 120 lần:
        -- Nếu quay bằng lượt và tích lũy >= 120 -> Lượt này 100% ra Giày Huyền Thoại!
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

        -- Nếu chưa nổ bảo hiểm, quay ngẫu nhiên theo tỷ lệ của các vật phẩm
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

            -- Dự phòng nếu không khớp vòng lặp
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

        -- Cập nhật bảo hiểm Pity:
        -- Nếu trúng Giày Huyền Thoại -> Reset bảo hiểm về 0
        -- Nếu không trúng Giày -> Cộng thêm 1 vào bảo hiểm
        IF p_wheel_type = 'spin' THEN
            IF v_is_shoes THEN
                v_curr_pity := 0;
                v_shoes_won_count := v_shoes_won_count + 1;
            ELSE
                v_curr_pity := v_curr_pity + 1;
            END IF;
        END IF;

        -- Trừ số lượng kho phần thưởng nếu có giới hạn
        IF v_winner.quantity IS NOT NULL AND v_winner.quantity > 0 THEN
            UPDATE wheel_items SET quantity = quantity - 1 WHERE id = v_winner.id;
        END IF;

        -- Cộng thưởng trực tiếp vào ví người dùng nếu là tiền, lượt, quỹ thuê
        IF v_winner.type = 'money' THEN
            v_new_balance := v_new_balance + COALESCE(v_winner.value, 0);
        ELSIF v_winner.type = 'spin' THEN
            v_new_spins := v_new_spins + COALESCE(v_winner.value, 0);
        ELSIF v_winner.type = 'fund' THEN
            v_new_fund := v_new_fund + COALESCE(v_winner.value, 0);
        END IF;

        -- Lưu kết quả của lượt quay này vào mảng
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

    -- Cập nhật số dư và mức bảo hiểm cuối cùng của người dùng
    UPDATE users
    SET balance = v_new_balance,
        spins = v_new_spins,
        rentFund = v_new_fund,
        shoes_pity = v_curr_pity
    WHERE id = khach_id;

    -- Tạo lịch sử giao dịch tổng hợp 10 lượt quay
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
