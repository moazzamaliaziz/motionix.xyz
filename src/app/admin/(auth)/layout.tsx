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
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
