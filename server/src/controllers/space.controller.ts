import type { Request, Response } from "express";

import {
  createSpace,
  getUserSpaces,
  getDiscoverableSpaces,
  getSpaceById,
  joinSpace,
  leaveSpace,
  deleteSpace,
} from "../services/space.service.js";

function getGuestId(req: Request): string | null {
  const guestId = req.headers["x-guest-id"];

  if (typeof guestId !== "string" || !guestId.trim()) {
    return null;
  }

  return guestId.trim();
}

export async function create(req: Request, res: Response) {
  try {
    const guestId = getGuestId(req);

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    const { name, description } = req.body;

    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        message: "Space name must be at least 2 characters",
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        message: "Space name must be at most 50 characters",
      });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        message: "Description must be a string",
      });
    }

    const space = await createSpace(guestId, {
      name: name.trim(),
      description: description?.trim(),
    });

    return res.status(201).json({
      space,
    });
  } catch (error) {
    console.error("Create space error:", error);

    if (error instanceof Error && error.message === "Guest not found") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    return res.status(500).json({
      message: "Failed to create space",
    });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const guestId = getGuestId(req);

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    const spaces = await getUserSpaces(guestId);

    return res.status(200).json({
      spaces,
    });
  } catch (error) {
    console.error("Get spaces error:", error);

    if (error instanceof Error && error.message === "Guest not found") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    return res.status(500).json({
      message: "Failed to fetch spaces",
    });
  }
}

export async function discover(req: Request, res: Response) {
  try {
    const guestId = getGuestId(req);

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    const spaces = await getDiscoverableSpaces(guestId);

    return res.status(200).json({
      spaces,
    });
  } catch (error) {
    console.error("Discover spaces error:", error);

    if (error instanceof Error && error.message === "Guest not found") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    return res.status(500).json({
      message: "Failed to fetch discoverable spaces",
    });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const guestId = getGuestId(req);

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    const { spaceId } = req.params;

    if (typeof spaceId !== "string" || !spaceId.trim()) {
      return res.status(400).json({
        message: "Space ID is required",
      });
    }

    const space = await getSpaceById(guestId, spaceId.trim());

    if (!space) {
      return res.status(404).json({
        message: "Space not found",
      });
    }

    return res.status(200).json({
      space,
    });
  } catch (error) {
    console.error("Get space error:", error);

    if (error instanceof Error && error.message === "Guest not found") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    return res.status(500).json({
      message: "Failed to fetch space",
    });
  }
}

export async function join(req: Request, res: Response) {
  try {
    const guestId = getGuestId(req);
    const { spaceId } = req.params;

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    if (typeof spaceId !== "string" || !spaceId.trim()) {
      return res.status(400).json({
        message: "Space ID is required",
      });
    }

    const result = await joinSpace(guestId, spaceId.trim());

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "SPACE_NOT_FOUND") {
      return res.status(404).json({
        message: "Space not found",
      });
    }

    if (result.error === "ALREADY_MEMBER") {
      return res.status(409).json({
        message: "You are already a member of this space",
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Join space error:", error);

    return res.status(500).json({
      message: "Failed to join space",
    });
  }
}

export async function leave(req: Request, res: Response) {
  try {
    const guestId = getGuestId(req);
    const { spaceId } = req.params;

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    if (typeof spaceId !== "string" || !spaceId.trim()) {
      return res.status(400).json({
        message: "Space ID is required",
      });
    }

    const result = await leaveSpace(guestId, spaceId.trim());

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "SPACE_NOT_FOUND") {
      return res.status(404).json({
        message: "Space not found",
      });
    }

    if (result.error === "NOT_MEMBER") {
      return res.status(404).json({
        message: "You are not a member of this space",
      });
    }

    if (result.error === "OWNER_CANNOT_LEAVE") {
      return res.status(400).json({
        message: "The owner cannot leave the space. Transfer ownership first.",
      });
    }

    return res.status(200).json({
      message: "You left the space",
    });
  } catch (error) {
    console.error("Leave space error:", error);

    return res.status(500).json({
      message: "Failed to leave space",
    });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const guestId = getGuestId(req);
    const { spaceId } = req.params;

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    if (typeof spaceId !== "string" || !spaceId.trim()) {
      return res.status(400).json({
        message: "Space ID is required",
      });
    }

    const result = await deleteSpace(guestId, spaceId.trim());

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "SPACE_NOT_FOUND") {
      return res.status(404).json({
        message: "Space not found",
      });
    }

    if (result.error === "NOT_MEMBER") {
      return res.status(403).json({
        message: "You are not a member of this space",
      });
    }

    if (result.error === "ONLY_OWNER_CAN_DELETE") {
      return res.status(403).json({
        message: "Only the space owner can delete this space",
      });
    }

    return res.status(200).json({
      message: "Space deleted successfully",
    });
  } catch (error) {
    console.error("Delete space error:", error);

    return res.status(500).json({
      message: "Failed to delete space",
    });
  }
}
