'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [userAddress, setUserAddress] = useState(null);
  const [characters, setCharacters] = useState([]);

  const addCharacter = async (character) => {
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress, character })
      });
      if (response.ok) {
        setCharacters(prev => [...prev, character]);
      }
    } catch (error) {
      console.error('Error adding character:', error);
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetch(`/api/characters?address=${userAddress}`)
        .then(res => res.json())
        .then(data => setCharacters(data.characters));
    }
  }, [userAddress]);

  return (
    <AuthContext.Provider value={{ userAddress, characters, setUserAddress, addCharacter }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};