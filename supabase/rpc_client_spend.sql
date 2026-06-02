CREATE OR REPLACE FUNCTION public.rpc_client_spend(
  p_amount numeric,
  p_fund_amount numeric,
  p_tx_data jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_user record;
  v_tx jsonb;
BEGIN
  -- 1. Get the current user
  SELECT * INTO v_user FROM users WHERE id = auth.uid()::text FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Không tìm thấy người dùng!');
  END IF;

  -- Normalize p_tx_data to always be an array
  IF jsonb_typeof(p_tx_data) = 'object' THEN
    p_tx_data := jsonb_build_array(p_tx_data);
  END IF;

  -- 2. Check balance
  IF COALESCE(v_user.balance, 0) < p_amount THEN
    RETURN json_build_object('success', false, 'message', 'Số dư tài khoản chính không đủ!');
  END IF;

  -- 3. Check rentFund
  IF COALESCE(v_user."rentFund", 0) < p_fund_amount THEN
    RETURN json_build_object('success', false, 'message', 'Số dư quỹ cọc không đủ!');
  END IF;

  -- 4. Deduct balances
  UPDATE users 
  SET 
    balance = balance - p_amount,
    "rentFund" = COALESCE("rentFund", 0) - p_fund_amount
  WHERE id = auth.uid()::text;

  -- 5. Insert transactions
  FOR v_tx IN SELECT * FROM jsonb_array_elements(p_tx_data)
  LOOP
    INSERT INTO transactions (
      id, 
      "user", 
      action, 
      amount, 
      date, 
      status, 
      type, 
      "accDetails"
    )
    VALUES (
      COALESCE(v_tx->>'id', gen_random_uuid()::text),
      v_tx->>'user',
      v_tx->>'action',
      (v_tx->>'amount')::numeric,
      v_tx->>'date',
      v_tx->>'status',
      v_tx->>'type',
      v_tx->'accDetails'
    );
  END LOOP;

  RETURN json_build_object('success', true, 'message', 'Thanh toán thành công!');
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$function$;
