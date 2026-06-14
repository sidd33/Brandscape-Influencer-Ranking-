-- Brands: one row per brand, id matches auth.users.id
create table public.brands (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null,
  category text,
  bio text,
  email text,
  created_at timestamptz default now()
);

-- Influencers: single merged table (replaces old Influencer + DashboardInfluencer)
create table public.influencers (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  name text,
  email text,
  bio text,
  category text,
  followers integer default 0,
  followees integer default 0,
  posts integer default 0,
  total_likes bigint default 0,
  comments integer default 0,
  engagement_rate numeric,
  engagement_rate_scaled numeric,
  bot_score numeric,
  authenticity numeric,
  pagerank numeric,
  positive_percentage numeric,
  neutral_percentage numeric,
  negative_percentage numeric,
  sentiment_score numeric,
  dominant_sentiment text,
  created_at timestamptz default now()
);

create index influencers_category_idx on public.influencers (category);
create index influencers_engagement_idx on public.influencers (engagement_rate desc);

-- Precomputed brand <-> influencer match scores (seeded from final_brand_top10.csv)
create table public.brand_matches (
  id bigint generated always as identity primary key,
  brand_username text not null,
  influencer_id uuid references public.influencers(id),
  engagement_rate_scaled numeric,
  pagerank numeric,
  bot_score numeric,
  sponsored_posts_scaled numeric,
  category_relevance_score numeric,
  sentiment_score numeric,
  brand_match_score_scaled numeric
);

create index brand_matches_brand_username_idx on public.brand_matches (brand_username);
create index brand_matches_score_idx on public.brand_matches (brand_match_score_scaled desc);

-- Campaigns
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  category text not null,
  description text,
  budget numeric,
  target_age_groups text[],
  target_locations text[],
  target_gender text,
  status text default 'active' check (status in ('draft','active','completed')),
  created_at timestamptz default now()
);

-- Matched influencers per campaign (replaces the old embedded topInfluencers array)
create table public.campaign_influencers (
  campaign_id uuid references public.campaigns(id) on delete cascade,
  influencer_id uuid references public.influencers(id),
  brand_match_score numeric,
  engagement_rate_scaled numeric,
  pagerank numeric,
  bot_score numeric,
  sponsored_posts_scaled numeric,
  category_relevance_score numeric,
  sentiment_score numeric,
  primary key (campaign_id, influencer_id)
);
