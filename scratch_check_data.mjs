import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split(/\r?\n/);

let supabaseUrl = '';
let supabaseAnonKey = '';

lines.forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].replace(/['"]/g, '').trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
        supabaseAnonKey = line.split('=')[1].replace(/['"]/g, '').trim();
    }
});

console.log("URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { count, error } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
    if (error) {
        console.error("Error fetching count:", error);
        return;
    }
    console.log("Total transactions:", count);
    
    if (count > 0) {
        const { data, error: dataError } = await supabase.from('transactions').select('*').order('id', {ascending: false}).limit(20);
        if (dataError) console.error(dataError);
        console.log("Sample records types:", [...new Set(data.map(d => d.type))]);
        console.log("Sample records:", JSON.stringify(data, null, 2));
    }
}

check();
