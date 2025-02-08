import { PrivyClient } from '@privy-io/server-auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const storedWalletId = body.storedWalletId;

        const privy = new PrivyClient(
            process.env.PRIVY_APP_ID,
            process.env.PRIVY_APP_SECRET
        );

        let wallet;

        if (storedWalletId) {
            try {
                wallet = await privy.walletApi.getWallet({ id: storedWalletId });
            } catch (error) {
                wallet = await privy.walletApi.create({
                    chainType: 'ethereum'
                });
            }
        } else {
            wallet = await privy.walletApi.create({
                chainType: 'ethereum'
            });
        }
        return NextResponse.json({
            success: true,
            wallet: {
                id: wallet.id,
                address: wallet.address,
                chainType: wallet.chainType
            }
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}