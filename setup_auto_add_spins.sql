-- =============================================================================
-- TỰ ĐỘNG CỘNG LƯỢT QUAY WEBSITE KHI MUA VÉ VÒNG QUAY TỪ GAME
-- Hướng dẫn: Copy TOÀN BỘ nội dung file này (từ dòng 1 đến dòng cuối cùng),
-- dán vào mục SQL Editor trên Supabase Dashboard và bấm RUN.
-- =============================================================================

-- 1. Tự động thêm cột linked_game_id vào bảng users nếu chưa có
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linked_game_id text;

-- 2. Tạo hàm RPC cộng lượt quay cho người dùng (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.m_add_game_user_spins(
    p_game_uid text DEFAULT '',
    p_web_user_id text DEFAULT '',
    p_spins int DEFAULT 1,
    p_reason text DEFAULT 'Mua Vé Vòng Quay từ Game Mộng Thiên Huyễn'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_target_user_id text := NULL;
    v_user record;
    v_new_spins int;
    v_tx_id text;
    v_now text;
BEGIN
    IF p_spins <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Số lượt quay không hợp lệ!');
    END IF;

    -- 1. Tìm user_id theo web_user_id (nếu truyền vào)
    IF p_web_user_id IS NOT NULL AND p_web_user_id <> '' THEN
        SELECT id::text INTO v_target_user_id FROM users WHERE id::text = p_web_user_id LIMIT 1;
    END IF;

    -- 2. Nếu chưa tìm được, tìm qua linked_game_id trên bảng users
    IF v_target_user_id IS NULL AND p_game_uid IS NOT NULL AND p_game_uid <> '' THEN
        SELECT id::text INTO v_target_user_id FROM users 
        WHERE lower(ltrim(COALESCE(linked_game_id, ''), '@')) = lower(ltrim(p_game_uid, '@'))
        LIMIT 1;

        -- Tra tiếp theo đơn liên kết OTP đã completed trong game_orders
        IF v_target_user_id IS NULL THEN
            SELECT web_user::text INTO v_target_user_id FROM game_orders 
            WHERE package_id = 'account_link_otp' 
              AND status = 'completed'
              AND (
                  lower(ltrim(user_id, '@')) = lower(ltrim(p_game_uid, '@'))
                  OR lower(ltrim(result->>'game_user_id', '@')) = lower(ltrim(p_game_uid, '@'))
              )
            ORDER BY completed_at DESC LIMIT 1;
        END IF;
    END IF;

    IF v_target_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Chưa tìm thấy tài khoản website liên kết với nhân vật game ' || p_game_uid
        );
    END IF;

    -- 3. Khóa dòng và cập nhật lượt quay cho user
    SELECT * INTO v_user FROM users WHERE id::text = v_target_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Người dùng không tồn tại!');
    END IF;

    v_new_spins := COALESCE(v_user.spins, 0) + p_spins;

    UPDATE users
    SET spins = v_new_spins
    WHERE id::text = v_target_user_id;

    -- 4. Ghi lịch sử giao dịch vào bảng transactions
    BEGIN
        v_tx_id := 'tx_spin_' || floor(extract(epoch from now()) * 1000)::text;
        v_now := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI:SS');
        INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost")
        VALUES (
            v_tx_id,
            v_user.name,
            p_reason || ' (+' || p_spins || ' Lượt Quay)',
            0,
            v_now,
            'completed',
            'spin_ticket_credit',
            false
        );
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    -- 5. Đánh dấu các đơn game_orders pending trước đó thành completed
    BEGIN
        UPDATE game_orders
        SET status = 'completed', completed_at = now()
        WHERE package_id = 'add_spin_tickets'
          AND status = 'pending'
          AND (
              web_user::text = v_target_user_id
              OR lower(ltrim(user_id, '@')) = lower(ltrim(p_game_uid, '@'))
          );
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    RETURN jsonb_build_object(
        'success', true, 
        'user_id', v_target_user_id,
        'user_name', v_user.name,
        'added_spins', p_spins, 
        'new_spins', v_new_spins
    );
END;
$$;
