import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { embed } from '../../lib/embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function run() {
  const { data: influencers, error } = await supabase
    .from('influencers')
    .select('id, bio, category')
    .is('embedding', null);

  if (error || !influencers) {
    console.error('Error fetching influencers:', error);
    return;
  }

  console.log(`Found ${influencers.length} influencers to embed.`);

  for (const inf of influencers) {
    const text = `${inf.category || ''} ${inf.bio || ''}`.trim();
    if (!text) continue;

    try {
      const embedding = await embed(text);
      await supabase.from('influencers').update({ embedding }).eq('id', inf.id);
      console.log(`Embedded influencer ${inf.id}`);
    } catch (e: any) {
      console.error(`Failed to embed influencer ${inf.id}:`, e.message);
    }
  }
}
run();
