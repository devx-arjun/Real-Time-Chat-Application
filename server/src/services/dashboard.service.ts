import { prisma } from "../config/database.js";

export async function getDashboardForUser(userId: string) {
  const memberships = await prisma.spaceMember.findMany({
    where: {
      userId,
    },
    include: {
      space: {
        include: {
          members: true,
          conversations: {
            orderBy: {
              updatedAt: "desc",
            },
            take: 1,
            include: {
              messages: {
                where: {
                  deletedAt: null,
                },
                orderBy: {
                  createdAt: "desc",
                },
                take: 2,
                include: {
                  sender: {
                    select: {
                      username: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  const spaces = memberships.map(({ space }) => {
    const conversation = space.conversations[0];

    return {
      id: space.id,
      name: space.name,
      slug: space.slug,
      description: space.description,
      members: space.members.length,

      // Presence isn't implemented yet.
      online: 0,

      messages:
        conversation?.messages
          .slice()
          .reverse()
          .map((message) => ({
            id: message.id,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
            sender: {
              username: message.sender.username,
              avatarUrl: message.sender.avatarUrl,
            },
          })) ?? [],
    };
  });

  return {
    spaces,
    activity: [],
    totalOnline: 0,
  };
}