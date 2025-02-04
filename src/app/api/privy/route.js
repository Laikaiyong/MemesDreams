import { PrivyClient } from '@privy-io/server-auth';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Initialize Privy client
        const privy = new PrivyClient(
            process.env.PRIVY_APP_ID,
            process.env.PRIVY_APP_SECRET
        );

        // Create a new wallet
        const { id, address, chainType } = await privy.walletApi.create({
            chainType: 'ethereum'
        });

        // Return the wallet information
        return NextResponse.json({
            success: true,
            wallet: {
                id,
                address,
                chainType
            }
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}