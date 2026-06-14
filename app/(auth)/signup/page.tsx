'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '', password: '', username: '', name: '', category: '', bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    
    // 1. Validate username exists in brand_matches
    const { data: matchData, error: matchError } = await supabase
      .from('brand_matches')
      .select('brand_username')
      .ilike('brand_username', formData.username.trim())
      .limit(1);

    if (matchError) {
      setError('Failed to validate brand username.');
      setLoading(false);
      return;
    }

    if (!matchData || matchData.length === 0) {
      setError('Brand username not found in partner database. Please contact support.');
      setLoading(false);
      return;
    }

    // 2. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError('Signup failed unexpectedly.');
      setLoading(false);
      return;
    }

    // 3. Insert into brands table
    const { error: insertError } = await supabase.from('brands').insert({
      id: authData.user.id,
      username: formData.username.trim().toLowerCase(),
      name: formData.name,
      category: formData.category,
      bio: formData.bio,
      email: formData.email,
    });

    if (insertError) {
      setError('Failed to create brand profile: ' + insertError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Brand Account
          </h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>}
          
          <input
            required
            type="text"
            placeholder="Brand Name"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input
            required
            type="text"
            placeholder="Brand Username (Must match partner DB)"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          <input
            required
            type="email"
            placeholder="Email address"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            required
            type="password"
            placeholder="Password"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <input
            type="text"
            placeholder="Category (e.g. Technology)"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          />
          <textarea
            placeholder="Brand Bio"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
          />

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 mt-4"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
          <Link href="/login" className="text-purple-600 hover:text-purple-500">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
