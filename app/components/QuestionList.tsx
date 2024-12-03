'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import VotingContract from '../abis/VotingV2.json';

const votingAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

interface Question {
  id: string;
  title: string;
  options: string[];
  voteCounts: number[];
  hasVoted: boolean;
}

export default function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [account, setAccount] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [amount, setAmount] = useState('0.01');
  const [showVoteModal, setShowVoteModal] = useState(false);

  useEffect(() => {
    connectWallet();
    fetchQuestions();
  }, []);

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

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(votingAddress, VotingContract.abi, provider);
      
      const questionCount = await contract.getQuestionCount();
      const fetchedQuestions: Question[] = [];

      for (let i = 0; i < questionCount; i++) {
        const questionId = await contract.questionIds(i);
        const question = await contract.getQuestion(questionId);
        const hasVoted = await contract.hasVoted(questionId, account);
        
        const voteCounts = await Promise.all(
          question.options.map((option: string) => 
            contract.getVoteCount(questionId, option)
          )
        );

        fetchedQuestions.push({
          id: questionId,
          title: question.title,
          options: question.options,
          voteCounts: voteCounts.map(count => Number(count)),
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

  const vote = async () => {
    if (!selectedQuestion || !selectedOption || !amount) {
      setError('请选择选项并输入投票金额');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(votingAddress, VotingContract.abi, signer);

      const tx = await contract.vote(
        selectedQuestion.id,
        selectedOption,
        { value: ethers.parseUnits(amount, 18) }
      );

      await tx.wait();
      setShowVoteModal(false);
      await fetchQuestions();
      setError('投票成功！');
    } catch (error) {
      console.error('Vote failed:', error);
      setError('投票失败，请重试');
    }
    setLoading(false);
  };

  const openVoteModal = (question: Question) => {
    setSelectedQuestion(question);
    setShowVoteModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">投票问题列表</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center">加载中...</div>
        ) : (
          <div className="grid gap-6">
            {questions.map((question) => (
              <div key={question.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">{question.title}</h2>
                
                <div className="space-y-4">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                      <span>{option}</span>
                      <span>{question.voteCounts[index]} 票</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => openVoteModal(question)}
                    disabled={question.hasVoted || loading}
                    className={`w-full py-3 px-6 rounded-lg font-bold ${
                      question.hasVoted
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {question.hasVoted ? '已投票' : '投票'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showVoteModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">{selectedQuestion.title}</h2>
            
            <div className="space-y-4 mb-6">
              {selectedQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full p-4 rounded-lg text-left ${
                    selectedOption === option
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">投票金额 (ETH)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className="w-full bg-gray-700 rounded-lg p-3 text-white"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowVoteModal(false)}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={vote}
                disabled={!selectedOption || loading}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg disabled:opacity-50"
              >
                确认投票
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
