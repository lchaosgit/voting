'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import VotingContract from './abis/Voting.json';
import React from 'react';
import ProfileWrapper from './components/ProfileWrapper';

const votingAddress = 'YOUR_CONTRACT_ADDRESS_HERE'; // 替换为你的合约地址

const Profile = dynamic(() => import('./components/Profile'), {
  ssr: false,
});

export default function Home() {
  const [votes, setVotes] = useState<Map<string, number>>(new Map([
    ['张三', 0],
    ['李四', 0],
    ['王五', 0]
  ]));
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [amount, setAmount] = useState<string>('0.01');
  const [balance, setBalance] = useState<string>('0');
  const [showRules, setShowRules] = useState<boolean>(false);

  useEffect(() => {
    connectWallet();
    fetchVotes();
  }, []);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 3000);
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        await checkVoteStatus(accounts[0]);
      } else {
        showError('MetaMask not detected!');
      }
    } catch (error) {
      showError('Failed to connect wallet');
    }
    setLoading(false);
  };

  const checkVoteStatus = async (address: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(votingAddress, VotingContract.abi, provider);
    const voted = await contract.voted(address);
    setHasVoted(voted);
    if (voted) {
      const balance = await contract.balances(address);
      setBalance(ethers.formatEther(balance));
    }
  };

  const fetchVotes = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(votingAddress, VotingContract.abi, provider);

      const options = ['张三', '李四', '王五'];
      let votesMap = new Map<string, number>();
      for (let option of options) {
        const votesCount = await contract.votes(ethers.encodeBytes32String(option));
        votesMap.set(option, parseInt(votesCount));
      }
      setVotes(votesMap);
    } catch (error) {
      showError('Failed to fetch votes');
    }
    setLoading(false);
  };

  const vote = async (option: string) => {
    if (hasVoted) {
      showError('You have already voted!');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(votingAddress, VotingContract.abi, signer);

      const transaction = await contract.vote(
        ethers.encodeBytes32String(option),
        { value: ethers.parseEther(amount) }
      );
      await transaction.wait();
      setHasVoted(true);
      await fetchVotes();
      await checkVoteStatus(account!);
      alert('Vote cast successfully!');
    } catch (error) {
      showError('Error casting vote');
    }
    setLoading(false);
  };

  const withdraw = async () => {
    if (!hasVoted) {
      showError('You have not voted yet!');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(votingAddress, VotingContract.abi, signer);

      const transaction = await contract.withdraw();
      await transaction.wait();
      await checkVoteStatus(account!);
      alert('Withdrawal successful!');
    } catch (error) {
      showError('Error withdrawing funds');
    }
    setLoading(false);
  };

  interface ToastProps {
    message: string;
    type?: 'info' | 'error';
  }

  const Toast = ({ message, type = 'info' }: ToastProps) => (
    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white transform transition-all duration-500`}>
      {message}
    </div>
  );

  return (
    <ProfileWrapper>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-96 max-w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">Voting DApp</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-8">
            <p className="text-center mb-4">
              {account ? (
                <>Connected: {account.slice(0, 6)}...{account.slice(-4)}</>
              ) : (
                'Not Connected'
              )}
            </p>

            {!account && (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full mb-4 disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            {account && !hasVoted && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voting Amount (ETH)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                  step="0.01"
                  min="0.01"
                />
              </div>
            )}

            {account && (
              <div>
                {Array.from(votes.keys()).map((option) => (
                  <div key={option} className="mb-4">
                    <button
                      onClick={() => vote(option)}
                      disabled={loading || hasVoted}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded w-full disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : `Vote for ${option} (${votes.get(option) || 0} votes)`}
                    </button>
                  </div>
                ))}

                {hasVoted && Number(balance) > 0 && (
                  <div className="mt-4">
                    <p className="text-center mb-2">Your Balance: {balance} ETH</p>
                    <button
                      onClick={withdraw}
                      disabled={loading}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded w-full disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Withdraw Funds'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProfileWrapper>
  );
}
