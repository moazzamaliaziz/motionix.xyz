import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--a-font",
});

export const metadata = {
  title: "Admin Login — Motionix",
  description: "Sign in to the Motionix admin panel",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen antialiased ${poppins.variable}`}>
      {children}
    </div>
  );
}
