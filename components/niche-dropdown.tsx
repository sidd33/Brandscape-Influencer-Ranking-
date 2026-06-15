"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Filter } from 'lucide-react';

export function NicheDropdown({ niches, currentNiche }: { niches: string[], currentNiche: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val === 'All') {
      params.delete('niche');
    } else {
      params.set('niche', val);
    }
    
    // Reset to page 1
    params.delete('page');
    
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="relative shrink-0 flex items-center">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6B7280]">
        <Filter className="h-3.5 w-3.5" />
      </div>
      <select 
        className="appearance-none bg-white border border-[#E4E7F0] text-[#0F1117] font-medium text-sm rounded-md pl-9 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#6366F1] cursor-pointer shadow-sm"
        defaultValue={currentNiche}
        onChange={handleChange}
      >
        <option value="All">All Niches</option>
        {niches.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#6B7280]">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}
