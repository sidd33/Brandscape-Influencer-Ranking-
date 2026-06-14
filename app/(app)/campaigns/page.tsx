import { createClient } from '@/lib/supabase/server';
import { CampaignCard } from '@/components/campaign-card';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

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
        <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
        <Link href="/campaigns/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700">
          + Create Campaign
        </Link>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign}>
              <form action={deleteCampaign}>
                <input type="hidden" name="id" value={campaign.id} />
                <button type="submit" className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 px-2 py-1 rounded">
                  Delete
                </button>
              </form>
            </CampaignCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No campaigns</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new campaign.</p>
          <div className="mt-6">
            <Link href="/campaigns/new" className="inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500">
              Create Campaign
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
