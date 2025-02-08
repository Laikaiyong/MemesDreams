"use client";

import Navbar from "../components/custom/Navbar";
import ChatBubble from "../components/custom/chat-bubble"; // Import ChatBubble
import ProjectTabs from "../components/custom/project-tabs"; // Import ProjectTabs

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 px-10 py-6">
        <div className="w-full border rounded-[22px] p-6">
          <h2 className="text-2xl font-bold mb-6">Your Characters</h2>
          <ProjectTabs />
        </div>
      </div>
      <ChatBubble />
    </main>
  );
}