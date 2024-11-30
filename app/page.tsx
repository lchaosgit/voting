"use client";
// pages/index.tsx
import { useState } from 'react';
// @ts-ignore
import { ethers } from 'ethers';
import VotingContract from '../abis/Voting.json';

const votingAddress = "YOUR_CONTRACT_ADDRESS_HERE";//合约地址

export default function Home() {
    const [votes, setVotes] = useState<number>(0);
    const [message, setMessage] = useState<string>('');

    async function vote(option: string) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(votingAddress, VotingContract.abi, signer);
            const transaction = await contract.vote(ethers.utils.formatBytes32String(option));
            await transaction.wait();
            setMessage('Thank you for voting! 🎉');
        } catch (error) {
            console.error(error);
            setMessage('Error occurred while voting. Please try again.');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full">
                <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Vote for Your Favorite Option</h1>
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={() => vote("Option1")}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-all"
                    >
                        Vote for Option 1
                    </button>
                    <button
                        onClick={() => vote("Option2")}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-all"
                    >
                        Vote for Option 2
                    </button>
                </div>
                {message && <p className="mt-4 text-center text-blue-500">{message}</p>}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">Total Votes: {votes}</p>
                </div>
            </div>
        </div>
    );
}
