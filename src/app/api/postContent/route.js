import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const content = body.content;

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const {
            TWITTER_API_KEY,
            TWITTER_API_SECRET,
            TWITTER_ACCESS_TOKEN,
            TWITTER_ACCESS_SECRET,
        } = process.env;

        if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
            return NextResponse.json(
                { error: "Twitter API keys are not set in environment variables" },
                { status: 500 }
            );
        }

        // Import the TwitterApi class dynamically to avoid initialization issues
        const { TwitterApi } = await import("twitter-api-v2");

        const client = new TwitterApi({
            appKey: TWITTER_API_KEY,
            appSecret: TWITTER_API_SECRET,
            accessToken: TWITTER_ACCESS_TOKEN,
            accessSecret: TWITTER_ACCESS_SECRET,
        });

        const tweet = await client.v2.tweet(content);

        return NextResponse.json({ message: "Tweet posted successfully", tweet }, { status: 200 });
    } catch (error) {
        console.error("Error posting tweet:", error);
        return NextResponse.json({ error: "Failed to post tweet", details: error.message }, { status: 500 });
    }
}
