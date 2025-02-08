"use client";

import { useState } from "react";

export default function ConnectWallet() {
    const [walletAddress, setWalletAddress] = useState(null);
    const handleConnectWallet = async () => {
        try {
            const response = await fetch("/api/privy", {
                method: "GET",
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
    };

    return (
        <>
            <button className="text-background bg-foreground px-4 py-2 rounded-lg hover:bg-[#3b3b3b]" 
            onClick={handleConnectWallet}
            disabled={!!walletAddress}>
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
            </button>
        </>
    )
}