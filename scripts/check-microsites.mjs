import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const { data, error } = await supabase.from('microsites').select('id, slug, title, blob_path, job_id, created_at, deleted_at').order('created_at', { ascending: false }).limit(5);
if (error) console.log('Error:', error);
else data.forEach((m, i) => {
  const d = m.deleted_at ? ' [DELETED]' : '';
  console.log((i+1) + '. ' + m.slug + ' | job: ' + (m.job_id ? m.job_id.slice(0,8) : 'null') + ' | blob: ' + (m.blob_path || 'null') + d);
});
