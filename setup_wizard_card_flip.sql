-- =============================================================================
-- SỰ KIỆN LẬT THẺ BÀI PHÙ THỦY - BẢO HIỂM NÓN HUYỀN THOẠI 120 LƯỢT
-- =============================================================================

-- 1. Thêm cột wizard_pity vào bảng users (nếu chưa có)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wizard_pity integer DEFAULT 0;

-- 2. Đảm bảo bảng game_players có cột hat để trang bị Nón Huyền Thoại
ALTER TABLE public.game_players ADD COLUMN IF NOT EXISTS hat jsonb DEFAULT '{}'::jsonb;

-- 3. Hàm Lật 1 Thẻ Phù Thủy (m_flip_wizard_card)
CREATE OR REPLACE FUNCTION public.m_flip_wizard_card(
    khach_id text,
    p_cost numeric DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user record;
    v_curr_pity integer := 0;
    v_new_pity integer := 0;
    v_new_spins numeric := 0;
    v_winner jsonb;
    v_is_pity_trigger boolean := false;
    v_is_hat boolean := false;
    v_cfg record;
    v_items jsonb := '[]'::jsonb;
    v_item jsonb;
    v_total_rate numeric := 0;
    v_rand numeric;
    v_cumulative numeric := 0;
    v_rate_num numeric;
    v_now text;
    v_tx_id text;
BEGIN
    -- 1. Khóa dòng user để kiểm tra số dư lượt quay (chống race condition)
    SELECT * INTO v_user FROM users WHERE id = khach_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Người dùng không tồn tại!');
    END IF;

    IF COALESCE(v_user.spins, 0) < p_cost THEN
        RETURN jsonb_build_object('success', false, 'message', 'Bạn không có đủ Thẻ may mắn để lật bài!');
    END IF;

    -- Đọc điểm bảo hiểm hiện tại
    v_curr_pity := COALESCE(v_user.wizard_pity, 0);

    -- 2. Đọc cấu hình sự kiện từ site_config
    SELECT value INTO v_items FROM site_config WHERE id = 'wizard_card_items';
    IF v_items IS NULL OR jsonb_array_length(v_items) = 0 THEN
        -- Fallback danh sách mặc định nếu chưa cấu hình
        v_items := '[
            {"id": "WIZARD_HAT_LEGENDARY", "name": "Nón Huyền Thoại", "type": "game_hat_legendary", "value": 1, "rate": "0.5%", "color": "#ffd700", "image": "/game-assets/hat_huyen_thoai.png", "is_special": true},
            {"id": "WIZARD_CRYSTAL", "name": "+10 Viên Tinh Thể", "type": "game_ring_crystal", "value": 10, "rate": "10%", "color": "#ec4899", "image": "/game-assets/ring_crystal.png"},
            {"id": "WIZARD_STONE", "name": "+5 Đá Tinh Hoa", "type": "game_essence_stone", "value": 5, "rate": "10%", "color": "#a855f7", "image": "/game-assets/da_tinh_hoa.png"},
            {"id": "WIZARD_ATK", "name": "+50.000 Lượt Đánh Boss", "type": "game_attacks", "value": 50000, "rate": "15%", "color": "#3b82f6", "image": "/game-assets/item_attack_turn.png"},
            {"id": "WIZARD_CHEST_B", "name": "+3 Hòm Boss", "type": "game_boss_chests", "value": 3, "rate": "20%", "color": "#10b981", "image": "/game-assets/mystery_box_closed.png"},
            {"id": "WIZARD_CHEST_R", "name": "+1 Hòm Hoàng Kim", "type": "game_royal_chests", "value": 1, "rate": "5%", "color": "#8b5cf6", "image": "/game-assets/royal_chest.png"},
            {"id": "WIZARD_COINS", "name": "+50 Xu Nâng Cấp", "type": "game_coins", "value": 50, "rate": "10%", "color": "#eab308", "image": "/game-assets/gold_coin.png"},
            {"id": "WIZARD_NONE", "name": "Chúc may mắn lần sau", "type": "none", "value": 0, "rate": "29.5%", "color": "#64748b", "image": null}
        ]'::jsonb;
    END IF;

    -- 3. KIỂM TRA BẢO HIỂM 120 LƯỢT:
    -- Lượt thứ 120 (v_curr_pity + 1 = 120 hoặc v_curr_pity >= 119) -> 100% nổ Nón Huyền Thoại
    IF (v_curr_pity + 1) >= 120 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
        LOOP
            IF (v_item->>'is_special')::boolean = true 
               OR v_item->>'type' = 'game_hat_legendary'
               OR lower(v_item->>'name') LIKE '%nón huyền thoại%'
               OR lower(v_item->>'name') LIKE '%mũ huyền thoại%' THEN
                v_winner := v_item;
                v_is_pity_trigger := true;
                v_is_hat := true;
                EXIT;
            END IF;
        END LOOP;
    END IF;

    -- 4. Nếu chưa chạm mốc bảo hiểm 120: Quay ngẫu nhiên theo tỉ lệ %
    IF v_winner IS NULL THEN
        -- Tính tổng tỉ lệ
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
        LOOP
            v_rate_num := CAST(REPLACE(REPLACE(COALESCE(v_item->>'rate', '0%'), '%', ''), ',', '.') AS numeric);
            v_total_rate := v_total_rate + v_rate_num;
        END LOOP;

        IF v_total_rate <= 0 THEN v_total_rate := 100; END IF;

        v_rand := random() * v_total_rate;
        v_cumulative := 0;

        FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
        LOOP
            v_rate_num := CAST(REPLACE(REPLACE(COALESCE(v_item->>'rate', '0%'), '%', ''), ',', '.') AS numeric);
            v_cumulative := v_cumulative + v_rate_num;
            IF v_rand <= v_cumulative THEN
                v_winner := v_item;
                EXIT;
            END IF;
        END LOOP;

        IF v_winner IS NULL THEN
            v_winner := v_items->0;
        END IF;

        IF (v_winner->>'is_special')::boolean = true 
           OR v_winner->>'type' = 'game_hat_legendary'
           OR lower(v_winner->>'name') LIKE '%nón huyền thoại%' THEN
            v_is_hat := true;
        END IF;
    END IF;

    -- 5. Cập nhật lượt chơi và điểm bảo hiểm
    v_new_spins := v_user.spins - p_cost;
    IF v_is_hat THEN
        v_new_pity := 0; -- Nổ giải đặc biệt -> Reset về 0
    ELSE
        v_new_pity := v_curr_pity + 1; -- Tích lũy tiếp
    END IF;

    UPDATE users
    SET spins = v_new_spins,
        wizard_pity = v_new_pity
    WHERE id = khach_id;

    -- 6. Ghi nhận giao dịch
    v_now := to_char(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');
    v_tx_id := 'WIZ_' || floor(extract(epoch from NOW()) * 1000)::text || '_' || substr(md5(random()::text), 1, 4);

    INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost")
    VALUES (
        v_tx_id,
        COALESCE(v_user.name, 'Khách hàng'),
        'Lật Thẻ Phù Thủy: ' || (v_winner->>'name') || CASE WHEN v_is_pity_trigger THEN ' (Nổ Bảo Hiểm 120/120!)' ELSE '' END,
        -p_cost,
        v_now,
        'Thành công',
        'wizard_card_win',
        true
    );

    RETURN jsonb_build_object(
        'success', true,
        'item', v_winner,
        'new_spins', v_new_spins,
        'new_pity', v_new_pity,
        'is_pity_trigger', v_is_pity_trigger,
        'is_hat', v_is_hat
    );
END;
$$;

-- 4. Hàm Lật 10 Thẻ Phù Thủy (m_flip_wizard_card_x10)
CREATE OR REPLACE FUNCTION public.m_flip_wizard_card_x10(
    khach_id text,
    p_cost numeric DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user record;
    v_curr_pity integer := 0;
    v_new_spins numeric := 0;
    v_winner jsonb;
    v_is_pity_trigger boolean;
    v_is_hat boolean;
    v_items jsonb := '[]'::jsonb;
    v_item jsonb;
    v_total_rate numeric := 0;
    v_rand numeric;
    v_cumulative numeric := 0;
    v_rate_num numeric;
    v_results jsonb := '[]'::jsonb;
    v_spin_i integer;
    v_hat_won_count integer := 0;
    v_now text;
    v_tx_id text;
BEGIN
    SELECT * INTO v_user FROM users WHERE id = khach_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Người dùng không tồn tại!');
    END IF;

    IF COALESCE(v_user.spins, 0) < p_cost THEN
        RETURN jsonb_build_object('success', false, 'message', 'Bạn không có đủ 10 Thẻ may mắn!');
    END IF;

    v_curr_pity := COALESCE(v_user.wizard_pity, 0);

    SELECT value INTO v_items FROM site_config WHERE id = 'wizard_card_items';
    IF v_items IS NULL OR jsonb_array_length(v_items) = 0 THEN
        v_items := '[
            {"id": "WIZARD_HAT_LEGENDARY", "name": "Nón Huyền Thoại", "type": "game_hat_legendary", "value": 1, "rate": "0.5%", "color": "#ffd700", "image": "/game-assets/hat_huyen_thoai.png", "is_special": true},
            {"id": "WIZARD_CRYSTAL", "name": "+10 Viên Tinh Thể", "type": "game_ring_crystal", "value": 10, "rate": "10%", "color": "#ec4899", "image": "/game-assets/ring_crystal.png"},
            {"id": "WIZARD_STONE", "name": "+5 Đá Tinh Hoa", "type": "game_essence_stone", "value": 5, "rate": "10%", "color": "#a855f7", "image": "/game-assets/da_tinh_hoa.png"},
            {"id": "WIZARD_ATK", "name": "+50.000 Lượt Đánh Boss", "type": "game_attacks", "value": 50000, "rate": "15%", "color": "#3b82f6", "image": "/game-assets/item_attack_turn.png"},
            {"id": "WIZARD_CHEST_B", "name": "+3 Hòm Boss", "type": "game_boss_chests", "value": 3, "rate": "20%", "color": "#10b981", "image": "/game-assets/mystery_box_closed.png"},
            {"id": "WIZARD_CHEST_R", "name": "+1 Hòm Hoàng Kim", "type": "game_royal_chests", "value": 1, "rate": "5%", "color": "#8b5cf6", "image": "/game-assets/royal_chest.png"},
            {"id": "WIZARD_COINS", "name": "+50 Xu Nâng Cấp", "type": "game_coins", "value": 50, "rate": "10%", "color": "#eab308", "image": "/game-assets/gold_coin.png"},
            {"id": "WIZARD_NONE", "name": "Chúc may mắn lần sau", "type": "none", "value": 0, "rate": "29.5%", "color": "#64748b", "image": null}
        ]'::jsonb;
    END IF;

    -- Tính tổng tỉ lệ
    FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
    LOOP
        v_rate_num := CAST(REPLACE(REPLACE(COALESCE(v_item->>'rate', '0%'), '%', ''), ',', '.') AS numeric);
        v_total_rate := v_total_rate + v_rate_num;
    END LOOP;
    IF v_total_rate <= 0 THEN v_total_rate := 100; END IF;

    -- Vòng lặp tuần tự từng thẻ từ 1 đến 10
    FOR v_spin_i IN 1..10 LOOP
        v_winner := NULL;
        v_is_pity_trigger := false;
        v_is_hat := false;

        -- Nếu thẻ này chạm đúng mốc bảo hiểm 120
        IF (v_curr_pity + 1) >= 120 THEN
            FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
            LOOP
                IF (v_item->>'is_special')::boolean = true 
                   OR v_item->>'type' = 'game_hat_legendary'
                   OR lower(v_item->>'name') LIKE '%nón huyền thoại%' THEN
                    v_winner := v_item;
                    v_is_pity_trigger := true;
                    v_is_hat := true;
                    EXIT;
                END IF;
            END LOOP;
        END IF;

        IF v_winner IS NULL THEN
            v_rand := random() * v_total_rate;
            v_cumulative := 0;

            FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
            LOOP
                v_rate_num := CAST(REPLACE(REPLACE(COALESCE(v_item->>'rate', '0%'), '%', ''), ',', '.') AS numeric);
                v_cumulative := v_cumulative + v_rate_num;
                IF v_rand <= v_cumulative THEN
                    v_winner := v_item;
                    EXIT;
                END IF;
            END LOOP;

            IF v_winner IS NULL THEN v_winner := v_items->0; END IF;

            IF (v_winner->>'is_special')::boolean = true 
               OR v_winner->>'type' = 'game_hat_legendary'
               OR lower(v_winner->>'name') LIKE '%nón huyền thoại%' THEN
                v_is_hat := true;
            END IF;
        END IF;

        -- Cập nhật pity tuần tự
        IF v_is_hat THEN
            v_curr_pity := 0;
            v_hat_won_count := v_hat_won_count + 1;
        ELSE
            v_curr_pity := v_curr_pity + 1;
        END IF;

        v_results := v_results || jsonb_build_array(jsonb_build_object(
            'card_index', v_spin_i,
            'id', v_winner->>'id',
            'name', v_winner->>'name',
            'type', v_winner->>'type',
            'value', COALESCE((v_winner->>'value')::numeric, 0),
            'image', v_winner->>'image',
            'color', v_winner->>'color',
            'is_hat', v_is_hat,
            'is_pity_trigger', v_is_pity_trigger,
            'pity_at_card', v_curr_pity
        ));
    END LOOP;

    v_new_spins := v_user.spins - p_cost;

    UPDATE users
    SET spins = v_new_spins,
        wizard_pity = v_curr_pity
    WHERE id = khach_id;

    v_now := to_char(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');
    v_tx_id := 'WIZ10_' || floor(extract(epoch from NOW()) * 1000)::text || '_' || substr(md5(random()::text), 1, 4);

    INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost")
    VALUES (
        v_tx_id,
        COALESCE(v_user.name, 'Khách hàng'),
        'Lật Thẻ Phù Thủy x10 (10 Thẻ)' || CASE WHEN v_hat_won_count > 0 THEN ' - 🧙 Trúng Nón Huyền Thoại!' ELSE '' END,
        -p_cost,
        v_now,
        'Thành công',
        'wizard_card_win',
        true
    );

    RETURN jsonb_build_object(
        'success', true,
        'items', v_results,
        'new_spins', v_new_spins,
        'new_pity', v_curr_pity,
        'hat_won_count', v_hat_won_count
    );
END;
$$;
