'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateEmbedding } from './actions';

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

export default function CreateCampaignPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      budget: formData.get('budget') ? parseFloat(formData.get('budget') as string) : null,
      target_gender: formData.get('target_gender') as string,
    };

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    // 1. Insert Campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        brand_id: user.id,
        ...data
      })
      .select('id')
      .single();

    if (campaignError || !campaign) {
      setError(campaignError?.message || 'Failed to create campaign');
      setLoading(false);
      return;
    }

    // 2. Get current brand's username
    const { data: brand } = await supabase
      .from('brands')
      .select('username')
      .eq('id', user.id)
      .single();

    if (!brand) {
      setError('Brand not found');
      setLoading(false);
      return;
    }

    // 3. Match logic based on CAMPAIGN CATEGORY
    const { data: matches, error: matchError } = await supabase
      .from('influencers')
      .select('id, engagement_rate_scaled, pagerank, bot_score, sentiment_score')
      .ilike('category', data.category)
      .order('pagerank', { ascending: false })
      .limit(10);

    if (matchError) {
      setError('Error fetching matches: ' + matchError.message);
      setLoading(false);
      return;
    }

    if (!matches || matches.length === 0) {
      setError('No influencers found for this category — check supabase/seed data');
      setLoading(false);
      return;
    }

    // 4. Insert into campaign_influencers
    const campaignInfluencers: any[] = matches.map(m => {
      // Calculate a dynamic score out of 1.0 based on their stats
      const dynamicScore = Math.min(0.99, 0.6 + (m.pagerank / 500) + (m.engagement_rate_scaled * 0.5));
      
      return {
        campaign_id: campaign.id,
        influencer_id: m.id,
        brand_match_score: parseFloat(dynamicScore.toFixed(2)), 
        engagement_rate_scaled: m.engagement_rate_scaled,
        pagerank: m.pagerank,
        bot_score: m.bot_score,
        sponsored_posts_scaled: 0.5, 
        category_relevance_score: 1.0,
        sentiment_score: m.sentiment_score
      };
    });

    // Semantic Matching (Phase 2)
    if (data.description) {
      try {
        const descriptionEmbedding = await generateEmbedding(data.description);
        
        if (descriptionEmbedding) {
          const { data: semanticMatches, error: semanticError } = await supabase.rpc('match_influencers_semantic', {
            query_embedding: descriptionEmbedding,
            match_category: data.category,
            match_count: 5
          });

        if (!semanticError && semanticMatches) {
          for (const match of semanticMatches) {
            const existing = campaignInfluencers.find(ci => ci.influencer_id === match.id);
            if (existing) {
              existing.semantic_similarity = match.similarity;
            } else {
              campaignInfluencers.push({
                campaign_id: campaign.id,
                influencer_id: match.id,
                semantic_similarity: match.similarity
              });
            }
            }
          }
        }
      } catch (e) {
        console.error('Semantic match failed', e);
      }
    }

    const { error: insertError } = await supabase
      .from('campaign_influencers')
      .insert(campaignInfluencers);

    if (insertError) {
      setError('Failed to save matched influencers: ' + insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/campaigns/${campaign.id}`);
    router.refresh();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Campaign</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
              <input required type="text" name="name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <input type="hidden" name="category" value={selectedCategory} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea rows={4} name="description" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget ($)</label>
              <input type="number" name="budget" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Gender</label>
              <select name="target_gender" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm">
                <option value="Any">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Processing Match...' : 'Create & Match Influencers'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
