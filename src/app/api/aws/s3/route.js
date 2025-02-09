import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.CUSTOM_AWS_REGION,
  credentials: {
    accessKeyId: process.env.CUSTOM_AWS_ACCESS_KEY,
    secretAccessKey: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET(request) {
    try {
      const { searchParams } = new URL(request.url);
      const walletId = searchParams.get('walletId');
      
      if (!walletId) {
        return NextResponse.json({ 
          success: false, 
          error: 'Wallet ID required' 
        }, { status: 400 });
      }
  
      const command = new ListObjectsV2Command({
        Bucket: process.env.CUSTOM_S3_BUCKET,
        Prefix: `users/${walletId}/characters/`,
      });
  
      const response = await s3Client.send(command);
      
      // Group files by character
      const characters = {};
      
      response.Contents?.forEach(item => {
        const path = item.Key;
        const characterId = path.split('/')[3]; // users/walletId/characters/characterId/...
        
        if (!characters[characterId]) {
          characters[characterId] = {
            id: characterId,
            mainImage: null,
            twitterPosts: []
          };
        }
  
        const pathParts = path.split('/');
        if (pathParts.length === 5) {  // users/walletId/characters/characterId
          characters[characterId].mainImage = {
            path,
            url: `https://${process.env.CUSTOM_S3_BUCKET}.s3.${process.env.CUSTOM_AWS_REGION}.amazonaws.com/${path}`
          };
        } else if (path.includes('/twitter/')) {
          characters[characterId].twitterPosts.push({
            path,
            url: `https://${process.env.CUSTOM_S3_BUCKET}.s3.${process.env.CUSTOM_AWS_REGION}.amazonaws.com/${path}`
          });
        }
      });
  
      return NextResponse.json({ 
        success: true, 
        characters: Object.values(characters)
      });
  
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
  }

export async function POST(request) {
  try {
    const formData = await request.formData();
    const character = formData.get('character');
    const type = formData.get('type'); // 'main' or 'twitter'
    const file = formData.get('file');
    const walletId = formData.get('walletId');

    if (!character || !type || !file) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const contentType = file.type;

    // Construct S3 path based on content type and category
    const s3Path = `users/${walletId}/characters/${character}/${type}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.CUSTOM_S3_BUCKET,
      Key: s3Path,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      path: s3Path,
      url: `https://${process.env.CUSTOM_S3_BUCKET}.s3.${process.env.CUSTOM_AWS_REGION}.amazonaws.com/${s3Path}`
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
    try {
        const data = await request.json();
        const { url } = data;

        if (!url) {
            return NextResponse.json({ 
                success: false, 
                error: 'URL required' 
            }, { status: 400 });
        }

        // Extract the key from the full S3 URL
        const key = url.split('.amazonaws.com/')[1];

        const command = new DeleteObjectCommand({
            Bucket: process.env.CUSTOM_S3_BUCKET,
            Key: key
        });

        await s3Client.send(command);

        return NextResponse.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}