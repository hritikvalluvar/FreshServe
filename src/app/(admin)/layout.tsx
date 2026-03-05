import { auth } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import { SessionProvider } from "next-auth/react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      {session && <AdminNav />}
      <main className="flex-1 p-4">{children}</main>
    </SessionProvider>
  );
}
