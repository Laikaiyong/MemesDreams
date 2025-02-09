"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/auth-provider";
import Image from "next/image";

function Message({ content, role, mediaData }) {
  return (
    <div
      className={`flex ${
        role === "assistant" ? "justify-start" : "justify-end"
      }`}>
      {role === "assistant" && (
        <div className="w-8 h-8 relative mr-2">
          <Image
            src="https://storage.googleapis.com/pod_public/1300/175426.jpg"
            alt="MemeZoozoo"
            fill
            className="rounded-full object-cover"
          />
        </div>
      )}
      <div
        className={`flex flex-col ${
          role === "assistant" ? "items-start" : "items-end"
        }`}>
        <div
          className={`p-3 rounded-2xl max-w-[80%] ${
            role === "assistant"
              ? "bg-[#2a2a2a] text-white rounded-tl-none"
              : "bg-white text-black rounded-tr-none"
          }`}>
          {content}
        </div>
        {role === "assistant" && mediaData?.mediaUrl && (
          <div className="w-full max-w-[300px] rounded-lg overflow-hidden my-2">
            {mediaData.mediaType === "canvas" ? (
              <img
                src={mediaData.mediaUrl}
                alt="Generated image"
                width={300}
                height={300}
                className="w-full h-auto"
              />
            ) : (
              <video
                controls
                className="w-full h-auto"
                src={mediaData.mediaUrl}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatBubble({ characterId = null }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [previousPrompt, setPreviousPrompt] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I can help you create and launch your character. Would you like to:
      Generate a new character, Deploy an existing character or Create social media content for existing character`,
    },
  ]);
  const [characterName, setCharacterName] = useState("");
  const [characterSymbol, setCharacterSymbol] = useState("");

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(characterId);
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { userAddress, characters, addCharacter } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const [imagePath, setImagePath] = useState(null);
  const [maskImagePath, setMaskImagePath] = useState(null);
  const [workflowType, setWorkflowType] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const walletId =
    typeof window !== "undefined" ? localStorage.getItem("walletId") : null;

  const fetchCharacterData = async () => {
    if (characterId) {
      const walletId = localStorage.getItem("walletId");
      try {
        const response = await fetch(
          `/api/aws/s3/specific?walletId=${walletId}&characterId=${characterId}`
        );
        const data = await response.json();
        if (data.success) {
          setCurrentCharacter(data.character);
          setMessages([
            {
              role: "assistant",
              content: `I detected character #${characterId}. What would you like to do? Create social media content, Deploy contract`,
              mediaData: data.character.mainImage
                ? {
                    mediaUrl: data.character.mainImage.url,
                    mediaType: "canvas",
                  }
                : null,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching character:", error);
      }
    }
  };

  useEffect(() => {
    fetchCharacterData();
  }, [characterId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleMediaGeneration(
    type,
    useExisting = false,
    name = "",
    symbol = ""
  ) {
    try {
      setIsTyping(true);
      const characterId = `${name}-${symbol}`;
      
      // Combine previous prompt with current input
      const combinedPrompt = previousPrompt 
        ? `${previousPrompt} - ${inputMessage}`
        : inputMessage;
  
      let payload = {
        type,
        prompt: combinedPrompt,
        walletId,
        characterId,
      };

      if (useExisting && currentCharacter?.imagePath) {
        payload = {
          ...payload,
          imagePath: currentCharacter.imagePath,
          type: type === "reels" ? "existing-to-video" : "existing-to-image",
          profile: !useExisting,
        };
      }

      const response = await fetch("/api/aws/media-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        console.log(data);
        addMessage("assistant", "Generated Character!", {
          mediaUrl: data.url,
          mediaType: type,
          imageFile: data.imageData,
        });

        if (type === "canvas") {
          setImagePath(data.url);
        }
      } else {
        addMessage(
          "assistant",
          "Failed to generate media content. Please try again."
        );
      }
    } catch (error) {
      console.error("Media generation error:", error);
      addMessage("assistant", "Error generating media content");
    } finally {
      setIsTyping(false);
    }
  }

  async function handleContractDeployment() {
    try {
      setIsTyping(true);
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      addMessage("assistant", `Contract deployed at: ${data.address}`);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleSocialMediaContent(prompt) {
    try {
      setIsTyping(true);

      if (!currentCharacter?.mainImage) {
        addMessage(
          "assistant",
          "No character image found. Please generate one first."
        );
        return;
      }

      // Generate caption with Hyperbolic
      const captionResponse = await fetch("/api/hyperbolic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a short, engaging social media caption for this character: ${prompt}. Make it witty and viral-worthy. Don't include any markdowns, quotations, colon, semicolon, commas, full stops and any special characters. Only provide one caption`,
        }),
      });

      const { result: caption } = await captionResponse.json();

      // Generate social media content
      const response = await fetch("/api/aws/socialmed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "canvas", // or "reels"
          imagePath: currentCharacter.mainImage.path,
          walletId,
          characterId: currentCharacter.id,
          caption,
          prompt: `Create a poster with the character in it that suits ${caption}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage(
          "assistant",
          `Generated social media post with caption: "${caption}"`,
          {
            mediaUrl: data.url,
            mediaType: "canvas",
          }
        );
      } else {
        addMessage("assistant", "Failed to generate social media content");
      }
    } catch (error) {
      console.error("Social media generation error:", error);
      addMessage("assistant", "Error generating social media content");
    } finally {
      setIsTyping(false);
    }
  }

  function addMessage(role, content, mediaData = null) {
    setMessages((prev) => [
      ...prev,
      {
        role,
        content,
        ...(mediaData && { mediaData }),
      },
    ]);
  }

  async function handleIntent(intent, input) {
    // Handle different intents
    switch (intent) {
      case "CHARACTER_GENERATION":
        setPreviousPrompt(input); // Store the initial prompt
        if (!characterName || !characterSymbol) {
          addMessage(
            "assistant",
            `For ${input} Please provide your character name and symbol (e.g. 'pepe PEPE')`
          );
          setWorkflowType("character-details");
        } else {
          await handleMediaGeneration("canvas", false);
        }
        break;
      case "DEPLOY_CONTRACT":
        await handleContractDeployment();
        break;
      case "CHARACTER_SOCIAL_MEDIA":
        await handleSocialMediaContent(input);
        break;
      default:
        addMessage(
          "assistant",
          "I can help you:\n Generate a character\n, Create visuals\n, Deploy contracts\n, Create social media content"
        );
    }
  }

  async function handleSendMessage() {
    if (!inputMessage.trim()) return;

    addMessage("user", inputMessage);
    const userInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      if (workflowType) {
        await handleWorkflowResponse(userInput);
      } else {
        // Detect intent using Hyperbolic
        const intentResponse = await fetch("/api/hyperbolic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Classify the following user input into one of these intents: 
          CHARACTER_GENERATION, DEPLOY_CONTRACT, CHARACTER_SOCIAL_MEDIA.
          User input: "${userInput}, Only return the intent without any elaboration, be concise, only the final answer"`,
          }),
        });

        const { result } = await intentResponse.json();
        await handleIntent(result.trim().toUpperCase(), userInput);
      }
    } catch (error) {
      addMessage(
        "assistant",
        "Sorry, I encountered an error processing your request"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWorkflowResponse(input) {
    if (workflowType === "character-details") {
      const [name, symbol] = input.split(" ");
      if (!name || !symbol) {
        addMessage(
          "assistant",
          "Please provide both name and symbol separated by space"
        );
        return;
      }
      await handleMediaGeneration("canvas", false, name, symbol);
      setWorkflowType(null);
    } else if (workflowType === "video-choice") {
      if (input.includes("1")) {
        await handleMediaGeneration("reels", false);
      } else if (input.includes("2")) {
        await handleMediaGeneration("reels", true);
      }
      setWorkflowType(null);
    } else if (workflowType === "image-choice") {
      if (input.includes("1")) {
        await handleMediaGeneration("canvas", false);
      } else if (input.includes("2")) {
        await handleMediaGeneration("canvas", true);
      }
      setWorkflowType(null);
    }
  }

  return (
    <div
      className={`fixed ${isFullscreen ? "inset-0" : "bottom-5 right-5"} z-50`}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-zinc-800 transition">
          💬
        </button>
      ) : (
        <div
          ref={chatRef}
          style={{
            position: isFullscreen ? "fixed" : "relative",
            top: isFullscreen ? "0" : "auto",
            left: isFullscreen ? "0" : "auto",
            right: isFullscreen ? "0" : "auto",
            bottom: isFullscreen ? "0" : "auto",
          }}
          className={`bg-[#1a1a1a] shadow-xl rounded-lg flex flex-col
            transition-all duration-300 ease-in-out origin-bottom-right
            ${isFullscreen ? "w-screen h-screen" : "w-96 h-[600px]"}`}>
          {/* Header with Profile */}
          <div className="p-4 bg-black flex items-center gap-3 rounded-t-lg">
            <div className="relative w-10 h-10">
              <Image
                src="https://storage.googleapis.com/pod_public/1300/175426.jpg"
                alt="MemeZoozoo"
                fill
                className="rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">MemeZoozoo</h3>
              <p className="text-xs text-gray-400">AI Character Assistant</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:text-gray-300 transition">
                {isFullscreen ? "⊙" : "◎"}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsFullscreen(false);
                }}
                className="text-white hover:text-gray-300 transition">
                ✖
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <Message
                key={idx}
                content={msg.content}
                role={msg.role}
                mediaData={msg.mediaData}
              />
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#2a2a2a] bg-black">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 p-3 rounded-full bg-[#2a2a2a] text-white border-none focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-white text-black px-6 rounded-full hover:bg-gray-200 transition disabled:opacity-50">
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
