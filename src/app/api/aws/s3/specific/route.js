import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');
    const characterId = searchParams.get('characterId');

    if (!walletId || !characterId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wallet ID and character ID required' 
      }, { status: 400 });
    }

    const command = new ListObjectsV2Command({
      Bucket: process.env.CUSTOM_S3_BUCKET,
      Prefix: `users/${walletId}/characters/${characterId}/`,
    });

    const response = await s3Client.send(command);
    
    const character = {
      id: characterId,
      mainImage: null,
      twitterPosts: []
    };

    response.Contents?.forEach(item => {
      const path = item.Key;
      const url = `https://${process.env.CUSTOM_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`;

      const pathParts = path.split('/');
      if (pathParts.length === 5) {  // users/walletId/characters/characterId
        character.mainImage = {
          path,
          url: `https://${process.env.CUSTOM_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`
        };
      } else if (path.includes('/twitter/')) {
        character.twitterPosts.push({
          path,
          url,
          type: path.endsWith('.mp4') ? 'video' : 'image'
        });
      }
    });

    return NextResponse.json({ success: true, character });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}