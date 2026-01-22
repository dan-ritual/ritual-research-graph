import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Hard-delete the soft-deleted Asia microsites to free up the slug
const { data, error } = await supabase
  .from('microsites')
  .delete()
  .ilike('slug', 'state-of-crypto-x-ai-in-asia%')
  .not('deleted_at', 'is', null)
  .select();

if (error) {
  console.log('Error:', error.message);
} else {
  console.log('Hard-deleted', data.length, 'soft-deleted microsites:');
  data.forEach(m => console.log('  ' + m.slug));
}

// Verify the slug is now available
const { data: remaining } = await supabase
  .from('microsites')
  .select('slug')
  .ilike('slug', 'state-of-crypto-x-ai-in-asia%');

console.log('\nRemaining microsites with this slug:', remaining?.length || 0);
