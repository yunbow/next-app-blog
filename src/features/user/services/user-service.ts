import "server-only";
import { prisma } from "@/lib/prisma";

const USERS_PER_PAGE = 20;

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      createdAt: true,
      _count: { select: { articles: true, followers: true, following: true } },
    },
  });
}

export async function getFollowers(userId: string, page = 1) {
  const skip = (page - 1) * USERS_PER_PAGE;
  const [follows, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, image: true, username: true, bio: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: USERS_PER_PAGE,
    }),
    prisma.follow.count({ where: { followingId: userId } }),
  ]);
  return { followers: follows.map((f) => f.follower), total, totalPages: Math.ceil(total / USERS_PER_PAGE) };
}

export async function getFollowing(userId: string, page = 1) {
  const skip = (page - 1) * USERS_PER_PAGE;
  const [follows, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, name: true, image: true, username: true, bio: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: USERS_PER_PAGE,
    }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return { following: follows.map((f) => f.following), total, totalPages: Math.ceil(total / USERS_PER_PAGE) };
}

export async function isFollowing(followerId: string, followingId: string) {
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return !!follow;
}

export async function getUserProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { name: true, username: true, bio: true, image: true },
  });
}

export async function getUserBillingInfo(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { stripePriceId: true, subscriptionStatus: true, currentPeriodEnd: true },
  });
}

export async function getUserPlanInfo(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { stripePriceId: true, subscriptionStatus: true },
  });
}
