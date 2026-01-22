import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const { data, error } = await supabase
  .from('generation_jobs')
  .select('id, status, current_stage, error_message, config, created_at, completed_at')
  .order('created_at', { ascending: false })
  .limit(10);

console.log('All generation jobs:');
data.forEach((j, i) => {
  const title = j.config?.title || 'no title';
  console.log((i+1) + '. ' + j.id.slice(0,8) + '... | ' + j.status + ' | stage ' + j.current_stage);
  console.log('   Title: ' + title);
  console.log('   Created: ' + j.created_at);
  console.log('   Completed: ' + (j.completed_at || 'N/A'));
  console.log('   Error: ' + (j.error_message || 'none'));
  console.log('');
});
