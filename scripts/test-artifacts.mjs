import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Get admin user
const { data: adminUser } = await supabase
  .from('users')
  .select('id')
  .eq('role', 'admin')
  .limit(1)
  .single();

// Create test job
const { data: job } = await supabase
  .from('generation_jobs')
  .insert({
    user_id: adminUser.id,
    workflow_type: 'market-landscape',
    status: 'completed',
    transcript_path: '/tmp/test.md',
    config: { title: 'Test' },
    current_stage: 6,
  })
  .select('id')
  .single();

console.log('Created job:', job.id);

// Try to insert artifacts like graph.ts does
const artifacts = [
  { job_id: job.id, type: 'cleaned_transcript', file_path: '/tmp/test1.md', file_size: 100 },
  { job_id: job.id, type: 'intelligence_brief', file_path: '/tmp/test2.md', file_size: 200 },
  { job_id: job.id, type: 'strategic_questions', file_path: '/tmp/test3.md', file_size: 300 },
  { job_id: job.id, type: 'site_config', file_path: '/tmp/test4.json', file_size: 400 },
];

console.log('Inserting', artifacts.length, 'artifacts...');
const { error } = await supabase.from('artifacts').insert(artifacts);

if (error) {
  console.log('FAILED:', error.message);
  console.log('Code:', error.code);
} else {
  console.log('OK - Artifacts inserted');
}

// Clean up
await supabase.from('artifacts').delete().eq('job_id', job.id);
await supabase.from('generation_jobs').delete().eq('id', job.id);
console.log('Cleaned up');
