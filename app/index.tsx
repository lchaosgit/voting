import { useState } from 'react';
import React from 'react';
import Head from "next/head";
import Login from "../components/Login.tsx";

const Home: React.FC = () => {
  const [votes, setVotes] = useState({ option1: 0, option2: 0 });

  const handleVote = (option: 'option1' | 'option2') => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [option]: prevVotes[option] + 1,
    }));
  };

  return (
    <>
      <Head>
        <title>用户登录</title>
      </Head>
      <Login />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-6">Vote for Your Favorite Option</h1>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => handleVote('option1')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Vote for Option 1
          </button>
          <button
            onClick={() => handleVote('option2')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Vote for Option 2
          </button>
        </div>
        <div className="text-2xl">
          <p>Option 1 Votes: {votes.option1}</p>
          <p>Option 2 Votes: {votes.option2}</p>
        </div>
      </div>
    </>
  );
};

export default Home;
