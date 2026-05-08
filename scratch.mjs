import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const content = fs.readFileSync('./src/supabaseClient.js', 'utf8');
const urlMatch = content.match(/supabaseUrl\s*=\s*['"`]?([^'"`]+)['"`]?/);
const keyMatch = content.match(/supabaseAnonKey\s*=\s*['"`]?([^'"`]+)['"`]?/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

supabase.from('transactions').select('*').order('id', {ascending: false}).limit(20)
  .then(res => console.log(JSON.stringify(res.data, null, 2)))
  .catch(err => console.error(err));
