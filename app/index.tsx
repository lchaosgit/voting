import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import VotingContract from '../abis/Voting.json';
import React from 'react';
const votingAddress = 'YOUR_CONTRACT_ADDRESS_HERE'; // 替换为你的合约地址

const Home = () => {
  const [votes, setVotes] = useState<Map<string, number>>(new Map());
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    connectWallet();
    fetchVotes();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } else {
      alert('MetaMask not detected!');
    }
  };

  const fetchVotes = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(votingAddress, VotingContract.abi, provider);

    const options = ['Option1', 'Option2', 'Option3'];

    let votesMap = new Map<string, number>();
    for (let option of options) {
      const votesCount = await contract.votes(ethers.utils.formatBytes32String(option));
      votesMap.set(option, parseInt(votesCount));
    }
    setVotes(votesMap);
  };

  const vote = async (option: string) => {
    if (hasVoted) {
      alert('You have already voted!');
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(votingAddress, VotingContract.abi, signer);

    try {
      const transaction = await contract.vote(ethers.utils.formatBytes32String(option));
      await transaction.wait();
      setHasVoted(true);
      fetchVotes();
      alert('Vote cast successfully!');
    } catch (error) {
      console.error(error);
      alert('Error casting vote');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Voting DApp</h1>
        <div className="mb-8">
          <p className="text-center mb-4">Connected Account: {account}</p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white py-2 px-4 rounded w-full mb-4"
          >
            Connect Wallet
          </button>
          <div>
            {Array.from(votes.keys()).map((option) => (
              <div key={option} className="mb-4">
                <button
                  onClick={() => vote(option)}
                  className="bg-green-500 text-white py-2 px-4 rounded w-full"
                >
                  Vote for {option} ({votes.get(option) || 0} votes)
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
