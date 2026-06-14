import { createClient } from '@/lib/supabase/server';
import { InfluencerCard } from '@/components/influencer-card';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();
  const query = resolvedParams.q || '';
  const page = parseInt(resolvedParams.page || '1');
  const limit = 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let supabaseQuery = supabase
    .from('influencers')
    .select('*', { count: 'exact' });

  if (query) {
    supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,username.ilike.%${query}%,category.ilike.%${query}%`);
  }

  const { data: influencers, count } = await supabaseQuery
    .order('engagement_rate', { ascending: false, nullsFirst: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / limit) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Influencer Directory</h1>
        
        <form className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name, username, or category..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
        </form>
      </div>

      {influencers && influencers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {influencers.map((inf) => (
              <InfluencerCard key={inf.id} influencer={inf} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <Link href={`/dashboard?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </Link>
              )}
              <span className="px-4 py-2 text-sm font-medium text-gray-700 border border-transparent">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link href={`/dashboard?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">No influencers found matching your search.</p>
        </div>
      )}
    </div>
  );
}
