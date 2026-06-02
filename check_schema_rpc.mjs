import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbtsydwyuwfmzszlmgpm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidHN5ZHd5dXdmbXpzemxtZ3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODA0ODUsImV4cCI6MjA5NTc1NjQ4NX0.G_BXuMeGQWpU2DzAYSdZwnldO4GF0-vLqUjdaocN-xM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('execute_sql', { query: `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'user_id';
  `});
  if (error) {
    console.log("Cannot run execute_sql rpc, probably doesn't exist");
  } else {
    console.log(data);
  }
}
checkSchema();
