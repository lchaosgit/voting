'use client';

import React from 'react';
import QuestionList from '../components/QuestionList';

export default function QuestionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <QuestionList />
      </div>
    </div>
  );
}