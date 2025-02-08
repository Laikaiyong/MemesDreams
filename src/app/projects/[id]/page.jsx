"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Navbar from "../../../components/custom/Navbar";
import ChatBubble from "../../../components/custom/chat-bubble";
import DeployContractButton from "../../../components/custom/deploy-contract";

function TweetPost({ post }) {
  const filename = post.path.split("/").pop().split(".")[0];
  const caption = decodeURIComponent(filename.replace(/-/g, " "));

  const handleTwitterShare = () => {
    const cleanedCaption = caption.trim().replace(/\s+/g, " ");
    const tweetText = encodeURIComponent(cleanedCaption);
    const tweetUrl = encodeURIComponent(post.url.replace(/\s+/g, "%20"));
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex gap-4">
        <div className="w-32 h-32 relative flex-shrink-0">
          {post.type === "video" ? (
            <video controls className="w-full h-full rounded-lg object-cover">
              <source src={post.url} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={post.url}
              alt={caption}
              width={128}
              height={128}
              className="rounded-lg object-cover"
            />
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <p className="text-sm text-gray-700">{caption}</p>
          <div className="flex justify-end">
            <button
              onClick={handleTwitterShare}
              className="bg-black text-white px-4 py-2 rounded-full hover:bg-zinc-800 transition flex items-center gap-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const projectId = Number(id);
  // const project = projectsData.find((p) => p.id === projectId);

  useEffect(() => {
    const fetchCharacter = async () => {
      const walletId = localStorage.getItem("walletId");
      try {
        const response = await fetch(
          `/api/aws/s3/specific?walletId=${walletId}&characterId=${id}`
        );
        const data = await response.json();
        if (data.success) {
          setCharacter(data.character);
          console.log("Overall Data:", data);
        }
      } catch (error) {
        console.error("Error fetching character:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col px-10">
        <Navbar />
        <div className="flex-grow flex w-full mx-auto gap-6 mt-6">
          <div className="border flex-grow p-4 rounded-[16px] text-center">
            Loading...
          </div>
        </div>
      </main>
    );
  }

  if (!character) {
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
          <div className="border flex-grow p-4 rounded-[16px]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 relative">
                  <Image
                    src={character ? character.mainImage.url : ""}
                    alt={character ? character.id : ""}
                    fill
                    className="rounded-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex gap-2 items-center">
                    <h3 className="font-bold">
                      {character ? `Character #${character.id}` : ""}
                    </h3>
                  </div>
                  {character && (
                    <a
                      href={`https://sepolia.etherscan.io/address/${character.id}`}
                      target="_blank"
                      className="text-gray-400 hover:text-gray-600 text-[14px] flex items-center">
                      {character.id.substring(0, 6)}...
                      {character.id.substring(character.id.length - 4)}
                      <Image
                        src="https://cdn.worldvectorlogo.com/logos/etherscan-1.svg"
                        width={16}
                        height={16}
                        alt="Etherscan"
                        className="ml-2"
                      />
                    </a>
                  )}
                </div>
              </div>
              <div>
                <DeployContractButton
                  name={character?.id.split("-")[0]}
                  symbol={character?.id.split("-")[1]}
                  image={character?.mainImage.url}
                />
              </div>
            </div>

            <div className="w-full h-[1px] bg-gray-300 my-6" />

            <h1 className="text-[20px] font-bold ml-2">Recent Posts</h1>
            <div className="space-y-4">
              {character?.twitterPosts.map((post) => (
                <TweetPost key={post.url} post={post} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 w-[30%]">
            <ChatBubble characterId={id} />
            <div className="rounded-[16px] border p-4">
              <h2 className="font-bold py-2">
                {character ? "Character Stats" : "Token Distribution"}
              </h2>
              {character ? (
                <div className="text-sm text-gray-500">
                  <p>Total Posts: {character.twitterPosts.length}</p>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
