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
  console.log("Fetching image from S3:", { bucket, key });
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(command);

  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  const base64Image = Buffer.concat(chunks).toString("base64");
  console.log("Fetched image (base64 length):", base64Image.length);
  return base64Image;
}

export async function POST(request) {
  try {
    const { prompt, type, imagePath, walletId, characterId, profile } =
      await request.json();

    console.log("Received request:", {
      prompt,
      type,
      imagePath,
      walletId,
      characterId,
      profile,
    });

    let modelInput;

    switch (type) {
      case "reels":
        console.log("Processing reels generation...");
        modelInput = {
          taskType: "TEXT_VIDEO",
          textToVideoParams: { text: prompt },
          videoGenerationConfig: {
            durationSeconds: 3,
            fps: 24,
            dimension: "1280x720",
          },
        };
        break;

      case "existing-to-video":
        console.log("Processing existing-to-video...");
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
        console.log("Processing canvas image generation...");
        modelInput = {
          taskType: "TEXT_IMAGE",
          textToImageParams: { text: prompt },
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
        console.log("Processing existing-to-image...");
        modelInput = {
          taskType: "OUTPAINTING",
          outPaintingParams: {
            text: prompt,
            ...(imagePath && { image: await getImageFromS3(imagePath) }),
          },
          imageGenerationConfig: {
            numberOfImages: 1,
            height: 512,
            width: 512,
          },
        };
        break;

      case "existing-character-choice":
        console.log("Processing existing-character-choice...");
        modelInput = {
          taskType: "IMAGE_VARIATION",
          imageVariationParams: {
            text: prompt,
            images: [
              {
                format: "png",
                source: { bytes: await getImageFromS3(imagePath) },
              },
            ],
            similarityStrength: 0.7,
          },
          imageGenerationConfig: {
            numberOfImages: 1,
            height: 512,
            width: 512,
            cfgScale: 8.0,
          },
        };
        break;

      default:
        console.error("Invalid type received:", type);
        return NextResponse.json({ success: false, error: "Invalid type" });
    }

    console.log("Constructed modelInput:", JSON.stringify(modelInput, null, 2));

    if (type === "reels") {
      console.log("Sending request to Bedrock for reels...");
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

      console.log("Bedrock response for reels:", response);
      return NextResponse.json({ success: true, jobId: response.jobId });
    } else if (type === "canvas") {
      console.log("Sending request to Bedrock for canvas image generation...");
      const command = new InvokeModelCommand({
        modelId: "amazon.nova-canvas-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(modelInput),
      });

      const response = await bedrockClient.send(command);
      console.log("Bedrock response for canvas:", response);

      const responseData = JSON.parse(new TextDecoder().decode(response.body));
      console.log("Parsed responseData:", responseData);

      const base64Image = responseData.images[0];
      const imageBuffer = Buffer.from(base64Image, "base64");

      const fileName = `users/${walletId}/characters/${characterId}/generated-${Date.now()}.png`;
      console.log("Uploading generated image to S3:", fileName);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.CUSTOM_S3_BUCKET,
          Key: fileName,
          Body: imageBuffer,
          ContentType: "image/png",
        })
      );

      const imageUrl = `https://${process.env.CUSTOM_S3_BUCKET}.s3.${process.env.CUSTOM_AWS_REGION}.amazonaws.com/${fileName}`;
      console.log("Image successfully uploaded to S3:", imageUrl);

      return NextResponse.json({
        success: true,
        url: imageUrl,
        imageData: base64Image,
      });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}