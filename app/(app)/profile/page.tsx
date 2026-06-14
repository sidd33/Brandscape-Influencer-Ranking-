import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export default async function ProfilePage() {
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Brand Profile</h1>
      
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-8">
        <form action={updateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand Username (Must match DB e.g., 2jewelsofficial)</label>
              <input 
                type="text" 
                name="username" 
                defaultValue={brand?.username || ''} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="text" disabled defaultValue={user.email} className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand Name</label>
              <input type="text" name="name" defaultValue={brand?.name} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input type="text" name="category" defaultValue={brand?.category || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea name="bio" rows={4} defaultValue={brand?.bio || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
