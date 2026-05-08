import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/features/user/services/user-service";
import { ProfileEditForm } from "@/features/user/components/ProfileEditForm";
import { BackLink } from "@/components/common/BackLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/login");

  return (
    <div className="container max-w-2xl pb-8">
      <BackLink href="/settings" label="設定に戻る" />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">プロフィール編集</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileEditForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
