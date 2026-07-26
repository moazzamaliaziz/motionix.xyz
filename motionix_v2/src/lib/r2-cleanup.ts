/**

 * Server-side helpers for listing-deleting stale R2 objects.
 *
 * Why not just rely on Cloudflare's R2 object lifecycle?
 *   - R2 lifecycle policies (Object Lifecycle Rules) were still rolling out
 *     in early forms during 2025-26. Even now, listing-then-deleting gives
 *     us observable metrics and a chance to charge users if we ever want to.
 *   - We rely on this endpoint as a fallback so that a missing or delayed
 *     R2 rule doesn't leak storage.
 *
 * Called from /api/admin/cleanup (cron-gated).
 */

import "server-only";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { r2Client, r2Bucket, isR2Enabled } from "@/lib/r2-server";

const DEFAULT_MAX_AGE_HOURS = 24;
const DELETE_BATCH_LIMIT = 1000;

export type CleanupScanResult = {
  scanned: number;
  deleted: number;
  kept: number;
  errors: number;
  cutoffIso: string;
  maxAgeHours: number;
  dryRun: boolean;
  durationMs: number;
};

/**
 * Walk the bucket, find objects older than `maxAgeHours`, delete them in
 * batches. Returns a small summary for the cron caller.
 *
 * Pagination: ListObjectsV2 returns up to 1000 keys per page; we loop until
 * `IsTruncated` is false. Each "page" we shard old keys into delete batches
 * of 1000 (R2 / S3 limit per DeleteObjects call).
 *
 * Auth: callers must set the `x-cron-secret` header to `process.env.CRON_SECRET`.
 * Returns 401 otherwise.
 */
export async function runR2Cleanup(opts: {
  maxAgeHours?: number;
  dryRun?: boolean;
} = {}): Promise<CleanupScanResult> {
  if (!isR2Enabled()) {
    return {
      scanned: 0,
      deleted: 0,
      kept: 0,
      errors: 0,
      cutoffIso: new Date().toISOString(),
      maxAgeHours: opts.maxAgeHours ?? DEFAULT_MAX_AGE_HOURS,
      dryRun: opts.dryRun ?? false,
      durationMs: 0,
    };
  }

  const started = Date.now();
  const maxAgeHours = opts.maxAgeHours ?? DEFAULT_MAX_AGE_HOURS;
  const dryRun = opts.dryRun ?? false;

  const cutoffMs = Date.now() - maxAgeHours * 60 * 60 * 1000;
  const cutoffIso = new Date(cutoffMs).toISOString();

  const client = r2Client();
  if (!client) {
    return {
      scanned: 0,
      deleted: 0,
      kept: 0,
      errors: 0,
      cutoffIso,
      maxAgeHours,
      dryRun,
      durationMs: Date.now() - started,
    };
  }

  let continuationToken: string | undefined;
  let scanned = 0;
  let deleted = 0;
  let kept = 0;
  let errors = 0;

  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: r2Bucket(),
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      }),
    );
    const items = list.Contents ?? [];
    scanned += items.length;

    const old = items.filter((it) => {
      if (!it.LastModified) return false;
      return it.LastModified.getTime() < cutoffMs;
    });
    kept += items.length - old.length;

    if (old.length > 0 && !dryRun) {
      // shard into batches of 1000 max
      for (let i = 0; i < old.length; i += DELETE_BATCH_LIMIT) {
        const batch = old.slice(i, i + DELETE_BATCH_LIMIT);
        try {
          const res = await client.send(
            new DeleteObjectsCommand({
              Bucket: r2Bucket(),
              Delete: {
                Objects: batch.map((it) => ({ Key: it.Key! })),
                Quiet: false,
              },
            }),
          );
          deleted += res.Deleted?.length ?? 0;
          errors += res.Errors?.length ?? 0;
        } catch (e) {
          console.warn("[r2-cleanup] batch failed", e);
          errors += batch.length;
        }
      }
    } else if (old.length > 0 && dryRun) {
      deleted += old.length;
    }

    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (continuationToken);

  return {
    scanned,
    deleted,
    kept,
    errors,
    cutoffIso,
    maxAgeHours,
    dryRun,
    durationMs: Date.now() - started,
  };
}
