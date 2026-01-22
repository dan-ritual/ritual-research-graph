import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Full test of graph integration
async function testGraphIntegration() {
  const title = 'State of Crypto x AI in Asia';
  const slug = slugify(title);

  console.log('Testing graph integration for:', title);
  console.log('Slug:', slug);

  // Step 1: Get user
  const { data: adminUser, error: adminError } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (adminError) {
    console.log('Step 1 FAILED - No admin user:', adminError.message);
    return;
  }
  console.log('Step 1 OK - Admin user:', adminUser.id.slice(0, 8) + '...');

  // Step 2: Create job
  const { data: job, error: jobError } = await supabase
    .from('generation_jobs')
    .insert({
      user_id: adminUser.id,
      workflow_type: 'market-landscape',
      status: 'completed',
      transcript_path: '/tmp/test.md',
      config: { title, subtitle: 'Test' },
      current_stage: 6,
      stage_progress: 100,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (jobError) {
    console.log('Step 2 FAILED - Create job:', jobError.message);
    return;
  }
  console.log('Step 2 OK - Job created:', job.id.slice(0, 8) + '...');

  // Step 3: Check for existing microsite (like graph.ts does)
  const { data: existingMatches } = await supabase
    .from('microsites')
    .select('id, slug, created_at')
    .ilike('title', title)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  const existing = existingMatches?.[0] || null;
  console.log('Step 3 - Existing microsite with title:', existing ? existing.slug : 'none');

  // Step 4: Check for slug conflict
  const { data: slugMatches } = await supabase
    .from('microsites')
    .select('id')
    .eq('slug', slug)
    .is('deleted_at', null)
    .limit(1);

  console.log('Step 4 - Existing microsite with slug (non-deleted):', slugMatches?.length || 0);

  // Step 4b: Check for ANY slug match (including deleted)
  const { data: allSlugMatches } = await supabase
    .from('microsites')
    .select('id, deleted_at')
    .eq('slug', slug);

  console.log('Step 4b - ANY microsite with slug (including deleted):', allSlugMatches?.length || 0);

  // Step 5: Try to create microsite
  let finalSlug = slug;
  if (slugMatches && slugMatches.length > 0) {
    finalSlug = slug + '-' + Date.now().toString(36);
    console.log('Step 5 - Using modified slug:', finalSlug);
  }

  const { data: newMs, error: msError } = await supabase
    .from('microsites')
    .insert({
      job_id: job.id,
      user_id: adminUser.id,
      slug: finalSlug,
      title: title,
      subtitle: 'Test Subtitle',
      thesis: 'Test thesis',
      config: {},
      entity_count: 0,
      visibility: 'internal',
    })
    .select('id')
    .single();

  if (msError) {
    console.log('Step 5 FAILED - Create microsite:', msError.message);
    console.log('Error code:', msError.code);
    // Clean up job
    await supabase.from('generation_jobs').delete().eq('id', job.id);
    return;
  }
  console.log('Step 5 OK - Microsite created:', newMs.id.slice(0, 8) + '...');

  // Clean up
  console.log('\nCleaning up test data...');
  await supabase.from('microsites').delete().eq('id', newMs.id);
  await supabase.from('generation_jobs').delete().eq('id', job.id);
  console.log('Done!');
}

testGraphIntegration();
