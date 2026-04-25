import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotifications } from "@/features/notification/services/notification-service";
import { NotificationList } from "@/features/notification/components/NotificationList";
import { Pagination } from "@/components/common/Pagination";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function NotificationsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { notifications, totalPages } = await getNotifications(session.user.id, page);

  return (
    <div className="container max-w-2xl pb-8">
      <h1 className="text-2xl font-bold mb-6">通知</h1>
      <NotificationList notifications={notifications} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/notifications" />
    </div>
  );
}
