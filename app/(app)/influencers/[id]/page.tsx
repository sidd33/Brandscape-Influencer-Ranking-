import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, MessageCircle, Heart, Camera } from 'lucide-react';

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

  if (!influencer) notFound();

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

  const initials = influencer.name ? influencer.name.charAt(0).toUpperCase() : influencer.username?.charAt(0).toUpperCase() || '?';
  const matchScore = matchData ? Math.round(Number(matchData.brand_match_score || 0) * 100) : null;
  const pageRank = Number(influencer.pagerank || 0);
  const baselinePageRank = 0.001; // Adjusted baseline
  const prPercentage = Math.min((pageRank / baselinePageRank) * 100, 100);
  const pageRankScore = Math.round(prPercentage);

  const posPct = Number(influencer.positive_percentage || 0);
  const neuPct = Number(influencer.neutral_percentage || 0);
  const negPct = Number(influencer.negative_percentage || 0);

  const engagementRate = Number(influencer.engagement_rate || 0);
  const followers = Number(influencer.followers || 0);
  const posts = Number(influencer.posts || 1);

  // Fallback calculations for missing data in database
  const avgLikesFallback = Math.floor(followers * (engagementRate / 100));
  const totalLikes = influencer.total_likes > 0 ? influencer.total_likes : (avgLikesFallback * posts);
  const avgComments = influencer.comments > 0 ? influencer.comments : Math.floor(avgLikesFallback * 0.05);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Navigation */}
      <div className="mb-8 flex items-center justify-between">
        <Link href={campaign ? `/campaigns/${campaign}` : "/dashboard"} className="text-[#6B7280] hover:text-[#6366F1] flex items-center text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Link>
        {matchScore !== null && (
          <div className="flex items-center gap-3 bg-white border border-[#E4E7F0] rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Match Score</span>
            <span className="text-[#10B981] font-bold text-lg">{matchScore}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Section A (Identity) & Section B (Influence) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* SECTION A: IDENTITY */}
          <section className="bg-white border border-[#E4E7F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 rounded-full bg-[#EEF2FF] border-4 border-white shadow-sm flex items-center justify-center text-[#6366F1] text-4xl font-bold shrink-0 ring-1 ring-[#E4E7F0]">
                {initials}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-[#0F1117] tracking-tight leading-tight" style={{ letterSpacing: '-0.02em' }}>{influencer.name || influencer.username}</h1>
                    <p className="text-[#6B7280] font-medium text-lg mt-1 flex items-center gap-2">
                      @{influencer.username}
                      <a href="#" className="text-[#9CA3AF] hover:text-[#6366F1] transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </p>
                  </div>
                  <button className="px-5 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-sm rounded-lg transition-colors shadow-sm">
                    Contact Creator
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-5">
                  {influencer.category && (
                    <span className="bg-[#F3F4F6] text-[#6B7280] px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                      #{influencer.category.replace(/[^a-zA-Z0-9]/g, '')}
                    </span>
                  )}
                  <span className="bg-[#F3F4F6] text-[#6B7280] px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                    #Creator
                  </span>
                </div>

                <div className="mt-6 text-[#6B7280] leading-relaxed max-w-2xl font-normal">
                  {influencer.bio || "No biography provided for this creator."}
                </div>
              </div>
            </div>
            
            {/* Core Metrics Ribbon */}
            <div className="grid grid-cols-4 border-t border-[#E4E7F0] bg-[#F8F9FC] divide-x divide-[#E4E7F0]">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-[#0F1117] tabular-nums">{formatNum(influencer.followers || 0)}</div>
                <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mt-1">Followers</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-[#0F1117] tabular-nums">{formatNum(influencer.followees || 0)}</div>
                <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mt-1">Following</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-[#0F1117] tabular-nums">{Number(influencer.engagement_rate || 0).toFixed(2)}%</div>
                <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mt-1">Engagement</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-[#0F1117] tabular-nums">{Number(influencer.bot_score || 0).toFixed(2)}</div>
                <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mt-1">Bot Score</div>
              </div>
            </div>
          </section>

          {/* SECTION B: INFLUENCE & AUTHORITY GRAPH */}
          <section className="bg-white border border-[#E4E7F0] rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0F1117] tracking-tight mb-6">Network Authority (PageRank)</h2>
            <div className="relative pt-8 pb-4">
              <div className="flex justify-between text-xs font-medium text-[#9CA3AF] mb-2">
                <span>0.0</span>
                <span>Baseline ({baselinePageRank})</span>
                <span>1.0 (Elite)</span>
              </div>
              <div className="h-2.5 w-full bg-[#E4E7F0] rounded-full overflow-hidden relative">
                {/* Baseline Marker */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-[#9CA3AF] z-10 left-1/2"></div>
                {/* User Score Bar */}
                <div className="h-full bg-[#6366F1] rounded-full relative z-0" style={{ width: `${prPercentage}%` }}></div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-[#6B7280]">
                  Creator PageRank Score: <strong className="text-[#0F1117] font-bold tabular-nums">{pageRankScore} / 100</strong>
                </div>
                <div className={`text-sm font-semibold ${pageRank > baselinePageRank ? 'text-[#10B981]' : 'text-[#6B7280]'}`}>
                  {pageRank > baselinePageRank ? 'Above Average Authority' : 'Standard Authority'}
                </div>
              </div>
            </div>
          </section>
          
          {/* SECTION C: REPUTATION INDEX */}
          <section className="bg-white border border-[#E4E7F0] rounded-2xl p-8 shadow-sm">
             <h2 className="text-lg font-semibold text-[#0F1117] tracking-tight mb-6">Reputation Index & Sentiment</h2>
             
             {/* Multi-Segmented Progress Bar */}
             <div className="mb-8">
               <div className="flex justify-between text-sm mb-2 font-medium">
                 <span className="text-[#10B981]">Positive ({posPct.toFixed(1)}%)</span>
                 <span className="text-[#6B7280]">Neutral ({neuPct.toFixed(1)}%)</span>
                 <span className="text-[#F43F5E]">Negative ({negPct.toFixed(1)}%)</span>
               </div>
               <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-0.5">
                 <div className="bg-[#10B981]" style={{ width: `${posPct}%` }}></div>
                 <div className="bg-[#E4E7F0]" style={{ width: `${neuPct}%` }}></div>
                 <div className="bg-[#F43F5E]" style={{ width: `${negPct}%` }}></div>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4">
               <div className="p-4 rounded-xl border border-[#E4E7F0] bg-[#F8F9FC]">
                 <div className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider mb-1">Authenticity</div>
                 <div className="text-xl font-bold text-[#0F1117] tabular-nums">{Math.max(0, 100 - (Number(influencer.bot_score || 0) * 100)).toFixed(1)}%</div>
               </div>
               <div className="p-4 rounded-xl border border-[#E4E7F0] bg-[#F8F9FC]">
                 <div className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider mb-1">Avg Comments</div>
                 <div className="text-xl font-bold text-[#0F1117] tabular-nums">{formatNum(avgComments)}</div>
               </div>
               <div className="p-4 rounded-xl border border-[#E4E7F0] bg-[#F8F9FC]">
                 <div className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider mb-1">Total Likes</div>
                 <div className="text-xl font-bold text-[#0F1117] tabular-nums">{formatNum(totalLikes)}</div>
               </div>
             </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Mock Post */}
        <div className="lg:col-span-4">
          <section className="bg-white border border-[#E4E7F0] rounded-2xl overflow-hidden shadow-sm sticky top-24">
            <div className="p-4 border-b border-[#E4E7F0] flex items-center justify-between bg-white backdrop-blur-sm">
               <h3 className="text-sm font-semibold text-[#0F1117]">Top Performing Post</h3>
               <Camera className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            
            {/* Post Image Placeholder */}
            <div className="aspect-[4/5] bg-[#F8F9FC] relative flex items-center justify-center overflow-hidden">
              <img src={`https://picsum.photos/seed/${influencer.id}/400/500`} alt="Latest Post" className="w-full h-full object-cover" />
            </div>
            
            {/* Post Details */}
            <div className="p-5">
              <div className="flex gap-4 mb-4">
                <Heart className="w-5 h-5 text-[#6B7280]" />
                <MessageCircle className="w-5 h-5 text-[#6B7280]" />
              </div>
              <div className="text-sm font-bold text-[#0F1117] mb-2 tabular-nums">
                {formatNum(Math.floor(totalLikes / posts))} likes
              </div>
              <p className="text-sm text-[#6B7280] line-clamp-3">
                <strong className="text-[#0F1117] mr-2">@{influencer.username}</strong>
                Excited to share this amazing journey with everyone! The support has been unreal. Let's keep pushing the boundaries! 🚀✨ #{influencer.category?.replace(/[^a-zA-Z0-9]/g, '') || 'lifestyle'} #creator
              </p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
