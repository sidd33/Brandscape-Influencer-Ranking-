import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('brand_matches')
    .select('brand_username')
    .limit(100);
  
  const uniqueBrands = [...new Set(data?.map(d => d.brand_username))];
  console.log('Unique Brands:', uniqueBrands.slice(0, 10));
}
run();
