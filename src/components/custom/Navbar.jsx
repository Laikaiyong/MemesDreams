"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <>
            <nav className="flex justify-between px-10 py-4">
                <Link href="/" className="text-2xl font-bold">
                    MemesDream
                </Link>
                <button className="text-background bg-foreground px-4 py-2 rounded-lg hover:bg-[#3b3b3b]">
                    Connect Wallet
                </button>
            </nav>
        </>
    )
}