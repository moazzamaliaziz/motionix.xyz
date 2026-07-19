"use client";

import dynamic from "next/dynamic";

const DynamicBackgroundRemover = dynamic(
  async () => (await import("./BackgroundRemoverImpl")).BackgroundRemoverImpl as unknown as React.ComponentType<unknown>,
  { ssr: false, loading: () => <Skeleton label="Loading the background remover…" /> } as never,
);

const DynamicPassportMaker = dynamic(
  async () => (await import("./PassportMakerImpl")).PassportMakerImpl as unknown as React.ComponentType<unknown>,
  { ssr: false, loading: () => <Skeleton label="Loading the passport tool…" /> } as never,
);

const DynamicSignatureMaker = dynamic(
  async () => (await import("./SignatureMakerImpl")).SignatureMakerImpl as unknown as React.ComponentType<unknown>,
  { ssr: false, loading: () => <Skeleton label="Loading the signature tool…" /> } as never,
);

const DynamicPhotoResizer = dynamic(
  async () => (await import("./PhotoResizerImpl")).PhotoResizerImpl as unknown as React.ComponentType<unknown>,
  { ssr: false, loading: () => <Skeleton label="Loading the resizer…" /> } as never,
);

const DynamicImageCompressor = dynamic(
  async () => (await import("./ImageCompressorImpl")).ImageCompressorImpl as unknown as React.ComponentType<unknown>,
  { ssr: false, loading: () => <Skeleton label="Loading the compressor…" /> } as never,
);

const DynamicStudentIdPhotoMaker = dynamic(
  async () => (await import("./StudentIdPhotoMakerImpl")).StudentIdPhotoMakerImpl as unknown as React.ComponentType<unknown>,
  { ssr: false, loading: () => <Skeleton label="Loading the ID-photo tool…" /> } as never,
);

const DynamicResumePhotoMaker = dynamic(
  async () => (await import("./ResumePhotoMakerImpl")).ResumePhotoMakerImpl as unknown as React.ComponentType<unknown>,
  { ssr: false, loading: () => <Skeleton label="Loading the headshot tool…" /> } as never,
);

const DynamicVideoCompressor = dynamic(
  async () => (await import("./VideoCompressorImpl")).VideoCompressorImpl as unknown as React.ComponentType<unknown>,
  { ssr: false, loading: () => <Skeleton label="Loading the video compressor…" /> } as never,
);

export { DynamicBackgroundRemover, DynamicPassportMaker, DynamicSignatureMaker, DynamicPhotoResizer, DynamicImageCompressor, DynamicStudentIdPhotoMaker, DynamicResumePhotoMaker, DynamicVideoCompressor };

function Skeleton({ label }: { label: string }) {
  return (
    <div className="aspect-[21/9] rounded-[2rem] bg-white/60 border border-foreground/10 grid place-items-center text-foreground/50">
      {label}
    </div>
  );
}
