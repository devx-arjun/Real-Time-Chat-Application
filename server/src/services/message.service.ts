import { prisma } from "../config/database.js";

async function getGuestById(guestId: string) {
  return prisma.user.findUnique({
    where: {
      guestId,
    },
    select: {
      id: true,
      guestId: true,
      username: true,
      avatarUrl: true,
      bio: true,
    },
  });
}

export async function createMessage(
  guestId: string,
  conversationId: string,
  content: string,
  replyToId?: string,
) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: guest.id,
        conversationId,
      },
    },
  });

  if (!participant) {
    return {
      error: "NOT_PARTICIPANT" as const,
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

  if (replyToId) {
    const replyMessage = await prisma.message.findFirst({
      where: {
        id: replyToId,
        conversationId,
      },
    });

    if (!replyMessage) {
      return {
        error: "INVALID_REPLY" as const,
      };
    }
  }

  const message = await prisma.message.create({
    data: {
      content,
      senderId: guest.id,
      conversationId,
      ...(replyToId ? { replyToId } : {}),
    },

    include: {
      sender: {
        select: {
          id: true,
          guestId: true,
          username: true,
          avatarUrl: true,
        },
      },

      replyTo: {
        select: {
          id: true,
          content: true,
          sender: {
            select: {
              id: true,
              guestId: true,
              username: true,
            },
          },
        },
      },

      reactions: {
        include: {
          user: {
            select: {
              id: true,
              guestId: true,
              username: true,
            },
          },
        },
      },
    },
  });

  return {
    message,
  };
}

export async function editMessage(
  guestId: string,
  messageId: string,
  content: string,
) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
  });

  if (!message) {
    return {
      error: "MESSAGE_NOT_FOUND" as const,
    };
  }

  if (message.senderId !== guest.id) {
    return {
      error: "NOT_MESSAGE_OWNER" as const,
    };
  }

  const updatedMessage = await prisma.message.update({
    where: {
      id: messageId,
    },

    data: {
      content,
    },

    include: {
      sender: {
        select: {
          id: true,
          guestId: true,
          username: true,
          avatarUrl: true,
        },
      },

      replyTo: {
        select: {
          id: true,
          content: true,
          sender: {
            select: {
              id: true,
              guestId: true,
              username: true,
            },
          },
        },
      },

      reactions: {
        include: {
          user: {
            select: {
              id: true,
              guestId: true,
              username: true,
            },
          },
        },
      },
    },
  });

  return {
    message: updatedMessage,
  };
}

export async function deleteMessage(guestId: string, messageId: string) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
  });

  if (!message) {
    return {
      error: "MESSAGE_NOT_FOUND" as const,
    };
  }

  if (message.senderId !== guest.id) {
    return {
      error: "NOT_MESSAGE_OWNER" as const,
    };
  }

  if (message.deletedAt) {
    return {
      error: "ALREADY_DELETED" as const,
    };
  }

  const deletedMessage = await prisma.message.update({
    where: {
      id: messageId,
    },

    data: {
      content: "",
      deletedAt: new Date(),
    },

    include: {
      sender: {
        select: {
          id: true,
          guestId: true,
          username: true,
          avatarUrl: true,
        },
      },

      replyTo: {
        select: {
          id: true,
          content: true,
          sender: {
            select: {
              id: true,
              guestId: true,
              username: true,
            },
          },
        },
      },

      reactions: {
        include: {
          user: {
            select: {
              id: true,
              guestId: true,
              username: true,
            },
          },
        },
      },
    },
  });

  return {
    message: deletedMessage,
  };
}

export async function toggleReaction(
  guestId: string,
  messageId: string,
  emoji: string,
) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },

    select: {
      id: true,
      conversationId: true,
      deletedAt: true,
    },
  });

  if (!message) {
    return {
      error: "MESSAGE_NOT_FOUND" as const,
    };
  }

  if (message.deletedAt) {
    return {
      error: "MESSAGE_DELETED" as const,
    };
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: guest.id,
        conversationId: message.conversationId,
      },
    },
  });

  if (!participant) {
    return {
      error: "NOT_PARTICIPANT" as const,
    };
  }

  const existingReaction = await prisma.messageReaction.findUnique({
    where: {
      userId_messageId: {
        userId: guest.id,
        messageId,
      },
    },
  });

  let reacted = true;

  if (existingReaction) {
    if (existingReaction.emoji === emoji) {
      await prisma.messageReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      reacted = false;
    } else {
      await prisma.messageReaction.update({
        where: {
          id: existingReaction.id,
        },
        data: {
          emoji,
        },
      });

      reacted = true;
    }
  } else {
    await prisma.messageReaction.create({
      data: {
        userId: guest.id,
        messageId,
        emoji,
      },
    });

    reacted = true;
  }

  const reactions = await prisma.messageReaction.findMany({
    where: {
      messageId,
    },

    include: {
      user: {
        select: {
          id: true,
          guestId: true,
          username: true,
        },
      },
    },
  });

  return {
    messageId,
    conversationId: message.conversationId,
    emoji,
    reacted,
    reactions,
  };
}

export async function getMessages(
  guestId: string,
  conversationId: string,
  limit = 50,
  cursor?: string,
) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: guest.id,
        conversationId,
      },
    },
  });

  if (!participant) {
    return {
      error: "NOT_PARTICIPANT" as const,
    };
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: limit + 1,

    ...(cursor
      ? {
          cursor: {
            id: cursor,
          },
          skip: 1,
        }
      : {}),

    include: {
      sender: {
        select: {
          id: true,
          guestId: true,
          username: true,
          avatarUrl: true,
        },
      },

      replyTo: {
        select: {
          id: true,
          content: true,
          sender: {
            select: {
              id: true,
              guestId: true,
              username: true,
            },
          },
        },
      },

      reactions: {
        include: {
          user: {
            select: {
              id: true,
              guestId: true,
              username: true,
            },
          },
        },
      },
    },
  });

  const hasMore = messages.length > limit;

  if (hasMore) {
    messages.pop();
  }

  return {
    messages: messages.reverse(),
    nextCursor: hasMore ? (messages[0]?.id ?? null) : null,
  };
}
