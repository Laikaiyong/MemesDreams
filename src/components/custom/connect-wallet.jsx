"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth-provider";

export default function ConnectWallet() {
    const [walletAddress, setWalletAddress] = useState(null);
    
    useEffect(() => {
        const checkStoredWallet = async () => {
            const storedWallet = localStorage.getItem('walletId');
            if (storedWallet) {
                await handleConnectWallet(storedWallet);
            }
        };
        checkStoredWallet();
    }, []);

    const handleConnectWallet = async (storedWalletId = null) => {
        if (!storedWalletId) {
            try {
            const response = await fetch("/api/privy", {
                method: "POST",
                headers: {
                'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error("Failed to connect wallet");
            }

            const data = await response.json();

            if (data.success && data.wallet?.address) {
                setWalletAddress(data.wallet.address);
                localStorage.setItem('walletId', data.wallet.id);
            }
            } catch (error) {
            console.error("Error connecting wallet:", error);
            }
        } else {
            try {
            const response = await fetch("/api/privy", {
                method: "POST",
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ storedWalletId })
            });

            if (!response.ok) {
                throw new Error("Failed to connect wallet");
            }

            const data = await response.json();

            if (data.success && data.wallet?.address) {
                setWalletAddress(data.wallet.address);
            }
            } catch (error) {
            console.error("Error connecting wallet:", error);
            }
        }
    };

    return (
        <>
            <button 
                className="text-background bg-foreground px-4 py-2 rounded-lg hover:bg-[#3b3b3b]" 
                onClick={() => handleConnectWallet()}
                disabled={!!walletAddress}
            >
                {walletAddress ? 
                    `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
                    "Connect Wallet"
                }
            </button>
        </>
    );
}