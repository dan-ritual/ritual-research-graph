import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Check jobs
const { data: jobs, error: jobError } = await supabase.from('generation_jobs').select('*').order('created_at', { ascending: false }).limit(5);
if (jobError) console.log('Job Error:', jobError);
else {
  console.log('=== JOBS ===');
  jobs.forEach((j, i) => {
    console.log((i+1) + '. ID: ' + j.id);
    console.log('   Status: ' + j.status + ' | Stage: ' + j.current_stage);
    console.log('   Title: ' + (j.config?.title || 'no title'));
    console.log('   Error: ' + (j.error_message || 'none'));
    console.log('   Microsite ID: ' + (j.microsite_id || 'null'));
    console.log('');
  });
}

// Check if there's a microsite linked to the failed job
const { data: linked, error: linkError } = await supabase.from('microsites').select('id, slug, job_id').eq('job_id', '22eac8ab-a24c-48b8-93f0-5fd7774af0e4');
if (linkError) console.log('Link Error:', linkError);
else {
  console.log('=== MICROSITES LINKED TO FAILED JOB ===');
  console.log(linked.length ? JSON.stringify(linked, null, 2) : 'None found');
}
