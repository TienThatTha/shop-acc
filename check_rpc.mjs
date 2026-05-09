import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split(/\r?\n/);

let supabaseUrl = '';
let supabaseAnonKey = '';

lines.forEach(line => {
    const urlMatch = line.match(/VITE_SUPABASE_URL\s*=\s*['"]?([^'"]+)['"]?/);
    if (urlMatch) supabaseUrl = urlMatch[1];
    
    const keyMatch = line.match(/VITE_SUPABASE_ANON_KEY\s*=\s*['"]?([^'"]+)['"]?/);
    if (keyMatch) supabaseAnonKey = keyMatch[1];
});

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  // Try to call the RPC function with dummy data just to see the error message directly
  const { data, error } = await supabase.rpc('rpc_client_spend', {
    p_amount: 0,
    p_fund_amount: 0,
    p_tx_data: {}
  });
  console.log("RPC call result:");
  console.log({data, error});
}
check();
