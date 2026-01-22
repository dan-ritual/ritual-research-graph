import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Check all microsites with this slug
const { data, error } = await supabase
  .from('microsites')
  .select('id, slug, title, deleted_at, created_at')
  .ilike('slug', 'state-of-crypto-x-ai-in-asia%')
  .order('created_at', { ascending: true });

console.log('=== Microsites with state-of-crypto slug ===');
if (error) console.log('Error:', error.message);
else {
  data.forEach(m => {
    const status = m.deleted_at ? ' [DELETED at ' + m.deleted_at.split('T')[0] + ']' : ' [ACTIVE]';
    console.log('  ' + m.slug + status);
    console.log('    ID: ' + m.id);
    console.log('');
  });
  console.log('Total:', data.length);
}

// Try to insert a test microsite to see the error
console.log('\n=== Testing insert with conflicting slug ===');
const { error: insertError } = await supabase
  .from('microsites')
  .insert({
    user_id: '46aba85d-2da5-41e9-ad30-d71bd0231039', // admin user
    slug: 'state-of-crypto-x-ai-in-asia',
    title: 'Test Conflict',
    visibility: 'internal',
  });

if (insertError) {
  console.log('Insert failed (expected):', insertError.message);
  console.log('Error code:', insertError.code);
} else {
  console.log('Insert succeeded unexpectedly!');
}
