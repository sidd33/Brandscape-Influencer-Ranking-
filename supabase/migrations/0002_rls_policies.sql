alter table public.brands enable row level security;
alter table public.influencers enable row level security;
alter table public.brand_matches enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_influencers enable row level security;

-- Brands can only read/update/insert their own row
create policy "brands_select_own" on public.brands
  for select using (auth.uid() = id);
create policy "brands_update_own" on public.brands
  for update using (auth.uid() = id);
create policy "brands_insert_own" on public.brands
  for insert with check (auth.uid() = id);

-- Influencer directory and match scores are public read-only
create policy "influencers_read_all" on public.influencers
  for select using (true);
create policy "brand_matches_read_all" on public.brand_matches
  for select using (true);

-- Campaigns and their matches are scoped to the owning brand
create policy "campaigns_owner_all" on public.campaigns
  for all using (auth.uid() = brand_id) with check (auth.uid() = brand_id);

create policy "campaign_influencers_owner" on public.campaign_influencers
  for all using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.brand_id = auth.uid()
    )
  );
