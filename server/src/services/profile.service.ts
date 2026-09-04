import { prisma } from "../config/database.js";

export async function getProfileByGuestId(guestId: string) {
  const user = await prisma.user.findUnique({
    where: {
      guestId,
    },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      spaceMemberships: {
        orderBy: {
          joinedAt: "desc",
        },
        select: {
          joinedAt: true,
          space: {
            select: {
              id: true,
              name: true,
              description: true,
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const activity = user.spaceMemberships
    .map((membership) => ({
      id: `joined-${membership.joinedAt.getTime()}-${membership.space.id}`,
      type: "joined" as const,
      room: membership.space.name,
      text: "",
      createdAt: membership.joinedAt.toISOString(),
    }))
    .slice(0, 20);

  const daysOnLinkUp = Math.max(
    1,
    Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1,
  );

  return {
    user: {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      country: null,
      createdAt: user.createdAt.toISOString(),
    },

    stats: {
      rooms: user.spaceMemberships.length,
      messages: user._count.messages,
      friends: 0,
      daysOnLinkUp,
    },

    rooms: user.spaceMemberships.map((membership) => ({
      id: membership.space.id,
      name: membership.space.name,
      description: membership.space.description,
      members: membership.space._count.members,
    })),

    activity,
  };
}
