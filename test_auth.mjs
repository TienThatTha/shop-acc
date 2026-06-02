import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbtsydwyuwfmzszlmgpm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidHN5ZHd5dXdmbXpzemxtZ3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODA0ODUsImV4cCI6MjA5NTc1NjQ4NX0.G_BXuMeGQWpU2DzAYSdZwnldO4GF0-vLqUjdaocN-xM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'Password123!';

  console.log('Signing up with', email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    console.error('Sign up error:', signUpError);
    return;
  }
  
  console.log('Sign up success, session:', signUpData.session);

  console.log('Logging in with', email);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error('Sign in error object:', JSON.stringify(signInError, null, 2));
    console.error('Sign in error message:', signInError.message);
  } else {
    console.log('Sign in success');
  }
}

test();
