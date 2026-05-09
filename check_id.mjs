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

async function run() {
  const { data } = await supabase.from('users').select('id').limit(1);
  console.log('ID:', data);
  
  const { data: cols, error: err2 } = await supabase.rpc('get_schema_info'); // Just testing if we can get schema, unlikely without psql
}
run();
