"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProjectTabs() {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      const walletId = localStorage.getItem('walletId');
      if (!walletId) return;

      try {
        const response = await fetch(`/api/aws/s3?walletId=${walletId}`);
        const data = await response.json();
        if (data.success) {
          setCharacters(data.characters);
        }
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse">Loading characters...</div>;
  }

return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
            <div 
                key={character.id}
                className="border rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => window.location.href = `/projects/${character.id}`}
            >
                {character.mainImage && (
                    <div className="relative w-full h-48 mb-4">
                        <Image
                            src={character.mainImage.url}
                            alt={character.id}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain rounded-lg"
                        />
                    </div>
                )}
                <h3 className="text-lg font-semibold">
                    {character.id}
                </h3>
                <p className="text-sm text-gray-500">
                    {character.twitterPosts.length} Twitter posts
                </p>
            </div>
        ))}
    </div>
);
}