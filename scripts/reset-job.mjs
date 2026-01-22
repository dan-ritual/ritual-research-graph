import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const jobId = '22eac8ab-a24c-48b8-93f0-5fd7774af0e4';

const { data, error } = await supabase
  .from('generation_jobs')
  .update({
    status: 'pending',
    current_stage: 0,
    stage_progress: 0,
    error_message: null,
    started_at: null,
  })
  .eq('id', jobId)
  .select();

if (error) {
  console.log('Error:', error.message);
} else {
  console.log('Job reset to pending:', data[0]?.status);
}
