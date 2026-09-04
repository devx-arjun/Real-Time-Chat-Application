import { prisma } from "../config/database.js";

interface CreateSpaceInput {
  name: string;
  description?: string;
}

function createSlug(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base}-${Date.now()}`;
}

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

/**
 * Create a new space.
 *
 * The current guest automatically becomes OWNER.
 */
export async function createSpace(guestId: string, input: CreateSpaceInput) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    throw new Error("Guest not found");
  }

  const name = input.name.trim();

  if (!name) {
    throw new Error("Space name is required");
  }

  const description = input.description?.trim();

  return prisma.space.create({
    data: {
      name,
      slug: createSlug(name),

      ...(description
        ? {
            description,
          }
        : {}),

      members: {
        create: {
          userId: guest.id,
          role: "OWNER",
        },
      },
    },

    include: {
      members: {
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
}

/**
 * Get all spaces the current guest belongs to.
 */
export async function getUserSpaces(guestId: string) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    throw new Error("Guest not found");
  }

  const memberships = await prisma.spaceMember.findMany({
    where: {
      userId: guest.id,
    },

    orderBy: {
      joinedAt: "desc",
    },

    include: {
      space: {
        include: {
          _count: {
            select: {
              members: true,
              conversations: true,
            },
          },
        },
      },
    },
  });

  return memberships.map((membership) => ({
    ...membership.space,
    role: membership.role,
    joinedAt: membership.joinedAt,
  }));
}

/**
 * Get spaces the current guest has not joined yet.
 */
export async function getDiscoverableSpaces(guestId: string) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    throw new Error("Guest not found");
  }

  const spaces = await prisma.space.findMany({
    where: {
      members: {
        none: {
          userId: guest.id,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      _count: {
        select: {
          members: true,
          conversations: true,
        },
      },
    },
  });

  return spaces;
}

/**
 * Get a single space.
 *
 * Only members of the space can access it.
 */
export async function getSpaceById(guestId: string, spaceId: string) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    throw new Error("Guest not found");
  }

  const membership = await prisma.spaceMember.findUnique({
    where: {
      userId_spaceId: {
        userId: guest.id,
        spaceId,
      },
    },
  });

  if (!membership) {
    return null;
  }

  const space = await prisma.space.findUnique({
    where: {
      id: spaceId,
    },

    include: {
      members: {
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

      conversations: {
        orderBy: {
          updatedAt: "desc",
        },

        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,

          _count: {
            select: {
              participants: true,
              messages: true,
            },
          },
        },
      },
    },
  });

  if (!space) {
    return null;
  }

  return {
    ...space,
    currentUserRole: membership.role,
  };
}

/**
 * Join a space.
 */
export async function joinSpace(guestId: string, spaceId: string) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const space = await prisma.space.findUnique({
    where: {
      id: spaceId,
    },
  });

  if (!space) {
    return {
      error: "SPACE_NOT_FOUND" as const,
    };
  }

  const existingMembership = await prisma.spaceMember.findUnique({
    where: {
      userId_spaceId: {
        userId: guest.id,
        spaceId,
      },
    },
  });

  if (existingMembership) {
    return {
      error: "ALREADY_MEMBER" as const,
    };
  }

  const membership = await prisma.spaceMember.create({
    data: {
      userId: guest.id,
      spaceId,
      role: "MEMBER",
    },

    include: {
      space: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      user: {
        select: {
          id: true,
          guestId: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    membership,
  };
}

/**
 * Leave a space.
 */
export async function leaveSpace(guestId: string, spaceId: string) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    return {
      error: "GUEST_NOT_FOUND" as const,
    };
  }

  const space = await prisma.space.findUnique({
    where: {
      id: spaceId,
    },
  });

  if (!space) {
    return {
      error: "SPACE_NOT_FOUND" as const,
    };
  }

  const membership = await prisma.spaceMember.findUnique({
    where: {
      userId_spaceId: {
        userId: guest.id,
        spaceId,
      },
    },
  });

  if (!membership) {
    return {
      error: "NOT_MEMBER" as const,
    };
  }

  if (membership.role === "OWNER") {
    return {
      error: "OWNER_CANNOT_LEAVE" as const,
    };
  }

  await prisma.spaceMember.delete({
    where: {
      userId_spaceId: {
        userId: guest.id,
        spaceId,
      },
    },
  });

  return {
    success: true as const,
  };
}
