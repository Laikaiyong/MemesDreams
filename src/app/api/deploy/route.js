import { NextResponse } from "next/server";
const { ethers } = require("ethers");
const FormData = require('form-data');
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

// Helper function to upload to IPFS (implement according to your IPFS solution)
async function uploadToIPFS(data) {
    try {
        const client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
        
        // Handle different types of data
        let file;
        if (data instanceof File) {
            file = data;
        } else if (typeof data === 'string') {
            file = new File([data], 'metadata.json', { type: 'application/json' });
        } else if (data instanceof FormData) {
            file = await data.get('file');
        } else {
            throw new Error('Invalid data format for IPFS upload');
        }

        // Upload to IPFS
        const cid = await client.put([file]);
        return cid;
    } catch (error) {
        console.error('IPFS upload error:', error);
        throw new Error('Failed to upload to IPFS');
    }
}

// Updated POST function
export async function POST(request) {
    try {
        const formData = await request.formData();
        const action = formData.get('action');
        const name = formData.get('name');
        const symbol = formData.get('symbol');
        const initialSupply = formData.get('initialSupply');
        const image = formData.get('image');

        // Initialize Thirdweb SDK for Scroll Sepolia
        const sdk = ThirdwebSDK.fromPrivateKey(
            process.env.PRIVATE_KEY,
            "sepolia"
        );

        switch (action) {
            case "deployToken":
                const tokenContract = await sdk.deployer.deployToken({
                    name: name,
                    symbol: symbol,
                    primary_sale_recipient: process.env.WALLET_ADDRESS,
                    initialSupply: initialSupply
                });

                return NextResponse.json({
                    success: true,
                    contractAddress: tokenContract.address,
                    name,
                    symbol,
                    initialSupply
                });

            case "deployNFT":
                const nftContract = await sdk.deployer.deployNFTCollection({
                    name: name,
                    symbol: symbol,
                    primary_sale_recipient: process.env.WALLET_ADDRESS,
                });

                return NextResponse.json({
                    success: true,
                    contractAddress: nftContract.address,
                    name,
                    symbol
                });

            default:
                return NextResponse.json({ 
                    success: false, 
                    error: "Invalid action specified" 
                }, { status: 400 });
        }

    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}