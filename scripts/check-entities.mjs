import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Check entities
const { data: entities, error: entityError } = await supabase
  .from('entities')
  .select('slug, canonical_name, type')
  .ilike('canonical_name', '%china%')
  .or('canonical_name.ilike.%deepseek%,canonical_name.ilike.%bytedance%');

console.log('=== Entities matching China/Deepseek/ByteDance ===');
if (entityError) console.log('Error:', entityError.message);
else {
  entities.forEach(e => console.log('  ' + e.type + ': ' + e.canonical_name + ' (' + e.slug + ')'));
  console.log('Total:', entities.length);
}

// Check for any duplicate slugs in entities
const { data: dupes, error: dupeError } = await supabase
  .rpc('check_entity_dupes');

if (dupeError) {
  // RPC doesn't exist, check manually
  const { data: allSlugs } = await supabase.from('entities').select('slug');
  const slugCounts = {};
  allSlugs?.forEach(e => slugCounts[e.slug] = (slugCounts[e.slug] || 0) + 1);
  const duplicates = Object.entries(slugCounts).filter(([_, count]) => count > 1);
  console.log('\n=== Duplicate Entity Slugs ===');
  console.log(duplicates.length ? duplicates : 'None');
}
