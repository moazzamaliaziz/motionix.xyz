import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getHistoryCollection } from "@/lib/mongo-server";
import { isAuthEnabled } from "@/components/motionix/auth/AuthShell";
import type { HistoryEntry } from "@/lib/history";

export const dynamic = "force-dynamic";

/**
 * History API
 *   GET    /api/history        — list items for the current user
 *   POST   /api/history        — insert a new item (body = partial HistoryEntry)
 *   DELETE /api/history?id=X   — remove an item by id
 *
 * When Clerk is unconfigured or Mongo isn't set, returns sensible fallbacks.
 */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = await resolveUserId(url.searchParams.get("userId"));
  if (!userId) return NextResponse.json({ items: [] });
  const col = await getHistoryCollection();
  if (!col) return NextResponse.json({ items: [] });
  const items = await col.find({ userId }).sort({ createdAt: -1 }).limit(200).toArray();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && !isAuthEnabled()) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 403 });
  }
  let body: Partial<HistoryEntry>;
  try {
    body = (await req.json()) as Partial<HistoryEntry>;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const userId = await resolveUserId(body.userId ?? null);
  if (!userId) return NextResponse.json({ ok: false, reason: "no_user" });
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    userId,
    tool: body.tool ?? "unspecified",
    filename: body.filename ?? "",
    inputSize: body.inputSize ?? 0,
    outputSize: body.outputSize ?? 0,
    inputSha: body.inputSha,
    resultWidth: body.resultWidth,
    resultHeight: body.resultHeight,
    description: body.description ?? "",
    thumbnailDataUrl: body.thumbnailDataUrl,
    createdAt: Date.now(),
  };
  const col = await getHistoryCollection();
  if (!col) return NextResponse.json({ ok: false, reason: "no_storage" });
  await col.insertOne(entry);
  return NextResponse.json(entry);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const userId = await resolveUserId(null);
  if (!userId) return NextResponse.json({ ok: false });
  const col = await getHistoryCollection();
  if (!col) return NextResponse.json({ ok: false, reason: "no_storage" });
  await col.deleteOne({ id, userId });
  return NextResponse.json({ ok: true });
}

async function resolveUserId(provided: string | null): Promise<string | null> {
  if (!isAuthEnabled()) {
    // Guest mode — accept the client-provided userId (which is just "guest").
    return provided ?? "guest";
  }
  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}
