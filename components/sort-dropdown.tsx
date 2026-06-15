"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export function SortDropdown({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    
    // Reset to page 1 on sort change
    params.delete('page');
    
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="relative shrink-0">
      <select 
        className="appearance-none bg-white border border-[#E4E7F0] text-[#6B7280] text-sm rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#6366F1] cursor-pointer"
        defaultValue={currentSort}
        onChange={handleSortChange}
      >
        <option value="followers_desc">Followers ↓</option>
        <option value="followers_asc">Followers ↑</option>
        <option value="engagement_desc">Engagement ↓</option>
        <option value="engagement_asc">Engagement ↑</option>
        <option value="name_asc">Name A-Z</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#6B7280]">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}
