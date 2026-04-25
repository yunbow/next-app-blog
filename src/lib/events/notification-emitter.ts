import { EventEmitter } from "events";

class NotificationEmitter extends EventEmitter {
  private static instance: NotificationEmitter;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  static getInstance(): NotificationEmitter {
    if (!NotificationEmitter.instance) {
      NotificationEmitter.instance = new NotificationEmitter();
    }
    return NotificationEmitter.instance;
  }

  emitNotification(userId: string, notification: unknown) {
    this.emit(`notification:${userId}`, notification);
  }

  emitUnreadCount(userId: string, count: number) {
    this.emit(`unread-count:${userId}`, count);
  }
}

export const notificationEmitter = NotificationEmitter.getInstance();
