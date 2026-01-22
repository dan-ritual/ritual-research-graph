import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Check for system user
const { data: systemUser, error } = await supabase
  .from('users')
  .select('id, email, role')
  .eq('email', 'system@ritual.net')
  .single();

if (error) {
  console.log('No system user found:', error.message);

  // Check if there's any admin user
  const { data: admins } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('role', 'admin');
  console.log('\nAdmin users:', admins?.length || 0);
  admins?.forEach(a => console.log('  ' + a.email + ' (' + a.id.slice(0,8) + '...)'));
} else {
  console.log('System user found:');
  console.log('  ID:', systemUser.id);
  console.log('  Email:', systemUser.email);
  console.log('  Role:', systemUser.role);
}

// Check all users
const { data: allUsers } = await supabase.from('users').select('id, email, role').limit(10);
console.log('\nAll users:');
allUsers?.forEach(u => console.log('  ' + u.role + ': ' + u.email));
