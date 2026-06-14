import { createClient } from '@/lib/supabase/server';
import { StatBadge } from '@/components/stat-badge';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function InfluencerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { id } = await params;
  const { campaign } = await searchParams;
  const supabase = await createClient();
  const { data: influencer } = await supabase
    .from('influencers')
    .select('*')
    .eq('id', id)
    .single();

  if (!influencer) {
    notFound();
  }

  let matchData = null;
  if (campaign) {
    const { data } = await supabase
      .from('campaign_influencers')
      .select('*')
      .eq('influencer_id', id)
      .eq('campaign_id', campaign)
      .single();
    matchData = data;
  }

  const formatNum = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href={campaign ? `/campaigns/${campaign}` : "/dashboard"} className="text-purple-600 hover:text-purple-700 flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-8 md:flex md:items-center md:justify-between border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {influencer.name ? influencer.name.charAt(0).toUpperCase() : influencer.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900">{influencer.name || influencer.username}</h1>
              <p className="text-xl text-gray-500">@{influencer.username}</p>
              {influencer.category && (
                <span className="inline-block mt-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {influencer.category}
                </span>
              )}
            </div>
          </div>
          
          {matchData && (
            <div className="mt-6 md:mt-0 bg-purple-50 rounded-lg p-6 border border-purple-100 text-center">
              <div className="text-sm font-bold text-purple-800 uppercase tracking-wide mb-1">Campaign Match Score</div>
              <div className="text-4xl font-extrabold text-purple-600">{Math.round(Number(matchData.brand_match_score || 0) * 100)}%</div>
            </div>
          )}
        </div>
        
        {influencer.bio && (
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{influencer.bio}</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Audience & Engagement</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBadge label="Followers" value={formatNum(influencer.followers || 0)} />
        <StatBadge label="Following" value={formatNum(influencer.followees || 0)} />
        <StatBadge label="Posts" value={formatNum(influencer.posts || 0)} />
        <StatBadge label="Total Likes" value={formatNum(influencer.total_likes || 0)} />
        <StatBadge label="Engagement Rate" value={`${Number(influencer.engagement_rate || 0).toFixed(2)}%`} />
        <StatBadge label="Avg Comments" value={formatNum(influencer.comments || 0)} />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Health & Quality Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBadge label="Bot Score" value={Number(influencer.bot_score || 0).toFixed(2)} />
        <StatBadge label="Authenticity" value={Number(influencer.authenticity || 0).toFixed(2)} />
        <StatBadge label="PageRank" value={Number(influencer.pagerank || 0).toFixed(4)} />
        <StatBadge label="Sentiment Score" value={Number(influencer.sentiment_score || 0).toFixed(2)} />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sentiment Breakdown</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-green-700">Positive</span>
              <span className="text-sm font-medium text-gray-700">{Number(influencer.positive_percentage || 0).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${influencer.positive_percentage || 0}%` }}></div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Neutral</span>
              <span className="text-sm font-medium text-gray-700">{Number(influencer.neutral_percentage || 0).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-gray-400 h-2.5 rounded-full" style={{ width: `${influencer.neutral_percentage || 0}%` }}></div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-red-700">Negative</span>
              <span className="text-sm font-medium text-gray-700">{Number(influencer.negative_percentage || 0).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${influencer.negative_percentage || 0}%` }}></div>
            </div>
          </div>
        </div>
        {influencer.dominant_sentiment && (
          <div className="mt-6 text-center">
            <span className="text-gray-500">Dominant Sentiment: </span>
            <span className="font-bold text-gray-900 uppercase">{influencer.dominant_sentiment}</span>
          </div>
        )}
      </div>

    </div>
  );
}
