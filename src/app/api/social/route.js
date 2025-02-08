import { NextResponse } from "next/server";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

export async function POST(request) {
  try {
    const { character, type } = await request.json();
    
    const bedrock = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });

    // Generate content based on character and type
    const response = await bedrock.invoke({
      modelId: type === 'video' ? 'amazon.nova-reel-v1:0' : 'amazon.nova-canvas-v1:0',
      input: {
        prompt: `Generate social media content for character: ${character}`,
        maxTokens: 1000
      }
    });

    return NextResponse.json({
      success: true,
      content: response.output,
      type: type
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}