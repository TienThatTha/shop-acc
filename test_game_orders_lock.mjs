import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k) env[k] = v.join('=').replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function runNegativeTests() {
  console.log('🔒 Bắt đầu chạy test bảo mật RLS game_orders (N1 - N4)...');
  let allPass = true;

  // N1: Cố tình insert trực tiếp pack_8 với status pending (client giả mạo)
  const fakeOrderId = `TEST_HACK_${Date.now()}`;
  const { data: n1Data, error: n1Err } = await supabase.from('game_orders').insert([{
    id: fakeOrderId,
    user_id: 'test_hacker',
    nickname: 'Hacker',
    package_id: 'pack_8',
    price: 1,
    rewards: {},
    status: 'pending'
  }]);

  if (n1Err) {
    console.log('  ✅ N1 PASS: Client trực tiếp insert pack_* bị RLS chặn thành công:', n1Err.message);
  } else {
    console.log('  ⚠️ N1 CHƯA KHÓA: SQL 2 (secure_game_orders_rls.sql) chưa được nạp lên Supabase Dashboard.');
    allPass = false;
  }

  // Lấy 1 order có sẵn để test update & delete
  const { data: existingRows } = await supabase.from('game_orders').select('id, status').limit(1);
  const sampleId = existingRows?.[0]?.id;

  // N2: Cố tình UPDATE đơn
  if (sampleId) {
    const { data: n2Data, error: n2Err } = await supabase.from('game_orders')
      .update({ status: 'pending' })
      .eq('id', sampleId)
      .select();
    if (n2Err || !n2Data || n2Data.length === 0) {
      console.log('  ✅ N2 PASS: Client không thể UPDATE game_orders (Bị chặn hoặc 0 dòng bị sửa)');
    } else {
      console.log('  ⚠️ N2 CHƯA KHÓA: Client vẫn update được đơn.');
      allPass = false;
    }

    // N3: Cố tình DELETE đơn
    const { data: n3Data, error: n3Err } = await supabase.from('game_orders')
      .delete()
      .eq('id', sampleId)
      .select();
    if (n3Err || !n3Data || n3Data.length === 0) {
      console.log('  ✅ N3 PASS: Client không thể DELETE game_orders (Bị chặn hoặc 0 dòng bị xóa)');
    } else {
      console.log('  ⚠️ N3 CHƯA KHÓA: Client vẫn xóa được đơn.');
      allPass = false;
    }
  } else {
    console.log('  ℹ️ N2/N3 Bỏ qua do bảng game_orders chưa có đơn mẫu');
  }

  // N4: Gọi rpc_buy_boss_package khi chưa đăng nhập
  const { data: n4Data, error: n4Err } = await supabase.rpc('rpc_buy_boss_package', {
    p_package_id: 'pack_1',
    p_target_uid: 'test',
    p_nickname: 'test'
  });

  if (n4Err || n4Data?.success === false) {
    console.log('  ✅ N4 PASS: RPC từ chối client unauthenticated thành công:', n4Err?.message || n4Data?.message);
  } else {
    console.log('  ❌ N4 FAIL: RPC cho phép gọi trái phép');
    allPass = false;
  }

  return allPass;
}

runNegativeTests().catch(console.error);

