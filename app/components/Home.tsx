'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import VotingContract from '../abis/VotingV2.json';

const votingAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setIsConnected(accounts.length > 0);

        if (accounts.length > 0) {
          const contract = new ethers.Contract(votingAddress, VotingContract.abi, provider);
          const count = await contract.getQuestionCount();
          setQuestionCount(Number(count));

          // 计算所有问题的总投票数
          let votes = 0;
          for (let i = 0; i < count; i++) {
            const questionId = await contract.questionIds(i);
            const question = await contract.getQuestion(questionId);
            for (const option of question.options) {
              const voteCount = await contract.getVoteCount(questionId, option);
              votes += Number(voteCount);
            }
          }
          setTotalVotes(votes);
        }
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        checkWalletConnection();
      } else {
        alert('请安装MetaMask钱包');
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };

  const goToProfile = () => {
    router.push('/profile');
  };

  const goToVoting = () => {
    router.push('/voting');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">区块链投票系统</h1>
          <p className="text-xl text-gray-300">安全、透明、不可篡改的投票平台</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">问题总数</h3>
            <p className="text-4xl font-bold text-blue-400">{questionCount}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">总投票数</h3>
            <p className="text-4xl font-bold text-green-400">{totalVotes}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">钱包状态</h3>
            <p className="text-4xl font-bold text-yellow-400">
              {isConnected ? "已连接" : "未连接"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              连接钱包
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={goToVoting}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                参与投票
              </button>
              <button
                onClick={goToProfile}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                个人中心
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
