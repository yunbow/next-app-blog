import "server-only";
import { prisma } from "@/lib/prisma";

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

export async function getFollowers(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    include: { follower: { select: { id: true, name: true, image: true, username: true, bio: true } } },
    orderBy: { createdAt: "desc" },
  });
  return follows.map((f) => f.follower);
}

export async function getFollowing(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: { select: { id: true, name: true, image: true, username: true, bio: true } } },
    orderBy: { createdAt: "desc" },
  });
  return follows.map((f) => f.following);
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
