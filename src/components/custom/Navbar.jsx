"use client";

import Link from "next/link";
import ConnectWallet from "./connect-wallet";

export default function Navbar() {
    return (
        <>
            <nav className="flex justify-between px-10 py-4">
                <Link href="/" className="text-2xl font-bold">
                    MemesDream
                </Link>
                <div>
                    <ConnectWallet />
                </div>
            </nav>
        </>
    )
}