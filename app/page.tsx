import Link from 'next/link';
import { ArrowRight, BarChart2, Users, Target } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Find the Perfect Influencer for Your Brand
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            BrandScape uses advanced AI algorithms to match your brand with the ideal influencers, optimizing engagement, reach, and authenticity.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="rounded-md bg-purple-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
            >
              Get started
            </Link>
            <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900 flex items-center">
              Log in <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-600">Faster Matching</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to run successful campaigns
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  Data-Driven Matching
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">Our algorithms analyze engagement, bot scores, and sentiment to find the perfect fit.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  Vast Network
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">Access thousands of verified influencers across all major platforms and niches.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                    <BarChart2 className="h-6 w-6 text-white" />
                  </div>
                  Detailed Insights
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">View comprehensive metrics, sentiment analysis, and audience demographics.</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
