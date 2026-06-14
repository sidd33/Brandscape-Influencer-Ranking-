create extension if not exists vector;

alter table public.influencers add column embedding vector(1536);
alter table public.campaign_influencers add column semantic_similarity float;

create index influencers_embedding_idx on public.influencers
  using hnsw (embedding vector_cosine_ops);

create or replace function match_influencers_semantic(
  query_embedding vector(1536),
  match_category text default null,
  match_count int default 10
)
returns table (id uuid, username text, name text, category text, similarity float)
language sql stable as $$
  select i.id, i.username, i.name, i.category,
         1 - (i.embedding <=> query_embedding) as similarity
  from public.influencers i
  where match_category is null or i.category ilike match_category
  order by i.embedding <=> query_embedding
  limit match_count;
$$;
