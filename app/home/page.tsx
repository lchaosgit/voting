'use client';

import React from 'react';
import Home from '../components/Home';

interface HomePageProps {}

export default function HomePage({}: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <Home />
      </div>
    </div>
  );
}