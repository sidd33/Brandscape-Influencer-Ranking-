import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Plus, FolderOpen, ChevronRight, Trash2 } from 'lucide-react';

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('brand_id', user?.id)
    .order('created_at', { ascending: false });

  async function deleteCampaign(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabase = await createClient();
    await supabase.from('campaigns').delete().eq('id', id);
    revalidatePath('/campaigns');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#0F1117]" style={{ letterSpacing: '-0.03em' }}>My Campaigns</h1>
        <Link href="/campaigns/new" className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-[#6366F1] hover:bg-[#4F46E5] transition-colors">
          <Plus className="w-4 h-4" /> New Campaign
        </Link>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="bg-white border border-[#E4E7F0] rounded-xl shadow-sm" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#E4E7F0] bg-[#F8F9FC] text-[#9CA3AF] uppercase text-[11px] font-semibold tracking-widest rounded-t-xl">
            <div className="col-span-4">Campaign Name</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2">Created Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="flex flex-col">
            {campaigns.map((campaign) => {
              const date = new Date(campaign.created_at).toLocaleDateString();
              
              // Status Badge Logic
              let badgeClasses = '';
              switch(campaign.status) {
                case 'active': badgeClasses = 'text-[#10B981] bg-[#ECFDF5]'; break;
                case 'draft': badgeClasses = 'text-[#6366F1] bg-[#EEF2FF]'; break;
                case 'paused': badgeClasses = 'text-[#F59E0B] bg-[#FFFBEB]'; break;
                case 'completed': badgeClasses = 'text-[#6B7280] bg-[#F3F4F6]'; break;
                default: badgeClasses = 'text-[#6366F1] bg-[#EEF2FF]';
              }

              return (
                <div key={campaign.id} className="grid grid-cols-12 gap-4 px-6 items-center border-b border-[#F3F4F6] bg-white hover:bg-[#F5F3FF] border-l-2 border-l-transparent hover:border-l-[#6366F1] transition-colors h-[64px] group last:border-b-0 last:rounded-b-xl">
                  
                  {/* Campaign Name & Description */}
                  <div className="col-span-4 flex flex-col justify-center overflow-hidden pr-4">
                    <Link href={`/campaigns/${campaign.id}`} className="text-[#0F1117] font-semibold text-[14px] truncate hover:text-[#6366F1] transition-colors">
                      {campaign.name}
                    </Link>
                    <div className="text-[#9CA3AF] text-[12px] truncate">{campaign.description || 'No description provided.'}</div>
                  </div>

                  {/* Category */}
                  <div className="col-span-3 flex items-center">
                    <span className="bg-[#F3F4F6] text-[#6B7280] px-2.5 py-1 rounded-full text-[11px] font-medium truncate max-w-[90%]">
                      {campaign.category}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 flex items-center text-[#6B7280] text-[13px] font-medium">
                    {date}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeClasses}`}>
                      {campaign.status || 'draft'}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <form action={deleteCampaign}>
                      <input type="hidden" name="id" value={campaign.id} />
                      <button type="submit" className="p-1.5 text-[#9CA3AF] hover:text-[#F43F5E] hover:bg-[#FFF1F2] rounded-md transition-colors" title="Delete Campaign">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                    <Link 
                      href={`/campaigns/${campaign.id}`}
                      className="bg-[#EEF2FF] text-[#6366F1] hover:bg-[#6366F1] hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-[#E4E7F0]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="w-20 h-20 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-6">
            <FolderOpen className="w-10 h-10 text-[#6366F1]" />
          </div>
          <h3 className="text-xl font-bold text-[#0F1117] mb-2" style={{ letterSpacing: '-0.02em' }}>No campaigns yet</h3>
          <p className="text-sm text-[#9CA3AF] mb-8 max-w-md text-center">Get started by creating your first influencer discovery campaign. We'll automatically match you with the best creators for your brand.</p>
          <Link href="/campaigns/new" className="inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4F46E5] transition-colors">
            <Plus className="w-4 h-4" /> Create Campaign
          </Link>
        </div>
      )}
    </div>
  );
}
