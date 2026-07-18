declare module "upng-js" {
  const UPNG: {
    /** Lossless re-encode. Returns ArrayBuffer (PNG bytes). */
    encode(imgs: Uint8Array[], w: number, h: number, dels?: number): ArrayBuffer;
    /** Decode a PNG buffer. */
    decode(buffer: ArrayBuffer): { width: number; height: number; data: Uint8Array; depth: number;ctype: number };
  };
  export default UPNG;
}
