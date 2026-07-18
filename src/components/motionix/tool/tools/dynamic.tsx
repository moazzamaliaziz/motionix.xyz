"use client";

import dynamic from "next/dynamic";

export function DynamicBackgroundRemover() {
  const Comp = dynamic(
    async () => (await import("./BackgroundRemoverImpl")).BackgroundRemoverImpl as unknown as React.ComponentType<unknown>,
    {
      ssr: false,
      loading: () => <Skeleton label="Loading the background remover…" />,
    } as never,
  );
  return <Comp />;
}

export function DynamicPassportMaker() {
  const Comp = dynamic(
    async () => (await import("./PassportMakerImpl")).PassportMakerImpl as unknown as React.ComponentType<unknown>,
    {
      ssr: false,
      loading: () => <Skeleton label="Loading the passport tool…" />,
    } as never,
  );
  return <Comp />;
}

export function DynamicSignatureMaker() {
  const Comp = dynamic(
    async () => (await import("./SignatureMakerImpl")).SignatureMakerImpl as unknown as React.ComponentType<unknown>,
    {
      ssr: false,
      loading: () => <Skeleton label="Loading the signature tool…" />,
    } as never,
  );
  return <Comp />;
}

export function DynamicPhotoResizer() {
  const Comp = dynamic(
    async () => (await import("./PhotoResizerImpl")).PhotoResizerImpl as unknown as React.ComponentType<unknown>,
    {
      ssr: false,
      loading: () => <Skeleton label="Loading the resizer…" />,
    } as never,
  );
  return <Comp />;
}

export function DynamicImageCompressor() {
  const Comp = dynamic(
    async () => (await import("./ImageCompressorImpl")).ImageCompressorImpl as unknown as React.ComponentType<unknown>,
    {
      ssr: false,
      loading: () => <Skeleton label="Loading the compressor…" />,
    } as never,
  );
  return <Comp />;
}

export function DynamicStudentIdPhotoMaker() {
  const Comp = dynamic(
    async () => (await import("./StudentIdPhotoMakerImpl")).StudentIdPhotoMakerImpl as unknown as React.ComponentType<unknown>,
    {
      ssr: false,
      loading: () => <Skeleton label="Loading the ID-photo tool…" />,
    } as never,
  );
  return <Comp />;
}

export function DynamicResumePhotoMaker() {
  const Comp = dynamic(
    async () => (await import("./ResumePhotoMakerImpl")).ResumePhotoMakerImpl as unknown as React.ComponentType<unknown>,
    {
      ssr: false,
      loading: () => <Skeleton label="Loading the headshot tool…" />,
    } as never,
  );
  return <Comp />;
}

export function DynamicVideoCompressor() {
  const Comp = dynamic(
    async () => (await import("./VideoCompressorImpl")).VideoCompressorImpl as unknown as React.ComponentType<unknown>,
    {
      ssr: false,
      loading: () => <Skeleton label="Loading the video compressor…" />,
    } as never,
  );
  return <Comp />;
}

function Skeleton({ label }: { label: string }) {
  return (
    <div className="aspect-[21/9] rounded-[2rem] bg-white/60 border border-foreground/10 grid place-items-center text-foreground/50">
      {label}
    </div>
  );
}
