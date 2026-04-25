import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

export const R2_ENABLED = Boolean(
  R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_ENDPOINT,
);

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (!R2_ENABLED) {
    throw new Error(
      "R2 is not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT.",
    );
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      // MinIO などローカル S3 互換ではパス形式 URL が必要
      forcePathStyle: true,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return cachedClient;
}

interface UploadParams {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}

export async function uploadToR2({
  key,
  body,
  contentType,
  cacheControl = "public, max-age=31536000, immutable",
}: UploadParams): Promise<string> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );

  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return `${R2_ENDPOINT!.replace(/\/$/, "")}/${R2_BUCKET_NAME}/${key}`;
}

export async function fetchFromR2(key: string): Promise<{ body: Uint8Array<ArrayBuffer>; contentType: string } | null> {
  if (!R2_ENABLED) return null;
  try {
    const client = getClient();
    const response = await client.send(
      new GetObjectCommand({ Bucket: R2_BUCKET_NAME!, Key: key }),
    );
    if (!response.Body) return null;
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    // new Uint8Array(length) allocates a concrete ArrayBuffer (not SharedArrayBuffer),
    // making the result assignable to BlobPart / BodyInit in TypeScript 5.7+.
    const totalLength = chunks.reduce((sum, c) => sum + c.byteLength, 0);
    const body = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { body, contentType: response.ContentType ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

interface UploadBlogImageParams {
  userId: string;
  buffer: Buffer;
  mimeType: string;
  ext: string;
}

export async function uploadBlogImage({
  userId,
  buffer,
  mimeType,
  ext,
}: UploadBlogImageParams): Promise<string> {
  const hash = createHash("sha1").update(buffer).digest("hex").slice(0, 12);
  const key = `images/${userId}/${hash}.${ext}`;
  return uploadToR2({ key, body: buffer, contentType: mimeType });
}
