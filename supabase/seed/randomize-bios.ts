import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const BIO_TEMPLATES = [
  "I am the best {{category}} influencer. Follow me for daily content!",
  "Sharing my love for {{category}} every single day! 🌟",
  "Welcome to my {{category}} page. Let's explore together!",
  "Your #1 source for all things {{category}}. Subscribe!",
  "Living my best life in the {{category}} space. ✨",
  "Daily tips, tricks, and vlogs about {{category}}.",
  "Just a passionate creator loving {{category}}! 💖",
  "Award-winning content creator focusing on {{category}}.",
  "Join my amazing community! All about {{category}}.",
  "Making waves in the {{category}} industry one post at a time."
];

function randomChoice(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  console.log('Fetching influencers...');
  const { data: influencers, error } = await supabase
    .from('influencers')
    .select('id, category')
    .ilike('bio', 'I am the best%'); // only fetch the fake ones with the exact same starting bio

  if (error || !influencers) {
    console.error('Error fetching influencers:', error);
    return;
  }

  console.log(`Found ${influencers.length} fake influencers to randomize bios for.`);

  for (const inf of influencers) {
    const template = randomChoice(BIO_TEMPLATES);
    const newBio = template.replace('{{category}}', inf.category || 'my niche');
    
    await supabase.from('influencers').update({ bio: newBio }).eq('id', inf.id);
  }
  
  console.log('Successfully randomized bios!');
}

run();
