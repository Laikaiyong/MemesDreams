import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  StartAsyncInvokeCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from "next/server";

// AWS Clients
const s3Client = new S3Client({
  region: process.env.CUSTOM_AWS_REGION,
  credentials: {
    accessKeyId: process.env.CUSTOM_AWS_ACCESS_KEY,
    secretAccessKey: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY,
  },
});

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.CUSTOM_AWS_REGION,
  credentials: {
    accessKeyId: process.env.CUSTOM_AWS_ACCESS_KEY,
    secretAccessKey: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY,
  },
});

async function getImageFromS3(bucket, key) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(command);
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("base64");
}

export async function POST(request) {
  try {
    const { prompt, type, imagePath, walletId, characterId, profile } =
      await request.json();

    let modelInput;
    switch (type) {
      case "reels":
        modelInput = {
          taskType: "TEXT_VIDEO",
          textToVideoParams: {
            text: prompt,
          },
          videoGenerationConfig: {
            durationSeconds: 3,
            fps: 24,
            dimension: "1280x720",
          },
        };
        break;

      case "existing-to-video":
        modelInput = {
          taskType: "TEXT_VIDEO",
          textToVideoParams: {
            text: prompt,
            images: [
              {
                format: "png",
                source: { bytes: await getImageFromS3(imagePath) },
              },
            ],
          },
          videoGenerationConfig: {
            durationSeconds: 3,
            fps: 24,
            dimension: "1280x720",
          },
        };
        break;

      case "canvas":
        modelInput = {
          taskType: "TEXT_IMAGE",
          textToImageParams: {
            text: prompt,
          },
          imageGenerationConfig: {
            numberOfImages: 1,
            height: 1024,
            width: 1024,
            cfgScale: 8.0,
            seed: 0,
          },
        };
        break;
      case "existing-to-image":
        modelInput = {
          taskType: "OUTPAINTING",
          outPaintingParams: {
            text: prompt,
            ...(imagePath && {
              image: await getImageFromS3(imagePath),
            }),
          },
          imageGenerationConfig: {
            numberOfImages: 1,
            height: 512,
            width: 512,
          },
        };
        break;
      case "existing-character-choice":
        modelInput = {
          taskType: "IMAGE_VARIATION",
          imageVariationParams: {
            text: prompt,
            images: [
              {
          format: "png",
          source: { bytes: await getImageFromS3(imagePath) }
              }
            ],
            similarityStrength: 0.7 // Range: 0.2 to 1.0
          },
          imageGenerationConfig: {
            numberOfImages: 1,
            height: 512,
            width: 512,
            cfgScale: 8.0
          }
        };
    }

    if (type === "reels") {
      const response = await bedrockClient.send(
        new StartAsyncInvokeCommand({
          modelId: "amazon.nova-reel-v1:0",
          contentType: "application/json",
          accept: "application/json",
          modelInput: JSON.stringify(modelInput),
          outputDataConfig: {
            s3OutputDataConfig: {
              s3Uri: `s3://${process.env.CUSTOM_S3_OUTPUT_BUCKET}/users/${walletId}/characters/${characterId}/twitter/`,
            },
          },
        })
      );

      return NextResponse.json({
        success: true,
        jobId: response.jobId,
      });
    } else if (type === "canvas") {
      const command = new InvokeModelCommand({
        modelId: "amazon.nova-canvas-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(modelInput),
      });

      const response = await bedrockClient.send(command);
      const responseData = JSON.parse(new TextDecoder().decode(response.body));

      // Get base64 image from response
      const base64Image = responseData.images[0];
      const imageBuffer = Buffer.from(base64Image, "base64");

      // Upload to S3
      const fileName = `users/${walletId}/characters/${characterId}/generated-${Date.now()}.png`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.CUSTOM_S3_BUCKET,
          Key: fileName,
          Body: imageBuffer,
          ContentType: "image/png",
        })
      );

      // Return S3 URL
      const imageUrl = `https://${process.env.CUSTOM_S3_BUCKET}.s3.${process.env.CUSTOM_AWS_REGION}.amazonaws.com/${fileName}`;

      return NextResponse.json({
        success: true,
        url: imageUrl,
        imageData: base64Image,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
