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
      <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md h-full flex flex-col">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-sm group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{influencer.name || influencer.username}</h3>
        <p className="text-gray-500 text-sm mb-3">@{influencer.username}</p>
        
        {influencer.category && (
          <span className="inline-block bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium mb-4 mx-auto">
            {influencer.category}
          </span>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between gap-2">
          <div className="flex-1">
            <div className="font-bold text-gray-900">{formatNum(influencer.followers || 0)}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Followers</div>
          </div>
          <div className="flex-1 border-l border-gray-100">
            <div className="font-bold text-gray-900">{Number(influencer.engagement_rate || 0).toFixed(1)}%</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Engagement</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
