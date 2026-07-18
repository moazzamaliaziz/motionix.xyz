"use client";

import type { Tool } from "@/lib/tools";
import { ToolDropzone } from "./ToolDropzone";
import { DynamicBackgroundRemover } from "./tools/dynamic";
import { DynamicPassportMaker } from "./tools/dynamic";
import { DynamicSignatureMaker } from "./tools/dynamic";
import { DynamicPhotoResizer } from "./tools/dynamic";
import { DynamicImageCompressor } from "./tools/dynamic";
import { DynamicStudentIdPhotoMaker } from "./tools/dynamic";
import { DynamicResumePhotoMaker } from "./tools/dynamic";
import { DynamicVideoCompressor } from "./tools/dynamic";
/**
 * Routes the tool body to its implementation. Each implementation is
 * client-only and lazy-imported.
 */
export function ToolBody({ tool }: { tool: Tool }) {
  switch (tool.slug) {
    case "background-remover":
      return <DynamicBackgroundRemover />;
    case "passport-photo-maker":
      return <DynamicPassportMaker />;
    case "signature-maker":
      return <DynamicSignatureMaker />;
    case "photo-resizer":
      return <DynamicPhotoResizer />;
    case "image-compressor":
      return <DynamicImageCompressor />;
    case "student-id-photo-maker":
      return <DynamicStudentIdPhotoMaker />;
    case "resume-photo-maker":
      return <DynamicResumePhotoMaker />;
    case "video-compressor":
      return <DynamicVideoCompressor />;
    default:
      return (
        <ToolDropzone
          onFile={() => { /* no-op for unrecognised slugs */ }}
          accept="image/*"
          hint={`We're still working on ${tool.name.toLowerCase()}`}
          subhint="Coming in a future update. Try one of the working tools below while you wait."
        />
      );
  }
}
