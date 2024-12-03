'use client';

import { useState } from 'react';
import QuestionList from '../components/QuestionList';
import CreateQuestion from '../components/CreateQuestion';

export default function VotingPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              投票列表
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              创建投票
            </button>
          </div>
        </div>

        {activeTab === 'list' ? <QuestionList /> : <CreateQuestion />}
      </div>
    </div>
  );
}
