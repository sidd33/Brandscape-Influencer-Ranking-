import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function runSeed() {
  console.log('Reading influencers...');
  const influencers: any[] = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, 'raw', 'final_filtered_influencer.csv'))
      .pipe(csv())
      .on('data', (row: any) => {
        if (!row.username) return;
        influencers.push({
          username: row.username,
          name: row.name || null,
          email: row.email || null,
          bio: row.bio || null,
          category: row.category || null,
          followers: parseInt(row.followers) || 0,
          followees: parseInt(row.followees) || 0,
          posts: parseInt(row.posts) || 0,
          engagement_rate: parseFloat(row.engagement_rate) || null,
          engagement_rate_scaled: parseFloat(row.engagement_rate_scaled) || null,
          bot_score: parseFloat(row.bot_score) || null,
          authenticity: parseFloat(row.authenticity) || null,
          pagerank: parseFloat(row.pagerank) || null,
          positive_percentage: parseFloat(row.positive_percentage) || null,
          neutral_percentage: parseFloat(row.neutral_percentage) || null,
          negative_percentage: parseFloat(row.negative_percentage) || null,
          sentiment_score: parseFloat(row.sentiment_score) || null,
          dominant_sentiment: row.dominant_sentiment || null,
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Read ${influencers.length} influencers...`);
  
  // Deduplicate by username to prevent "ON CONFLICT DO UPDATE command cannot affect row a second time" error
  const uniqueInfluencers = [];
  const seenUsernames = new Set<string>();
  for (const inf of influencers) {
    if (!seenUsernames.has(inf.username)) {
      seenUsernames.add(inf.username);
      uniqueInfluencers.push(inf);
    }
  }
  console.log(`Inserting ${uniqueInfluencers.length} unique influencers...`);

  // Insert in chunks to avoid payload limits
  const chunkSize = 1000;
  const usernameToId: Record<string, string> = {};

  for (let i = 0; i < uniqueInfluencers.length; i += chunkSize) {
    const chunk = uniqueInfluencers.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from('influencers')
      .upsert(chunk, { onConflict: 'username' })
      .select('id, username');
    
    if (error) {
      console.error('Error inserting influencers:', error);
      process.exit(1);
    }
    
    for (const row of data || []) {
      usernameToId[row.username] = row.id;
    }
  }

  console.log('Reading brand matches...');
  const matches: any[] = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, 'raw', 'final_brand_top10.csv'))
      .pipe(csv())
      .on('data', (row: any) => {
        const influencer_username = row.influencer_username;
        const brand_username = row.brand_username;
        if (!influencer_username || !brand_username) return;
        
        const influencer_id = usernameToId[influencer_username];
        if (!influencer_id) return; // Skip if influencer not found
        
        matches.push({
          brand_username: brand_username.trim().toLowerCase(),
          influencer_id,
          engagement_rate_scaled: parseFloat(row.engagement_rate_scaled) || null,
          pagerank: parseFloat(row.pagerank) || null,
          bot_score: parseFloat(row.bot_score) || null,
          sponsored_posts_scaled: parseFloat(row.sponsored_posts_scaled) || null,
          category_relevance_score: parseFloat(row.category_relevance_score) || null,
          sentiment_score: parseFloat(row.sentiment_score) || null,
          brand_match_score_scaled: parseFloat(row.brand_match_score_scaled) || null,
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Inserting ${matches.length} matches...`);
  for (let i = 0; i < matches.length; i += chunkSize) {
    const chunk = matches.slice(i, i + chunkSize);
    const { error } = await supabase.from('brand_matches').insert(chunk);
    if (error) {
      console.error('Error inserting matches:', error);
      process.exit(1);
    }
  }

  console.log('Seeding complete!');
}

runSeed().catch(console.error);
