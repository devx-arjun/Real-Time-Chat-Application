import { randomUUID } from "crypto";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";

type CreateGuestInput = {
  username: string;
};

const guestSelect = {
  id: true,
  guestId: true,
  username: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
} as const;

export async function createGuest({ username }: CreateGuestInput) {
  try {
    const usernameNormalized = username.trim().toLowerCase();

    const guest = await prisma.user.create({
      data: {
        guestId: randomUUID(),
        username,
        usernameNormalized,
      },
      select: guestSelect,
    });

    return guest;
    } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      console.error("Unique constraint violation:", error);
      throw new Error("Username is already taken");
    }

    throw error;
  }
}

export async function getGuestById(guestId: string) {
  const guest = await prisma.user.findUnique({
    where: {
      guestId,
    },
    select: {
      id: true,
      guestId: true,
      username: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  return guest;
}