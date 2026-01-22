import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const { data, error } = await supabase.from('generation_jobs').select('id, status, current_stage, error_message, config').order('created_at', { ascending: false }).limit(5);
if (error) console.log('Error:', error);
else data.forEach((j, i) => {
  const id = j.id.slice(0,8);
  const title = j.config?.title || 'no title';
  const err = j.error_message || 'none';
  console.log((i+1) + '. ' + id + '... | ' + j.status + ' | stage ' + j.current_stage + ' | ' + title + ' | err: ' + err);
});
