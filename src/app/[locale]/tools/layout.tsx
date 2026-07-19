import { BackgroundRemovalPreloader } from "@/components/motionix/tool/BackgroundRemovalPreloader";

export default function LocaleToolsLayout({
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
