import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split(/\r?\n/);
let supabaseUrl = '';
let supabaseAnonKey = '';
lines.forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].replace(/['"]/g, '').trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseAnonKey = line.split('=')[1].replace(/['"]/g, '').trim();
});

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    // We can't list tables directly with the anon key usually, but we can try to query some common ones
    const tables = ['users', 'accounts', 'transactions', 'deposit_requests', 'rent_requests', 'wheel_items', 'vouchers', 'boosting', 'boosting_requests', 'site_stats', 'messages'];
    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`Table ${table}: Error ${error.message}`);
        } else {
            console.log(`Table ${table}: ${count} records`);
        }
    }
}

check();
