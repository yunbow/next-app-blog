import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotifications } from "@/features/notification/services/notification-service";
import { NotificationList } from "@/features/notification/components/NotificationList";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await getNotifications(session.user.id);

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">通知</h1>
      <NotificationList notifications={notifications} />
    </div>
  );
}
