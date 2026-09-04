import type { Request, Response } from "express";
import { getProfileByGuestId } from "../services/profile.service.js";

export async function getProfileController(
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

    const profile = await getProfileByGuestId(guestId);

    if (!profile) {
      return res.status(401).json({
        message: "Guest session is invalid",
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Failed to load profile:", error);

    return res.status(500).json({
      message: "Unable to load profile",
    });
  }
}
