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

const CATEGORIES = [
  "Personal Goods & General Merchandise Stores",
  "Creators & Celebrities",
  "Beauty & Fashion",
  "Gaming & Tech",
  "Fitness & Health",
  "Food & Drink",
  "Travel & Lifestyle",
  "Business & Finance",
  "Art & Entertainment",
  "Education"
];

const ADJECTIVES = ['Cool', 'Super', 'Elite', 'Pro', 'Happy', 'Mega', 'Hyper', 'Swift', 'Bright', 'Golden', 'Daily', 'Fit', 'Glam', 'Tech', 'Foodie'];
const NOUNS = ['Ninja', 'Guru', 'Master', 'Star', 'King', 'Queen', 'Boss', 'Expert', 'Fan', 'Guy', 'Gal', 'Life', 'Style', 'Vibes', 'Hacks'];

function randomChoice(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomName() {
  return `${randomChoice(ADJECTIVES)} ${randomChoice(NOUNS)} ${Math.floor(Math.random() * 100)}`;
}

function generateFakeInfluencers(count: number, category: string) {
  const influencers = [];
  for (let i = 0; i < count; i++) {
    const name = generateRandomName();
    const username = name.toLowerCase().replace(/ /g, '_') + '_' + Math.floor(Math.random() * 1000);
    const followers = Math.floor(Math.random() * 2000000) + 5000;
    const engagement_rate = (Math.random() * 10).toFixed(2);
    const engagement_rate_scaled = (parseFloat(engagement_rate) / 10).toFixed(4);
    
    influencers.push({
      username,
      name,
      email: `${username}@example.com`,
      bio: `I am the best ${category} influencer. Follow me for daily content!`,
      category,
      followers,
      followees: Math.floor(Math.random() * 1000),
      posts: Math.floor(Math.random() * 5000),
      total_likes: followers * 10,
      comments: followers * 2,
      engagement_rate: parseFloat(engagement_rate),
      engagement_rate_scaled: parseFloat(engagement_rate_scaled),
      bot_score: parseFloat((Math.random() * 0.2).toFixed(4)),
      authenticity: parseFloat((0.8 + Math.random() * 0.2).toFixed(4)),
      pagerank: parseFloat((Math.random() * 100).toFixed(2)),
      positive_percentage: parseFloat((Math.random() * 100).toFixed(2)),
      neutral_percentage: parseFloat((Math.random() * 50).toFixed(2)),
      negative_percentage: parseFloat((Math.random() * 10).toFixed(2)),
      sentiment_score: parseFloat((Math.random()).toFixed(4)),
      dominant_sentiment: 'Positive'
    });
  }
  return influencers;
}

async function run() {
  console.log('Keeping existing influencers to not break any existing tests...');
  
  for (const cat of CATEGORIES) {
    console.log(`Generating 50 influencers for category: ${cat}`);
    const fakeData = generateFakeInfluencers(50, cat);
    
    const { error } = await supabase.from('influencers').upsert(fakeData, { onConflict: 'username' });
    if (error) {
      console.error(`Error inserting ${cat}:`, error);
    } else {
      console.log(`Successfully inserted 50 influencers for ${cat}`);
    }
  }
  console.log('Done generating influencers!');
}

run();
