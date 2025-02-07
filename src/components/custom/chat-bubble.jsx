"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef(null);

  // Close chat when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <div className="fixed bottom-5 right-5">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#1C1C1C] text-white p-4 rounded-full shadow-lg hover:bg-[#2b2b2b] transition"
          >
            💬
          </button>
        ) : (
          <div ref={chatRef} className="w-80 h-96 bg-white border shadow-xl rounded-lg flex flex-col">
            {/* Chat Header */}
            <div className="p-4 bg-[#1C1C1C] text-white flex justify-between items-center rounded-t-lg">
              <span>AI Chat</span>
              <button onClick={() => setIsOpen(false)} className="text-lg">✖</button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="bg-gray-200 p-2 rounded-lg w-fit max-w-[80%] self-start">
                Hello! How can I assist you?
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t flex">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-md focus:outline-none"
              />
              <button className="ml-2 bg-[#1C1C1C] text-white px-4 py-2 rounded-md">
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}