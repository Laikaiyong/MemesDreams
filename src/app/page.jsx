"use client";

import Navbar from "../components/custom/Navbar";
import ChatBubble from "../components/custom/chat-bubble"; // Import ChatBubble
import ProjectTabs from "../components/custom/project-tabs"; // Import ProjectTabs

export default function HomePage() {
  return (
    <>
      <main className="flex flex-col min-h-screen">
        <Navbar />
        
        {/* Container - Full Height Minus Navbar */}
        <div className="flex flex-1 px-10">
          {/* Content Area */}
          <div className="w-full border-[1px] rounded-[22px] p-4 flex flex-col flex-1">
            <Dashboard />
          </div>
        </div>

        {/* Floating Chat Bubble */}
        <ChatBubble />
      </main>
    </>
  );
}

// Main Content: Your Projects
const Dashboard = () => (
  <div className="flex flex-col h-full">
    <h2 className="text-xl font-bold mb-4">Your Projects</h2>
    <div>
      <ProjectTabs />
    </div>
  </div>
);