import { auth } from "@/lib/auth";
import { notificationEmitter } from "@/lib/events/notification-emitter";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const onNotification = (notification: { id: string; type: string; message: string; createdAt: Date }) => {
        controller.enqueue(encoder.encode(`event: notification\ndata: ${JSON.stringify(notification)}\n\n`));
      };

      const onUnreadCount = (count: number) => {
        controller.enqueue(encoder.encode(`event: unread-count\ndata: ${JSON.stringify({ count })}\n\n`));
      };

      notificationEmitter.on(`notification:${userId}`, onNotification);
      notificationEmitter.on(`unread-count:${userId}`, onUnreadCount);

      // Keep alive
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Send initial ping
      controller.enqueue(encoder.encode(": connected\n\n"));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
