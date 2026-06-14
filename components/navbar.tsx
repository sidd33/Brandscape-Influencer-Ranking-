import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogOut, Home, List, User, Link as LinkIcon } from 'lucide-react';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                <LinkIcon className="h-6 w-6 text-purple-600" />
                <span className="font-bold text-xl text-purple-600">BrandScape</span>
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300">
                  <Home className="w-4 h-4 mr-2" /> Dashboard
                </Link>
                <Link href="/campaigns" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300">
                  <List className="w-4 h-4 mr-2" /> My Campaigns
                </Link>
                <Link href="/profile" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300">
                  <User className="w-4 h-4 mr-2" /> Profile
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
                <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
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
