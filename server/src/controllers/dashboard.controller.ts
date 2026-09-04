import type { Request, Response } from "express";
import { getGuestById } from "../services/guest.service.js";
import { getDashboardForUser } from "../services/dashboard.service.js";

export async function getDashboardController(
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

    const dashboard = await getDashboardForUser(guest.id);

    return res.status(200).json(dashboard);
  } catch (error) {
    console.error("Failed to get dashboard:", error);

    return res.status(500).json({
      message: "Unable to load dashboard",
    });
  }
}