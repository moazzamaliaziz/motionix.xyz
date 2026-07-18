import "server-only";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { lookup as dnsLookup } from "node:dns/promises";

/**
 * Server-side Cloudflare R2 client + lifecycle helpers.
 *
 * R2 — like Cloudflare's other services — is S3-compatible. We lean on
 * the AWS SDK to issue presigned PUT / GET URLs and to remove objects.
 *
 * Why a 24-hour TTL on every object?
 *   - The free tier covers 10 GB / 1M ops / month; aggressive cleanup keeps
 *     us well under it.
 *   - Tools that need durable storage fall back to the user's device, so a
 *     short server-side window is enough for the
 *     "transform on the server, hand back a download link" pattern.
 *
 * Public-read base is optional. With a custom Cloudflare domain you can
 * expose assets directly. Without it we always issue signed GET URLs.
 */

let cached: S3Client | null = null;

export function isR2Enabled(): boolean {
  return Boolean(
    process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_BUCKET,
  );
}

function getEndpoint(): string {
  const id = process.env.R2_ACCOUNT_ID;
  return `https://${id}.r2.cloudflarestorage.com`;
}

export function r2Client(): S3Client | null {
  if (!isR2Enabled()) return null;
  if (cached) return cached;
  cached = new S3Client({
    region: "auto",
    endpoint: getEndpoint(),
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
  return cached;
}

export function r2Bucket(): string {
  return process.env.R2_BUCKET ?? "motionix-uploads";
}

export type UploadPlan = {
  /** Object key (without leading slash) */
  key: string;
  /** Signed PUT URL the browser can POST to */
  uploadUrl: string;
  /** Optional public-read URL. Null if no public base configured */
  publicUrl: string | null;
  /** Seconds until the PUT URL expires */
  expiresInSec: number;
  /** Best-effort reachable host for content-security restrictions */
  endpoint: string;
};

const TTL_SECONDS_FOR_UPLOAD = 60 * 5;        // 5 minutes to upload
const TTL_SECONDS_FOR_DOWNLOAD = 60 * 60 * 24; // 24 hours to download

/**
 * Generate a signed PUT URL scoped to a folder/key.
 *
 * Caller is responsible for:
 *   - putting `<userId>/<timestamp>-<random>` style scoping on the key.
 *   - validating the user id via Clerk (if authenticated mode is enabled).
 */
export async function issueUpload(opts: {
  key: string;
  contentType: string;
  contentLengthBytes: number;
}): Promise<UploadPlan | null> {
  if (!isR2Enabled()) return null;
  const client = r2Client();
  if (!client) return null;

  const cmd = new PutObjectCommand({
    Bucket: r2Bucket(),
    Key: opts.key,
    ContentType: opts.contentType,
    ContentLength: opts.contentLengthBytes,
    CacheControl: "private, max-age=0, no-cache",
  });
  const url = await getSignedUrl(client, cmd, { expiresIn: TTL_SECONDS_FOR_UPLOAD });
  const publicBase = process.env.R2_PUBLIC_BASE;
  const publicUrl = publicBase ? `${publicBase.replace(/\/$/, "")}/${opts.key}` : null;

  return {
    key: opts.key,
    uploadUrl: url,
    publicUrl,
    expiresInSec: TTL_SECONDS_FOR_UPLOAD,
    endpoint: getEndpoint(),
  };
}

/**
 * Generate a signed GET URL for an object that just landed. The TTL is 24h —
 * long enough to deliver, short enough to be safe.
 */
export async function issueDownload(key: string): Promise<{ url: string; expiresInSec: number } | null> {
  if (!isR2Enabled()) return null;
  const client = r2Client();
  if (!client) return null;

  const cmd = new GetObjectCommand({ Bucket: r2Bucket(), Key: key });
  const url = await getSignedUrl(client, cmd, { expiresIn: TTL_SECONDS_FOR_DOWNLOAD });
  return { url, expiresInSec: TTL_SECONDS_FOR_DOWNLOAD };
}

/**
 * Remove a single object — useful for "Start over" / rollback in the upload UI.
 */
export async function r2Delete(key: string): Promise<boolean> {
  if (!isR2Enabled()) return false;
  const client = r2Client();
  if (!client) return false;
  try {
    await client.send(new DeleteObjectCommand({ Bucket: r2Bucket(), Key: key }));
    return true;
  } catch (e) {
    console.warn("[r2] delete failed", e);
    return false;
  }
}

/**
 * Best-effort DNS guard. We block upload issuance to endpoint hosts that
 * haven't resolved — saves a slow-failing PUT later. Whitelisting is the
 * `isR2Enabled()` env check; this is just a sanity check.
 */
export async function probeR2Host(): Promise<{ ok: boolean; error?: string }> {
  if (!isR2Enabled()) return { ok: false, error: "r2_disabled" };
  try {
    const host = new URL(getEndpoint()).hostname;
    await dnsLookup(host);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "dns_failed" };
  }
}

/**
 * Bulk delete — used by the lifecycle cron.
 */
export async function r2DeleteMany(keys: string[]): Promise<{ deleted: number; errors: number }> {
  if (!isR2Enabled() || keys.length === 0) return { deleted: 0, errors: 0 };
  const client = r2Client();
  if (!client) return { deleted: 0, errors: 0 };
  let deleted = 0;
  let errors = 0;
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000).map((Key) => ({ Key }));
    try {
      const res = await client.send(
        new DeleteObjectsCommand({ Bucket: r2Bucket(), Delete: { Objects: batch } }),
      );
      deleted += (res.Deleted?.length ?? 0);
      errors += (res.Errors?.length ?? 0);
    } catch (e) {
      console.warn("[r2] batch delete failed", e);
      errors += batch.length;
    }
  }
  return { deleted, errors };
}
