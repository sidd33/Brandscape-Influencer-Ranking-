import { createClient } from '@/lib/supabase/server';
import { InfluencerCard } from '@/components/influencer-card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function CampaignResultsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (!campaign) {
    notFound();
  }

  // Get matched influencers joined with influencer profiles
  const { data: matches } = await supabase
    .from('campaign_influencers')
    .select(`
      brand_match_score,
      semantic_similarity,
      influencers (*)
    `)
    .eq('campaign_id', id);

  if (!matches) return null;

  const dataMatches = matches.filter(m => m.brand_match_score != null).sort((a, b) => (b.brand_match_score || 0) - (a.brand_match_score || 0));
  const semanticMatches = matches.filter(m => m.semantic_similarity != null).sort((a, b) => (b.semantic_similarity || 0) - (a.semantic_similarity || 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/campaigns" className="hover:text-purple-600">Campaigns</Link>
          <span>/</span>
          <span className="text-gray-900">{campaign.name}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{campaign.name} - Match Results</h1>
        <p className="mt-2 text-lg text-gray-600">Top 10 recommended influencers based on your brand data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {dataMatches.map((match: any) => (
          <div key={match.influencers.id} className="relative h-full flex flex-col">
            <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
              Score: {Math.round(Number(match.brand_match_score || 0) * 100)}%
            </div>
            <div className="flex-1">
              <InfluencerCard influencer={match.influencers} campaignId={campaign.id} />
            </div>
          </div>
        ))}
      </div>

      {semanticMatches.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Similar by Campaign Description (AI Match)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {semanticMatches.map((match: any) => (
              <div key={match.influencers.id + '_semantic'} className="relative h-full flex flex-col">
                <div className="absolute top-2 right-2 z-10 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                  Similarity: {(match.semantic_similarity * 100).toFixed(1)}%
                </div>
                <div className="flex-1">
                  <InfluencerCard influencer={match.influencers} campaignId={campaign.id} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
