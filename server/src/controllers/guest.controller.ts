import type { Request, Response } from "express";
import {
  createGuest,
  getGuestById,
} from "../services/guest.service.js";

export async function createGuestController(
  req: Request,
  res: Response,
) {
  try {
    const { username } = req.body;

    if (typeof username !== "string") {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    if (normalizedUsername.length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters",
      });
    }

    if (normalizedUsername.length > 20) {
      return res.status(400).json({
        message: "Username must be at most 20 characters",
      });
    }

    if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        message:
          "Username can only contain letters, numbers and underscores",
      });
    }

    const guest = await createGuest({
      username: normalizedUsername,
    });

    return res.status(201).json({
      guest,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Username is already taken"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error("Failed to create guest:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function getGuestController(
  req: Request<{ guestId: string }>,
  res: Response,
) {
  try {
    const { guestId } = req.params;

    if (!guestId) {
      return res.status(400).json({
        message: "Guest ID is required",
      });
    }

    const guest = await getGuestById(guestId);

    if (!guest) {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    return res.status(200).json({
      guest,
    });
  } catch (error) {
    console.error("Failed to get guest:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function getCurrentGuestController(
  req: Request,
  res: Response,
) {
  try {
    const guestId = req.headers["x-guest-id"];

    if (typeof guestId !== "string" || !guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    const guest = await getGuestById(guestId);

    if (!guest) {
      return res.status(401).json({
        message: "Guest session is invalid",
      });
    }

    return res.status(200).json({
      guest,
    });
  } catch (error) {
    console.error("Failed to get current guest:", error);

    return res.status(500).json({
      message: "Unable to restore guest session",
    });
  }
}
