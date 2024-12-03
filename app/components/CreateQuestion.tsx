'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import VotingContract from '../abis/VotingV2.json';

const votingAddress = '0xfB70fb2Ea8D9429404df656A867e536cA7Ac228D';

export default function CreateQuestion() {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createQuestion = async () => {
    if (!title || options.some(opt => !opt.trim())) {
      setError('请填写标题和所有选项');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(votingAddress, VotingContract, signer);

      const tx = await contract.createQuestion(title, options);
      const receipt = await tx.wait();
      
      const result = await contract.getQuestion(receipt.logs[0].args[0]);
      const [questionTitle, _, optionTexts] = result;

      setSuccess(`投票创建成功！
        标题：${questionTitle}
        选项：${optionTexts.join(', ')}
        投票ID：${receipt.logs[0].args[0]}`);
      
      setTitle('');
      setOptions(['', '']);
      setError('');
    } catch (error) {
      console.error('Failed to create question:', error);
      setError('创建问题失败，请重试');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">创建新投票</h1>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 text-white p-4 rounded-lg mb-6 whitespace-pre-line">
            {success}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">投票标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 rounded-lg p-3 text-white"
              placeholder="输入投票标题"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">投票选项</label>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex gap-4">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 bg-gray-700 rounded-lg p-3 text-white"
                    placeholder={`选项 ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="bg-red-600 hover:bg-red-700 px-4 rounded-lg"
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addOption}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              添加选项
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={createQuestion}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建投票'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
