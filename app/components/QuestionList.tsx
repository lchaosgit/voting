'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import VotingContract from '../abis/VotingV2.json';

const votingAddress = '0xfB70fb2Ea8D9429404df656A867e536cA7Ac228D';

interface Question {
  id: string;
  title: string;
  options: string[];
  voteCounts: number[];
  hasVoted: boolean;
  imageUrls?: string[];
  timestamp?: number;
}

interface Filters {
  search: string;
  filterType: 'all' | 'active' | 'notVoted';
  sortBy: 'newest' | 'mostVotes';
}

const VoteProgressBar = ({ count, total }: { count: number; total: number }) => (
  <div className="w-full bg-gray-700 rounded-full h-2.5">
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
      style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
    />
  </div>
);

export default function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [account, setAccount] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [amount, setAmount] = useState('0.01');
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    filterType: 'all',
    sortBy: 'newest'
  });

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('连接钱包失败');
    }
  };

  useEffect(() => {
    if (account) {
      fetchQuestions();
    }
  }, [account]);

  useEffect(() => {
    connectWallet();
  }, []);

  const fetchQuestions = async () => {
    console.log('开始获取问题列表...');
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(votingAddress, VotingContract, provider);
      
      const questionCount = await contract.getQuestionCount();
      const fetchedQuestions: Question[] = [];

      for (let i = 0; i < questionCount; i++) {
        const questionId = await contract.questionIds(i);
        const [title, options, optionTexts, isActive] = await contract.getQuestion(questionId);

        const hasVoted = await contract.hasVoted(questionId, account);
        const voteCounts = await Promise.all(
          optionTexts.map((optionText: string) => contract.getVoteCount(questionId, optionText))
        );

        fetchedQuestions.push({
          id: questionId,
          title: title,
          options: optionTexts,
          voteCounts: voteCounts.map((count: any) => Number(count)),
          hasVoted
        });
      }

      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setError('获取问题列表失败');
    }
    setLoading(false);
  };

  const filterQuestions = (questions: Question[]) => {
    return questions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(filters.search.toLowerCase());
      switch (filters.filterType) {
        case 'active':
          return matchesSearch && !q.hasVoted;
        case 'notVoted':
          return matchesSearch && !q.hasVoted;
        default:
          return matchesSearch;
      }
    });
  };

  const sortQuestions = (questions: Question[]) => {
    return [...questions].sort((a, b) => {
      if (filters.sortBy === 'mostVotes') {
        const totalVotesA = a.voteCounts.reduce((sum, count) => sum + count, 0);
        const totalVotesB = b.voteCounts.reduce((sum, count) => sum + count, 0);
        return totalVotesB - totalVotesA;
      }
      return Number(b.timestamp || 0) - Number(a.timestamp || 0);
    });
  };

  const openVoteModal = (question: Question) => {
    setSelectedQuestion(question);
    setSelectedOption('');
    setShowVoteModal(true);
  };

  const handleVote = async () => {
    if (!selectedQuestion || !selectedOption) {
      setError('请选择投票选项');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(votingAddress, VotingContract, signer);

      const tx = await contract.vote(
        selectedQuestion.id,
        selectedOption,
        { value: ethers.parseEther(amount) }
      );

      await tx.wait();
      setShowVoteModal(false);
      await fetchQuestions();
      setError('');
    } catch (error) {
      console.error('Vote failed:', error);
      setError('投票失败，请重试');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索投票..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-gray-700 rounded-lg p-3 mb-4"
          />
          
          <div className="flex gap-4 mb-4">
            <select
              value={filters.filterType}
              onChange={(e) => setFilters({ ...filters, filterType: e.target.value as Filters['filterType'] })}
              className="bg-gray-700 rounded-lg p-2"
            >
              <option value="all">全部投票</option>
              <option value="active">未投票</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as 'newest' | 'mostVotes' })}
              className="bg-gray-700 rounded-lg p-2"
            >
              <option value="newest">最新</option>
              <option value="mostVotes">最多投票</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center">加载中...</div>
        ) : (
          <div className="grid gap-6">
            {sortQuestions(filterQuestions(questions)).map((question) => (
              <div key={question.id} className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">{question.title}</h2>
                <div className="space-y-4">
                  {question.options.map((option, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>{option}</span>
                        <span>{question.voteCounts[index]} 票</span>
                      </div>
                      <VoteProgressBar
                        count={question.voteCounts[index]}
                        total={question.voteCounts.reduce((a, b) => a + b, 0)}
                      />
                    </div>
                  ))}
                </div>
                {!question.hasVoted && (
                  <button
                    onClick={() => openVoteModal(question)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                  >
                    投票
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {showVoteModal && selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">投票 - {selectedQuestion.title}</h3>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-full bg-gray-700 rounded-lg p-2 mb-4"
              >
                <option value="">选择选项</option>
                {selectedQuestion.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.001"
                min="0.001"
                className="w-full bg-gray-700 rounded-lg p-2 mb-4"
                placeholder="投票金额 (ETH)"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowVoteModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleVote}
                  disabled={loading || !selectedOption}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? '处理中...' : '确认投票'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
