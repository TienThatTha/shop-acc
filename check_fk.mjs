import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbtsydwyuwfmzszlmgpm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidHN5ZHd5dXdmbXpzemxtZ3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODA0ODUsImV4cCI6MjA5NTc1NjQ4NX0.G_BXuMeGQWpU2DzAYSdZwnldO4GF0-vLqUjdaocN-xM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFK() {
  console.log('Checking foreign keys for comments table...');
  const { data, error } = await supabase
    .from('comments')
    .select('*, users(name)')
    .limit(1);

  if (error) {
    console.error('Error fetching comments with users:', error);
  } else {
    console.log('Successfully fetched comments with users:', data);
  }
}

checkFK();
