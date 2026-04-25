import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LPHeader, LPFooter, LandingContent } from "@/components/landing";

export default async function HomePage() {
  const session = await auth();

  // ログイン済みユーザーは /dashboard にリダイレクト
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <LPHeader />
      <LandingContent />
      <LPFooter />
    </div>
  );
}
