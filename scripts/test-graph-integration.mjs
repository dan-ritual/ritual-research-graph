import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Simulate getOrCreateSystemUser
async function getOrCreateSystemUser() {
  const systemEmail = 'system@ritual.net';

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', systemEmail)
    .single();

  if (existing) {
    console.log('Found system user:', existing.id);
    return existing.id;
  }

  // Try to create
  const systemId = crypto.randomUUID();
  const { error } = await supabase.from('users').insert({
    id: systemId,
    email: systemEmail,
    name: 'CLI System',
    role: 'admin',
  });

  if (error) {
    console.log('Failed to create system user:', error.message);

    // Try to find admin
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminError) {
      console.log('Failed to find admin user:', adminError.message);
      throw new Error('No admin user found');
    }

    if (adminUser) {
      console.log('Using admin user:', adminUser.id);
      return adminUser.id;
    }

    throw new Error('Failed to get or create system user: ' + error.message);
  }

  console.log('Created system user:', systemId);
  return systemId;
}

// Simulate createGenerationJob
async function createGenerationJob(userId) {
  const { data, error } = await supabase
    .from('generation_jobs')
    .insert({
      user_id: userId,
      workflow_type: 'market-landscape',
      status: 'completed',
      transcript_path: '/tmp/test.md',
      config: { title: 'Test Job', subtitle: 'Test' },
      current_stage: 6,
      stage_progress: 100,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.log('Failed to create job:', error.message);
    throw new Error('Failed to create generation job: ' + error.message);
  }

  console.log('Created job:', data.id);
  return data.id;
}

// Run test
try {
  console.log('Step 1: Get or create system user...');
  const userId = await getOrCreateSystemUser();

  console.log('Step 2: Create generation job...');
  const jobId = await createGenerationJob(userId);

  console.log('Success! Job ID:', jobId);

  // Clean up test job
  await supabase.from('generation_jobs').delete().eq('id', jobId);
  console.log('Cleaned up test job');

} catch (error) {
  console.log('Error:', error.message);
}
