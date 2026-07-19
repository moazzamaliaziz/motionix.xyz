import { BackgroundRemovalPreloader } from "@/components/motionix/tool/BackgroundRemovalPreloader";

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <BackgroundRemovalPreloader />
      {children}
    </>
  );
}
