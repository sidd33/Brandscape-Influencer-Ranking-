import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { SortDropdown } from '@/components/sort-dropdown';
import { NicheDropdown } from '@/components/niche-dropdown';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; group?: string; niche?: string; sort?: string }>
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();
  const query = resolvedParams.q || '';
  const nicheFilter = resolvedParams.niche || 'All';
  const sort = resolvedParams.sort || 'followers_desc';
  const page = parseInt(resolvedParams.page || '1');
  const limit = 15;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let supabaseQuery = supabase
    .from('influencers')
    .select('*', { count: 'exact' });

  if (query) {
    supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,username.ilike.%${query}%`);
  }
  
  if (nicheFilter !== 'All') {
    supabaseQuery = supabaseQuery.eq('category', nicheFilter);
  }

  // Handle Sort
  let orderCol = 'followers';
  let asc = false;
  
  if (sort === 'followers_asc') { orderCol = 'followers'; asc = true; }
  else if (sort === 'engagement_desc') { orderCol = 'engagement_rate'; asc = false; }
  else if (sort === 'engagement_asc') { orderCol = 'engagement_rate'; asc = true; }
  else if (sort === 'name_asc') { orderCol = 'name'; asc = true; }

  const { data: influencers, count } = await supabaseQuery
    .order(orderCol, { ascending: asc, nullsFirst: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / limit) : 0;
  const formatNum = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n;

  // Fetch real categories from DB for the dropdown
  const { data: catData } = await supabase.from('influencers').select('category');
  const dbNiches = Array.from(new Set((catData || []).map(d => d.category).filter(Boolean))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-[#0F1117]" style={{ fontSize: '24px', letterSpacing: '-0.03em' }}>
            Influencer Directory
          </h1>
          <div className="bg-[#EEF2FF] text-[#6366F1] px-3 py-0.5 rounded-full text-sm font-semibold tabular-nums">
            {count ? count.toLocaleString() : 0} total
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <form className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#9CA3AF]" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search creators..."
              className="block w-full pl-9 pr-3 py-1.5 border border-[#E4E7F0] rounded-md bg-white text-[#0F1117] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm transition-shadow shadow-sm"
            />
            {nicheFilter !== 'All' && <input type="hidden" name="niche" value={nicheFilter} />}
            {sort !== 'followers_desc' && <input type="hidden" name="sort" value={sort} />}
          </form>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <NicheDropdown niches={dbNiches} currentNiche={nicheFilter} />
            <SortDropdown currentSort={sort} />
          </div>
        </div>
      </div>

      {/* Table Layout */}
      <div className="bg-white border border-[#E4E7F0] rounded-xl shadow-sm" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {/* Table Header (No sticky to prevent overlap glitches) */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#E4E7F0] bg-[#F8F9FC] text-[#9CA3AF] uppercase text-[11px] font-semibold tracking-widest rounded-t-xl">
          <div className="col-span-1 max-w-[40px]">#</div>
          <div className="col-span-4">Creator Profile</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2 text-right">Followers</div>
          <div className="col-span-2">Engagement</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Rows */}
        {influencers && influencers.length > 0 ? (
          <div className="flex flex-col">
            {influencers.map((inf: any, idx: number) => {
              const nameStr = String(inf.name || inf.username || '?');
              const initials = Array.from(nameStr)[0].toUpperCase();
              const engagementRate = Number(inf.engagement_rate || 0);
              let engColorClass = 'text-[#9CA3AF] font-medium';
              if (engagementRate > 5) engColorClass = 'text-[#10B981] font-bold';
              else if (engagementRate >= 2) engColorClass = 'text-[#F59E0B] font-bold';
              
              const visualFill = Math.min(engagementRate, 100);
              const rowIndex = from + idx + 1;

              return (
                <div 
                  key={inf.id} 
                  className="grid grid-cols-12 gap-4 px-6 items-center border-b border-[#F3F4F6] bg-white hover:bg-[#F5F3FF] border-l-2 border-l-transparent hover:border-l-[#6366F1] transition-colors h-[64px] group last:border-b-0 last:rounded-b-xl"
                >
                  {/* Index */}
                  <div className="col-span-1 max-w-[40px] text-[#D1D5DB] text-[11px] font-medium">
                    {rowIndex}
                  </div>

                  {/* Avatar & Name */}
                  <div className="col-span-4 flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                    <div className="truncate">
                      <div className="text-[#0F1117] font-semibold text-[14px] truncate">{inf.name || inf.username}</div>
                      <div className="text-[#9CA3AF] text-[12px] truncate">@{inf.username}</div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 flex items-center">
                    {inf.category ? (
                      <span className="bg-[#F3F4F6] text-[#6B7280] px-2.5 py-1 rounded-full text-[11px] font-medium truncate max-w-full">
                        {inf.category}
                      </span>
                    ) : (
                      <span className="text-[#9CA3AF] text-[11px] italic">Unknown</span>
                    )}
                  </div>

                  {/* Followers */}
                  <div className="col-span-2 text-right text-[#0F1117] tabular-nums font-bold text-[14px]">
                    {formatNum(inf.followers || 0)}
                  </div>

                  {/* Engagement Sparkline */}
                  <div className="col-span-2 flex flex-col justify-center gap-1.5 pr-2">
                    <div className={`text-[12px] tabular-nums ${engColorClass}`}>
                      {engagementRate.toFixed(1)}%
                    </div>
                    <div className="h-1.5 w-full bg-[#E4E7F0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${visualFill}%` }}></div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex justify-end items-center">
                    <Link 
                      href={`/influencers/${inf.id}`}
                      className="bg-[#EEF2FF] text-[#6366F1] hover:bg-[#6366F1] hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors opacity-0 group-hover:opacity-100"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-b-xl">
            <p className="text-[#6B7280] text-sm font-medium">No creators found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-xs text-[#6B7280] font-medium">
            Showing <span className="text-[#0F1117] font-bold">{from + 1}</span> to <span className="text-[#0F1117] font-bold">{Math.min(to + 1, count || 0)}</span> of <span className="text-[#0F1117] font-bold">{count}</span>
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link 
                href={`/dashboard?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${nicheFilter !== 'All' ? `&niche=${encodeURIComponent(nicheFilter)}` : ''}&sort=${sort}`} 
                className="px-3 py-1.5 border border-[#E4E7F0] rounded-md text-xs font-medium text-[#0F1117] bg-white hover:bg-[#F8F9FC] transition-colors shadow-sm"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link 
                href={`/dashboard?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${nicheFilter !== 'All' ? `&niche=${encodeURIComponent(nicheFilter)}` : ''}&sort=${sort}`} 
                className="px-3 py-1.5 border border-[#E4E7F0] rounded-md text-xs font-medium text-[#0F1117] bg-white hover:bg-[#F8F9FC] transition-colors shadow-sm"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
