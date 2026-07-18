import type { Metadata } from "next";
import "./globals.css";
import { OptionalClerkProvider } from "@/components/motionix/auth/OptionalClerkProvider";
import { AnalyticsProvider } from "@/components/motionix/analytics/AnalyticsProvider";

export const metadata: Metadata = {
  title: "Motionix — Free AI tools for images and video",
  description:
    "Free background remover, passport photo maker, image compressor, and other AI tools. No signup, no upload.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <OptionalClerkProvider>
          {children}
          <AnalyticsProvider />
        </OptionalClerkProvider>
      </body>
    </html>
  );
}
