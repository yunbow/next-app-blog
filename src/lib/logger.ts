import pino from "pino";
import { env } from "@/lib/config/env";

export const logger = pino({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function createRequestLogger(requestId: string, traceId?: string) {
  return logger.child({ requestId, traceId: traceId || requestId });
}

export function createUserLogger(userId: string, traceId?: string) {
  return logger.child({ userId, traceId });
}

export function createContextLogger(requestId: string, userId?: string, traceId?: string) {
  return logger.child({ requestId, userId, traceId: traceId || requestId });
}

export function logError(
  error: Error,
  context?: { requestId?: string; userId?: string; action?: string }
) {
  logger.error(
    {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
    },
    "Error occurred"
  );
}

export function logSecurityEvent(
  event: string,
  context: {
    userId?: string;
    ip?: string;
    userAgent?: string;
    action?: string;
    details?: Record<string, unknown>;
  }
) {
  logger.warn(
    {
      type: "SECURITY_EVENT",
      event,
      ...context,
    },
    `Security event: ${event}`
  );
}

export function logAuthFailure(
  reason: string,
  context: { email?: string; ip?: string; userAgent?: string }
) {
  logSecurityEvent("AUTH_FAILURE", {
    action: "login",
    details: { reason },
    ...context,
  });
}

export function logAuthorizationFailure(
  resource: string,
  context: { userId?: string; resourceId?: string; action?: string; ip?: string }
) {
  logSecurityEvent("AUTHORIZATION_FAILURE", {
    action: context.action || "access",
    details: { resource, resourceId: context.resourceId },
    userId: context.userId,
    ip: context.ip,
  });
}

export function logRateLimitExceeded(
  endpoint: string,
  context: { ip?: string; userId?: string }
) {
  logSecurityEvent("RATE_LIMIT_EXCEEDED", {
    action: endpoint,
    ...context,
  });
}
