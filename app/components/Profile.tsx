import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import VotingContract from '../abis/VotingV2.json';

const votingAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

interface VotingStatus {
  questionId: string;
  hasVoted: boolean;
  balance: string;
}

export default function Profile() {
  const [account, setAccount] = useState<string>('');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [votingStatuses, setVotingStatuses] = useState<VotingStatus[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const contract = new ethers.Contract(votingAddress, VotingContract.abi, provider);
          
          // 获取ETH余额
          const ethBalance = await provider.getBalance(accounts[0]);
          setEthBalance(ethers.formatUnits(ethBalance, 18));
          
          // 获取所有投票问题的状态
          const questionCount = await contract.getQuestionCount();
          const statuses: VotingStatus[] = [];
          
          for (let i = 0; i < questionCount; i++) {
            const questionId = await contract.questionIds(i);
            const hasVoted = await contract.hasVoted(questionId, accounts[0]);
            const balance = await contract.balances(accounts[0], questionId);
            
            statuses.push({
              questionId,
              hasVoted,
              balance: ethers.formatUnits(balance, 18)
            });
          }
          
          setVotingStatuses(statuses);
        }
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };

  const goToVoting = () => {
    router.push('/voting');
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">个人信息</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
              <span className="text-gray-300">钱包地址</span>
              <span className="font-mono">{formatAddress(account)}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
              <span className="text-gray-300">ETH余额</span>
              <span>{ethBalance} ETH</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
              <span className="text-gray-300">参与投票数</span>
              <span>{votingStatuses.filter(s => s.hasVoted).length}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={goToVoting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            去投票
          </button>
          <button
            onClick={toggleModal}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            查看详细信息
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">详细信息</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-300 mb-2">完整钱包地址</h3>
                <p className="font-mono break-all">{account}</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-300 mb-2">ETH余额</h3>
                <p>{ethBalance} ETH</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-300 mb-2">投票记录</h3>
                <div className="space-y-2">
                  {votingStatuses.map((status, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>问题 {index + 1}</span>
                      <span className={status.hasVoted ? "text-green-400" : "text-yellow-400"}>
                        {status.hasVoted ? `已投票 (押金: ${status.balance} ETH)` : "未投票"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={toggleModal}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}