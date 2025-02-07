"use client";

import Image from "next/image";
import clsx from "clsx";
import { useRouter } from "next/navigation";

export default function ProjectTabs() {
    const router =  useRouter();

    return (
        <>
            <div className="space-y-6">
                {data.map((project) => (
                    <div key={project.id} className="w-full border px-4 hover:cursor-pointer py-2 hover:bg-slate-100 rounded-[16px]" onClick={() => router.push(`/projects/${project.id}`)}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                            {/* Project Image */}
                            <div className="w-20 h-20 object-contain relative">
                                <Image 
                                    src={project.projectImage}
                                    alt={project.projectImageAlt}
                                    fill
                                    objectFit="contain"
                                    className="rounded-full"
                                />
                            </div>
                            {/* Details */}
                            <div className="flex flex-col">
                                <div className="flex gap-2 items-center justify-center">
                                    <h3 className="font-bold">{project.projectTitle}</h3>
                                    <p className="text-[12px]">{project.projectToken}</p>
                                </div>
                                <a href={`https://etherscan.io/address/${project.contractAddress}`} target="_blank" className="text-gray-400 hover:text-gray-600 text-[14px]">{project.contractAddress}</a>
                            </div>
                            </div>
                            
                            {/* Status */}
                            <span 
                            className={clsx(
                                "px-3 py-1 rounded-full text-sm font-bold",
                                project.status === "ACTIVE" 
                                    ? "text-green-700 bg-green-100" 
                                    : "text-red-700 bg-red-100"
                                )}
                            >
                                {project.status}
                            </span>
                        </div>
                        
                    </div>
                ))}
            </div>
        </>
    )
}

const data = [
    {
        id: 1,
        projectTitle: "Pussy Coin",
        projectToken: "$PUSSY",
        contractAddress: "0x1234567890",
        projectImage: "https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg",
        projectImageAlt: "What's up bro",
        twitterLink: "https://x.com/LaiVandyck",
        status: "ACTIVE",
    },
    {
        id: 2,
        projectTitle: "PEPE WAGON",
        projectToken: "$PEPEWG",
        contractAddress: "0x1234567890",
        projectImage: "https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg",
        projectImageAlt: "What's up bro",
        twitterLink: "https://x.com/LaiVandyck",
        status: "INACTIVE",
    },
    {
        id: 3,
        projectTitle: "SIMP COIN",
        projectToken: "$SIMP",
        contractAddress: "0x1234567890",
        projectImage: "https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg",
        projectImageAlt: "What's up bro",
        twitterLink: "https://x.com/LaiVandyck",
        status: "ACTIVE"
    },
]