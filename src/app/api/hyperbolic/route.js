import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt } = body;
    
    const url = "https://api.hyperbolic.xyz/v1/chat/completions";
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HYPERBOLIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 512,
        temperature: 0.1,
        top_p: 0.9,
        stream: false
      }),
    });

    const json = await response.json();
    const output = json.choices[0].message.content;

    return NextResponse.json({
      success: true,
      result: output
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}