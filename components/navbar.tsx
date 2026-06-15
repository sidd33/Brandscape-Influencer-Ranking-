import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogOut, Home, List, User, Link as LinkIcon } from 'lucide-react';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="bg-white border-b border-[#E4E7F0] sticky top-0 z-50" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded bg-[#EEF2FF] flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
                  <LinkIcon className="h-4 w-4 text-[#6366F1]" />
                </div>
                <span className="font-bold text-xl text-[#0F1117] tracking-tight" style={{ letterSpacing: '-0.03em' }}>BrandScape</span>
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8 items-center">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-[#6B7280] hover:text-[#6366F1] transition-colors">
                  <Home className="w-4 h-4 mr-2" /> Dashboard
                </Link>
                <Link href="/campaigns" className="inline-flex items-center text-sm font-medium text-[#6B7280] hover:text-[#6366F1] transition-colors">
                  <List className="w-4 h-4 mr-2" /> Campaigns
                </Link>
                <Link href="/profile" className="inline-flex items-center text-sm font-medium text-[#6B7280] hover:text-[#6366F1] transition-colors">
                  <User className="w-4 h-4 mr-2" /> Settings
                </Link>
              </div>
            )}
          </div>
          {user && (
            <div className="flex items-center">
              <form action={async () => {
                'use server';
                const supabase = await createClient();
                await supabase.auth.signOut();
                redirect('/login');
              }}>
                <button type="submit" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded text-[#6B7280] hover:text-[#F43F5E] hover:bg-[#FFF1F2] transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
