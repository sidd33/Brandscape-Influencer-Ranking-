import Link from 'next/link';

export function InfluencerCard({ influencer, campaignId }: { influencer: any, campaignId?: string }) {
  const nameStr = influencer.name || influencer.username || '?';
  const initials = Array.from(nameStr)[0].toUpperCase();
  const formatNum = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n;
  
  const targetUrl = campaignId 
    ? `/influencers/${influencer.id}?campaign=${campaignId}` 
    : `/influencers/${influencer.id}`;

  return (
    <Link href={targetUrl} className="block group h-full">
      <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-[#E4E7F0] transition-all hover:bg-[#F8F9FC] hover:border-[#6366F1] hover:shadow-md h-full flex flex-col">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] text-xl font-bold mb-4 ring-2 ring-transparent group-hover:ring-[#6366F1]/30 transition-all">
          {initials}
        </div>
        <h3 className="font-bold text-[#0F1117] text-lg line-clamp-1 tracking-tight">{influencer.name || influencer.username}</h3>
        <p className="text-[#6B7280] text-sm mb-3 font-medium">@{influencer.username}</p>
        
        {influencer.category && (
          <span className="inline-block bg-[#F3F4F6] text-[#6B7280] px-3 py-1 rounded-full text-xs font-medium mb-4 mx-auto border border-[#E4E7F0]">
            {influencer.category}
          </span>
        )}
        
        <div className="mt-auto pt-4 border-t border-[#E4E7F0] flex justify-between gap-2">
          <div className="flex-1">
            <div className="font-bold text-[#0F1117]">{formatNum(influencer.followers || 0)}</div>
            <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-semibold">Followers</div>
          </div>
          <div className="flex-1 border-l border-[#E4E7F0]">
            <div className="font-bold text-[#0F1117]">{Number(influencer.engagement_rate || 0).toFixed(1)}%</div>
            <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-semibold">Engagement</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
