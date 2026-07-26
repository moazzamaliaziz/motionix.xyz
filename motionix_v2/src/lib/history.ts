/**
 * History layer — Phase 3.
 *
 * Two-tier backend:
 *   - In-session: sessionStorage on the client (no auth required, no server).
 *   - Persisted: via `/api/history/*` server API + MongoDB when configured.
 *
 * When no Clerk publishable key is set or no MongoDB URI is set, the API
 * routes return empty + the client falls back to sessionStorage. This keeps
 * the build green on every dev mode without any external services.
 *
 * Privacy posture: the persisted record carries a 240×240 thumbnail data
 * URL (≤ 80 KB), not the photo. The user can delete entries at any time.
 */

export type HistoryEntry = {
  id: string;
  userId: string;
  tool: string;
  filename: string;
  inputSize: number;
  outputSize: number;
  /** sha-256 of the input bytes, optional */
  inputSha?: string;
  resultWidth?: number;
  resultHeight?: number;
  description: string;
  thumbnailDataUrl?: string;
  createdAt: number;
};

const SS_KEY = "motionix.history.session.v1";

function readSession(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(SS_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeSession(items: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SS_KEY, JSON.stringify(items.slice(0, 200)));
  } catch {}
}

/**
 * Save history — POSTs to the server API when reachable. Always inserts into
 * sessionStorage as a fallback so the tool feels instant.
 */
export async function saveHistory(entry: Omit<HistoryEntry, "id" | "createdAt">): Promise<HistoryEntry> {
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  writeSession([full, ...readSession()]);

  try {
    const res = await fetch("/api/history", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      const stored = (await res.json()) as HistoryEntry;
      // Replace the temp entry's id with the server-returned one if present.
      return stored.id ? stored : full;
    }
  } catch {
    /* ignore — session fallback already in place */
  }
  return full;
}

export async function listHistory(userId: string | null): Promise<HistoryEntry[]> {
  try {
    const res = await fetch("/api/history" + (userId ? `?userId=${encodeURIComponent(userId ?? "")}` : ""), {
      method: "GET",
    });
    if (res.ok) {
      const data = (await res.json()) as { items: HistoryEntry[] };
      if (data.items && data.items.length > 0) {
        // Merge session + server, server first.
        const session = readSession();
        const seen = new Set<string>();
        const items = [...data.items, ...session].filter((it) => {
          if (seen.has(it.id)) return false;
          seen.add(it.id);
          return true;
        });
        return items;
      }
    }
  } catch {
    /* fall through to session */
  }
  return readSession();
}

export async function deleteHistoryItem(id: string, _userId: string | null): Promise<void> {
  writeSession(readSession().filter((i) => i.id !== id));
  try {
    await fetch(`/api/history?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch {}
}

/**
 * Compresses a Blob into a thumbnail data URL (≤ 80 KB).
 */
export async function makeThumbnail(input: Blob, max = 80_000): Promise<string | undefined> {
  try {
    const img = await blobToImage(input);
    const canvas = document.createElement("canvas");
    const maxSide = 240;
    const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let quality = 0.74;
    let data = canvas.toDataURL("image/jpeg", quality);
    while (data.length > max && quality > 0.3) {
      quality -= 0.1;
      data = canvas.toDataURL("image/jpeg", quality);
    }
    if (data.length > max) return undefined;
    return data;
  } catch {
    return undefined;
  }
}

function blobToImage(b: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(b);
    const img = new Image();
    img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
    img.onerror = (e) => { reject(e); URL.revokeObjectURL(url); };
    img.src = url;
  });
}
