import { randomBytes } from "crypto";
import { prisma } from "../config/database.js";

const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateJoinCode(length = 6) {
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) => {
    return JOIN_CODE_ALPHABET[byte % JOIN_CODE_ALPHABET.length];
  }).join("");
}

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
      ownerId: user.id,
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

export async function createPrivateConversation(
  guestId: string,
  title?: string,
) {
  const user = await getUserByGuestId(guestId);

  if (!user) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  let joinCode = generateJoinCode();

  // Extremely unlikely collision protection.
  while (
    await prisma.conversation.findUnique({
      where: {
        joinCode,
      },
    })
  ) {
    joinCode = generateJoinCode();
  }

  const conversation = await prisma.conversation.create({
    data: {
      title: title?.trim() || null,
      isPrivate: true,
      joinCode,
      ownerId: user.id,

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

export async function getMyPrivateConversations(guestId: string) {
  const user = await getUserByGuestId(guestId);

  if (!user) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      isPrivate: true,
      participants: {
        some: {
          userId: user.id,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },

    include: {
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

      _count: {
        select: {
          participants: true,
          messages: true,
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

  /*
   * Public conversations belong to a Space.
   * The user must be a member of that Space.
   */
  if (conversation.spaceId) {
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
  }

  const participant = conversation.participants.some(
    (item) => item.userId === user.id,
  );

  /*
   * Private conversations can only be accessed by participants.
   */
  if (conversation.isPrivate && !participant) {
    return {
      error: "NOT_PRIVATE_PARTICIPANT" as const,
    };
  }

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

  if (conversation.isPrivate) {
    return {
      error: "PRIVATE_CONVERSATION_USE_JOIN_CODE" as const,
    };
  }

  /*
   * Public conversations must belong to a Space.
   */
  if (!conversation.spaceId) {
    return {
      error: "CONVERSATION_HAS_NO_SPACE" as const,
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

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },

    select: {
      ownerId: true,
    },
  });

  if (!conversation) {
    return {
      error: "CONVERSATION_NOT_FOUND" as const,
    };
  }

  /*
   * Owners cannot leave their own conversation.
   * They must delete it instead.
   */
  if (conversation.ownerId === user.id) {
    return {
      error: "OWNER_CANNOT_LEAVE" as const,
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
    success: true as const,
    userId: user.id,
  };
}

export async function joinPrivateConversation(
  guestId: string,
  joinCode: string,
) {
  const user = await getUserByGuestId(guestId);

  if (!user) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const normalizedCode = joinCode.trim().toUpperCase();

  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(normalizedCode)) {
    return {
      error: "INVALID_JOIN_CODE" as const,
    };
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      joinCode: normalizedCode,
    },
  });

  if (!conversation) {
    return {
      error: "INVALID_JOIN_CODE" as const,
    };
  }

  if (!conversation.isPrivate) {
    return {
      error: "NOT_PRIVATE_CONVERSATION" as const,
    };
  }

  const existingParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: user.id,
        conversationId: conversation.id,
      },
    },
  });

  if (existingParticipant) {
    return {
      error: "ALREADY_PARTICIPANT" as const,
      conversationId: conversation.id,
    };
  }

  const participant = await prisma.conversationParticipant.create({
    data: {
      userId: user.id,
      conversationId: conversation.id,
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
          isPrivate: true,
          joinCode: true,
        },
      },
    },
  });

  return {
    participant,
  };
}

export async function deleteConversation(
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

    select: {
      ownerId: true,
    },
  });

  if (!conversation) {
    return {
      error: "CONVERSATION_NOT_FOUND" as const,
    };
  }

  /*
   * Only the conversation owner can delete it.
   * This applies to both public and private conversations.
   */
  if (conversation.ownerId !== user.id) {
    return {
      error: "ONLY_OWNER_CAN_DELETE" as const,
    };
  }

  await prisma.conversation.delete({
    where: {
      id: conversationId,
    },
  });

  return {
    success: true as const,
  };
}
