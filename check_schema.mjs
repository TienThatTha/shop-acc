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
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`);
  const schema = await res.json();
  const usersDef = schema.definitions.users;
  console.log('users schema:', usersDef.properties.id);
  const transactionsDef = schema.definitions.transactions;
  console.log('transactions schema:', transactionsDef.properties.id);
}
run();
