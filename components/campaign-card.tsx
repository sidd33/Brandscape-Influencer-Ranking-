import Link from 'next/link';

export function CampaignCard({ campaign, children }: { campaign: any, children?: React.ReactNode }) {
  const date = new Date(campaign.created_at).toLocaleDateString();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{campaign.name}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
            campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {campaign.status}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{campaign.description || 'No description provided.'}</p>
        <div className="text-sm text-gray-500 mt-auto">
          <div className="mb-1"><span className="font-medium text-gray-700">Category:</span> {campaign.category}</div>
          <div><span className="font-medium text-gray-700">Created:</span> {date}</div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
        <Link href={`/campaigns/${campaign.id}`} className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors">
          View Results &rarr;
        </Link>
        {children}
      </div>
    </div>
  );
}
