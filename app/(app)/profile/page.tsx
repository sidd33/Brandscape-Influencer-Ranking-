import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || 'profile';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('id', user.id)
    .single();

  async function updateProfile(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;
    
    const updates = {
      id: user.id,
      username: formData.get('username') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      bio: formData.get('bio') as string,
      email: user.email,
    };
    
    await supabase.from('brands').upsert(updates);
    revalidatePath('/profile');
  }

  const getTabClass = (tabName: string) => {
    return currentTab === tabName
      ? "px-4 py-2 text-sm font-semibold text-[#6366F1] bg-[#EEF2FF] border-l-2 border-[#6366F1] rounded-r-md transition-colors"
      : "px-4 py-2 text-sm font-medium text-[#6B7280] hover:bg-[#F5F3FF] hover:text-[#0F1117] border-l-2 border-transparent transition-colors";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
      
      {/* Left Sidebar */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-1 pr-6 border-r border-[#E4E7F0] hidden md:flex">
        <h2 className="text-sm font-semibold text-[#0F1117] mb-4 uppercase tracking-wide">Settings</h2>
        
        <Link href="/profile?tab=profile" className={getTabClass('profile')}>
          Profile
        </Link>
        <Link href="/profile?tab=notifications" className={getTabClass('notifications')}>
          Notifications
        </Link>
        <Link href="/profile?tab=billing" className={getTabClass('billing')}>
          Billing
        </Link>
        <Link href="/profile?tab=apikeys" className={getTabClass('apikeys')}>
          API Keys
        </Link>
        <Link href="/profile?tab=team" className={getTabClass('team')}>
          Team
        </Link>
      </div>

      {/* Right Content */}
      <div className="flex-1 bg-[#F8F9FC]">
        {currentTab === 'profile' && (
          <>
            <h1 className="text-3xl font-bold text-[#0F1117] mb-8 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Profile Settings</h1>
            <form action={updateProfile} className="space-y-8">
              {/* General Information Section */}
              <div className="bg-white border border-[#E4E7F0] rounded-xl p-6 shadow-sm">
                <h2 className="text-[#0F1117] font-semibold text-[16px] border-b border-[#E4E7F0] pb-3 mb-6">General Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-medium text-[#6B7280] uppercase tracking-wide mb-1">Brand Name</label>
                    <input type="text" name="name" defaultValue={brand?.name} required className="block w-full border border-[#E4E7F0] rounded-lg py-2.5 px-3 bg-white text-[#0F1117] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm transition-shadow shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#6B7280] uppercase tracking-wide mb-1">Username Handle</label>
                    <input 
                      type="text" 
                      name="username" 
                      defaultValue={brand?.username || ''} 
                      className="block w-full border border-[#E4E7F0] rounded-lg py-2.5 px-3 bg-white text-[#0F1117] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm transition-shadow shadow-sm" 
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-medium text-[#6B7280] uppercase tracking-wide mb-1">Email Address</label>
                    <input type="text" disabled defaultValue={user.email} className="block w-full bg-[#F8F9FC] border border-[#E4E7F0] rounded-lg shadow-sm py-2.5 px-3 text-[#9CA3AF] sm:text-sm cursor-not-allowed" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-medium text-[#6B7280] uppercase tracking-wide mb-1">Category</label>
                    <input type="text" name="category" defaultValue={brand?.category || ''} className="block w-full border border-[#E4E7F0] rounded-lg py-2.5 px-3 bg-white text-[#0F1117] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm transition-shadow shadow-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-medium text-[#6B7280] uppercase tracking-wide mb-1">Bio</label>
                    <textarea name="bio" rows={4} defaultValue={brand?.bio || ''} className="block w-full border border-[#E4E7F0] rounded-lg py-2.5 px-3 bg-white text-[#0F1117] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm transition-shadow shadow-sm" />
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-[#E4E7F0] flex justify-end">
                  <button type="submit" className="inline-flex justify-center py-2.5 px-6 shadow-sm text-sm font-semibold rounded-lg text-white bg-[#6366F1] hover:bg-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366F1] transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl p-6 shadow-sm">
                <h2 className="text-[#F43F5E] font-semibold text-[16px] border-b border-[#FFE4E6] pb-3 mb-6">Danger Zone</h2>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[#0F1117] font-semibold text-sm">Delete Account</p>
                    <p className="text-[#F43F5E] text-sm mt-1">Permanently delete your brand account and all associated campaigns.</p>
                  </div>
                  <button type="button" className="shrink-0 inline-flex justify-center py-2.5 px-6 shadow-sm text-sm font-semibold rounded-lg text-white bg-[#F43F5E] hover:bg-[#E11D48] transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

        {currentTab === 'notifications' && (
          <>
            <h1 className="text-3xl font-bold text-[#0F1117] mb-8 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Notification Preferences</h1>
            <div className="bg-white border border-[#E4E7F0] rounded-xl p-6 shadow-sm">
              <p className="text-[#6B7280] text-sm">Manage how you receive alerts for new creator matches, campaign updates, and billing receipts.</p>
              <div className="mt-6 flex flex-col gap-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#6366F1] rounded border-[#E4E7F0] focus:ring-[#6366F1]" />
                  <span className="text-sm font-medium text-[#0F1117]">Email notifications for new creator matches</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#6366F1] rounded border-[#E4E7F0] focus:ring-[#6366F1]" />
                  <span className="text-sm font-medium text-[#0F1117]">Weekly digest report</span>
                </label>
              </div>
            </div>
          </>
        )}

        {currentTab === 'billing' && (
          <>
            <h1 className="text-3xl font-bold text-[#0F1117] mb-8 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Billing & Subscription</h1>
            <div className="bg-white border border-[#E4E7F0] rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-[#E4E7F0]">
                <div>
                  <h3 className="font-semibold text-[#0F1117]">Pro Plan</h3>
                  <p className="text-[#6B7280] text-sm mt-1">$299/month, renewing on Jul 14, 2026</p>
                </div>
                <button className="px-4 py-2 border border-[#E4E7F0] rounded-md text-sm font-medium hover:bg-[#F8F9FC]">Manage Subscription</button>
              </div>
            </div>
          </>
        )}

        {currentTab === 'apikeys' && (
          <>
            <h1 className="text-3xl font-bold text-[#0F1117] mb-8 tracking-tight" style={{ letterSpacing: '-0.02em' }}>API Keys</h1>
            <div className="bg-white border border-[#E4E7F0] rounded-xl p-6 shadow-sm">
              <p className="text-[#6B7280] text-sm mb-4">Use these keys to authenticate your API requests. Do not share your secret key with anyone.</p>
              <div className="bg-[#F8F9FC] border border-[#E4E7F0] p-4 rounded-lg flex justify-between items-center">
                <code className="text-sm text-[#0F1117]">sk_live_1234567890abcdef</code>
                <button className="text-[#6366F1] hover:text-[#4F46E5] text-sm font-semibold">Copy</button>
              </div>
              <button className="mt-6 px-4 py-2 bg-[#0F1117] text-white rounded-md text-sm font-medium">Generate New Key</button>
            </div>
          </>
        )}

        {currentTab === 'team' && (
          <>
            <h1 className="text-3xl font-bold text-[#0F1117] mb-8 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Team Members</h1>
            <div className="bg-white border border-[#E4E7F0] rounded-xl p-6 shadow-sm">
              <p className="text-[#6B7280] text-sm mb-6">Manage who has access to this workspace.</p>
              <div className="flex justify-between items-center py-3 border-b border-[#E4E7F0]">
                <div>
                  <p className="font-semibold text-[#0F1117] text-sm">{user.email}</p>
                  <p className="text-[#9CA3AF] text-xs">Owner</p>
                </div>
              </div>
              <button className="mt-6 px-4 py-2 bg-[#EEF2FF] text-[#6366F1] rounded-md text-sm font-medium hover:bg-[#E0E7FF]">Invite Member</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
