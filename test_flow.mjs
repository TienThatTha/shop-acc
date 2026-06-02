import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbtsydwyuwfmzszlmgpm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidHN5ZHd5dXdmbXpzemxtZ3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODA0ODUsImV4cCI6MjA5NTc1NjQ4NX0.G_BXuMeGQWpU2DzAYSdZwnldO4GF0-vLqUjdaocN-xM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFlow() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = `User${Date.now()}`;
  const phone = `${Date.now()}`.slice(0, 10);

  console.log('--- SIGNUP ---');
  console.log({ email, password, name, phone });

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (signUpError) {
    console.error('Signup Error:', signUpError);
    return;
  }
  
  console.log('Signup authData user id:', signUpData.user?.id);
  console.log('Signup authData session:', !!signUpData.session);

  // Insert into public.users
  const newUser = {
    id: signUpData.user.id,
    name,
    phone,
    email,
    balance: 0,
    spins: 0,
    role: 'user'
  };
  
  const { error: dbError } = await supabase.from('users').insert([newUser]);
  if (dbError) {
    console.error('DB Insert Error:', dbError);
  } else {
    console.log('DB Insert Success');
  }

  console.log('\n--- LOGIN ---');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error('Login Error:', signInError);
  } else {
    console.log('Login Success! Session:', !!signInData.session);
  }
}

testFlow();
