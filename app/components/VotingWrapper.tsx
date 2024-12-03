'use client';

import dynamic from 'next/dynamic';

const Home = dynamic(() => import('./Home'), {
  ssr: false,
});

export default function VotingWrapper() {
  return <Home />;
}
