"use client";

import Navbar from "../../../components/custom/Navbar"; 
import projectsData from "../../../data/projectsData";
import tweetsData from "../../../data/tweetsData";
import { useParams } from "next/navigation";
import Image from 'next/image';

export default function ProjectPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const project = projectsData.find((p) => p.id === projectId);

  if (!project) {
    return (
      <main className="min-h-screen flex flex-col px-10">
        <Navbar />
        <div className="flex-grow flex w-full mx-auto gap-6 mt-6">
          <div className="border flex-grow p-4 rounded-[16px] text-center text-red-500">
            Project not found!
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="px-10">
      <div className="flex-grow flex w-full mx-auto gap-6 mt-6">
        {/* Main Content Area */}
        <div className="border flex-grow p-4 rounded-[16px]">
          <div className="flex items-center gap-6">
            {/* Project Image */}
            <div className="w-20 h-20 relative">
              <Image 
                src={project.projectImage}
                alt={project.projectImageAlt}
                fill
                className="rounded-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex gap-2 items-center">
                <h3 className="font-bold">{project.projectTitle}</h3>
                <p className="text-[12px]">{project.projectToken}</p>
              </div>
              <a href={`https://etherscan.io/address/${project.contractAddress}`} 
                 target="_blank" 
                 className="text-gray-400 hover:text-gray-600 text-[14px]">
                {project.contractAddress}
              </a>
            </div>
          </div>

          {/* Separator Line */}
          <div className="w-full h-[1px] bg-gray-300 my-6" />

          <h1 className="text-[20px] font-bold ml-2">Recent Tweets</h1>
          <div className="space-y-4">
            {tweetsData.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
          {/* Other components */}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 w-[30%]">
          {/* Chat Area */}
          <ChatArea />

          {/* Additional Section */}
          <div className="rounded-[16px] border p-4">
            <h2 className="font-bold py-2">Token Distribution</h2>
              <TokenDistribution />
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}

// Extracted Chat Area Component
const ChatArea = () => {
  return (
    <div className="rounded-[16px] border p-4 flex flex-col h-[600px]">
      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto space-y-3 p-2">
        {/* Example Chat Message */}
        <div className="bg-gray-100 text-sm p-3 rounded-lg max-w-[80%]">
          Welcome to the chat! Start typing your message below.
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t flex items-center p-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1C1C1C]"
        />
        <button className="ml-2 px-4 py-2 bg-[#1C1C1C] text-white rounded-lg hover:bg-[#3b3b3b]">
          Send
        </button>
      </div>
    </div>
  );
};

const TokenDistribution = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Live Tokens (32.6%)</span>
        <span className="text-sm text-gray-500">Hold Tokens (67.4%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div className="bg-[#1C1C1C] h-4 rounded-full" style={{ width: "32.6%" }}></div>
      </div>
    </div>
  );
};

const TweetCard = ({ tweet }) => {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <p className="text-sm">{tweet.text}</p>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{tweet.date}</span>
        <div className="flex gap-4">
          <span>Likes: {tweet.likes}</span>
          <span>Views: {tweet.views}</span>
          <span>Shares: {tweet.shares}</span>
        </div>
      </div>
    </div>
  );
};