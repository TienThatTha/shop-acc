import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseAnonKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data, error } = await supabase.from('transactions').select('type, action').limit(200);
    if (error) {
        console.error(error);
        return;
    }
    const types = [...new Set(data.map(d => d.type))];
    console.log("Existing types:", types);
    const spinRelated = data.filter(d => d.action.toLowerCase().includes('vòng quay') || d.action.toLowerCase().includes('trúng'));
    console.log("Spin related records found:", spinRelated.length);
    console.log("Unique types for spin related records:", [...new Set(spinRelated.map(d => d.type))]);
    console.log("Spin related records sample:", spinRelated.slice(0, 5));
}

check();
