import { prisma } from "../config/database.js";

async function getUserByGuestId(guestId: string) {
  return prisma.user.findUnique({
    where: {
      guestId,
    },
    select: {
      id: true,
      guestId: true,
      username: true,
      avatarUrl: true,
    },
  });
}

export async function createConversation(
  guestId: string,
  spaceId: string,
  title?: string,
) {
  const user = await getUserByGuestId(guestId);

  if (!user) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const membership = await prisma.spaceMember.findUnique({
    where: {
      userId_spaceId: {
        userId: user.id,
        spaceId,
      },
    },
  });

  if (!membership) {
    return {
      error: "NOT_MEMBER" as const,
    };
  }

  const conversation = await prisma.conversation.create({
    data: {
      spaceId,
      title: title?.trim() || null,

      participants: {
        create: {
          userId: user.id,
        },
      },
    },

    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              guestId: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },

      _count: {
        select: {
          messages: true,
          participants: true,
        },
      },
    },
  });

  return {
    conversation,
  };
}

export async function getSpaceConversations(guestId: string, spaceId: string) {
  const user = await getUserByGuestId(guestId);

  if (!user) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const membership = await prisma.spaceMember.findUnique({
    where: {
      userId_spaceId: {
        userId: user.id,
        spaceId,
      },
    },
  });

  if (!membership) {
    return {
      error: "NOT_MEMBER" as const,
    };
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      spaceId,
    },

    orderBy: {
      updatedAt: "desc",
    },

    include: {
      _count: {
        select: {
          participants: true,
          messages: true,
        },
      },

      participants: {
        take: 5,

        include: {
          user: {
            select: {
              id: true,
              guestId: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  return {
    conversations,
  };
}

export async function getConversationById(
  guestId: string,
  conversationId: string,
) {
  const user = await getUserByGuestId(guestId);

  if (!user) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },

    include: {
      space: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      participants: {
        orderBy: {
          joinedAt: "asc",
        },

        include: {
          user: {
            select: {
              id: true,
              guestId: true,
              username: true,
              avatarUrl: true,
              bio: true,
            },
          },
        },
      },

      _count: {
        select: {
          participants: true,
          messages: true,
        },
      },
    },
  });

  if (!conversation) {
    return {
      error: "NOT_FOUND" as const,
    };
  }

  const spaceMembership = await prisma.spaceMember.findUnique({
    where: {
      userId_spaceId: {
        userId: user.id,
        spaceId: conversation.space.id,
      },
    },
  });

  if (!spaceMembership) {
    return {
      error: "NOT_SPACE_MEMBER" as const,
    };
  }

  const participant = conversation.participants.some(
    (item) => item.userId === user.id,
  );

  return {
    conversation,
    isParticipant: participant,
  };
}

export async function joinConversation(
  guestId: string,
  conversationId: string,
) {
  const user = await getUserByGuestId(guestId);

  if (!user) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
  });

  if (!conversation) {
    return {
      error: "CONVERSATION_NOT_FOUND" as const,
    };
  }

  const spaceMembership = await prisma.spaceMember.findUnique({
    where: {
      userId_spaceId: {
        userId: user.id,
        spaceId: conversation.spaceId,
      },
    },
  });

  if (!spaceMembership) {
    return {
      error: "NOT_SPACE_MEMBER" as const,
    };
  }

  const existingParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: user.id,
        conversationId,
      },
    },
  });

  if (existingParticipant) {
    return {
      error: "ALREADY_PARTICIPANT" as const,
    };
  }

  const participant = await prisma.conversationParticipant.create({
    data: {
      userId: user.id,
      conversationId,
    },

    include: {
      user: {
        select: {
          id: true,
          guestId: true,
          username: true,
          avatarUrl: true,
        },
      },

      conversation: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return {
    participant,
  };
}

export async function leaveConversation(
  guestId: string,
  conversationId: string,
) {
  const user = await getUserByGuestId(guestId);

  if (!user) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: user.id,
        conversationId,
      },
    },
  });

  if (!participant) {
    return {
      error: "NOT_PARTICIPANT" as const,
    };
  }

  await prisma.conversationParticipant.delete({
    where: {
      userId_conversationId: {
        userId: user.id,
        conversationId,
      },
    },
  });

  return {
    success: true,
  };
}
