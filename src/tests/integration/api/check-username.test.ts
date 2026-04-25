import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Session } from "next-auth";
import type { User } from "@prisma/client";
import { NextRequest } from "next/server";

// Mock auth before importing the route
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/check-username/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const authMock = auth as unknown as Mock;

function mockSession(overrides?: Partial<Session>): Session {
  return {
    user: { id: "user-1", email: "test@example.com", name: null, image: null },
    expires: new Date(Date.now() + 86400000).toISOString(),
    ...overrides,
  };
}

function mockUser(overrides?: Partial<User>): User {
  return {
    id: "user-1",
    username: "testuser",
    email: "test@example.com",
    name: null,
    image: null,
    password: null,
    bio: null,
    emailVerified: null,
    isAdmin: false,
    isSuspended: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    subscriptionStatus: null,
    currentPeriodEnd: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("GET /api/check-username", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    authMock.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/check-username?username=test");
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("認証が必要です");
  });

  it("should return 400 if username is missing", async () => {
    authMock.mockResolvedValue(mockSession());

    const request = new NextRequest("http://localhost:3000/api/check-username");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("ユーザーIDが必要です");
  });

  it("should return error if username is invalid", async () => {
    authMock.mockResolvedValue(mockSession());

    const request = new NextRequest("http://localhost:3000/api/check-username?username=ab");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("should return error if username is already taken", async () => {
    authMock.mockResolvedValue(mockSession());

    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      mockUser({ id: "user-2", username: "testuser" })
    );

    const request = new NextRequest("http://localhost:3000/api/check-username?username=testuser");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("このユーザーIDは既に使用されています");
  });

  it("should return success if username is available", async () => {
    authMock.mockResolvedValue(mockSession());

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/check-username?username=newuser");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    if (data.success) {
      expect(data.data?.available).toBe(true);
    }
  });

  it("should allow current user to keep their username", async () => {
    authMock.mockResolvedValue(mockSession());

    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      mockUser({ id: "user-1", username: "currentuser" })
    );

    const request = new NextRequest("http://localhost:3000/api/check-username?username=currentuser");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    if (data.success) {
      expect(data.data?.available).toBe(true);
    }
  });
});
