import Link from 'next/link';

export function CampaignCard({ campaign, children }: { campaign: any, children?: React.ReactNode }) {
  const date = new Date(campaign.created_at).toLocaleDateString();
  
  return (
    <div className="bg-zinc-900/50 rounded-xl shadow-none border border-zinc-800 overflow-hidden flex flex-col h-full transition-all hover:bg-zinc-900 hover:border-emerald-500/50">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-zinc-100 line-clamp-1 tracking-tight">{campaign.name}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
            campaign.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            campaign.status === 'completed' ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' :
            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
          }`}>
            {campaign.status}
          </span>
        </div>
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2 flex-1">{campaign.description || 'No description provided.'}</p>
        <div className="text-sm text-zinc-500 mt-auto">
          <div className="mb-1"><span className="font-semibold text-zinc-300">Category:</span> {campaign.category}</div>
          <div><span className="font-semibold text-zinc-300">Created:</span> {date}</div>
        </div>
      </div>
      <div className="bg-zinc-950 px-6 py-3 border-t border-zinc-800 flex justify-between items-center">
        <Link href={`/campaigns/${campaign.id}`} className="text-emerald-500 hover:text-emerald-400 font-semibold text-sm transition-colors">
          View Results &rarr;
        </Link>
        {children}
      </div>
    </div>
  );
}
