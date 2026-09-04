import type { Request, Response } from "express";

import {
  createConversation,
  getSpaceConversations,
  getConversationById,
  joinConversation,
  leaveConversation,
} from "../services/conversation.service.js";

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
    const { spaceId } = req.params;
    const { title } = req.body;

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

    if (title !== undefined && typeof title !== "string") {
      return res.status(400).json({
        message: "Title must be a string",
      });
    }

    if (typeof title === "string" && title.trim().length > 100) {
      return res.status(400).json({
        message: "Title cannot exceed 100 characters",
      });
    }

    const result = await createConversation(
      guestId,
      spaceId.trim(),
      typeof title === "string" ? title.trim() : undefined,
    );

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "NOT_MEMBER") {
      return res.status(403).json({
        message: "You must be a member of this space",
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      message: "Failed to create conversation",
    });
  }
}

export async function list(req: Request, res: Response) {
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

    const result = await getSpaceConversations(
      guestId,
      spaceId.trim(),
    );

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "NOT_MEMBER") {
      return res.status(403).json({
        message: "You must be a member of this space",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      message: "Failed to fetch conversations",
    });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const guestId = getGuestId(req);
    const { conversationId } = req.params;

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    if (
      typeof conversationId !== "string" ||
      !conversationId.trim()
    ) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    const result = await getConversationById(
      guestId,
      conversationId.trim(),
    );

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "NOT_FOUND") {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    if (result.error === "NOT_SPACE_MEMBER") {
      return res.status(403).json({
        message: "You must be a member of the space",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get conversation error:", error);

    return res.status(500).json({
      message: "Failed to fetch conversation",
    });
  }
}

export async function join(req: Request, res: Response) {
  try {
    const guestId = getGuestId(req);
    const { conversationId } = req.params;

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    if (
      typeof conversationId !== "string" ||
      !conversationId.trim()
    ) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    const result = await joinConversation(
      guestId,
      conversationId.trim(),
    );

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "CONVERSATION_NOT_FOUND") {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    if (result.error === "NOT_SPACE_MEMBER") {
      return res.status(403).json({
        message: "You must be a member of the space",
      });
    }

    if (result.error === "ALREADY_PARTICIPANT") {
      return res.status(409).json({
        message: "You are already a participant",
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Join conversation error:", error);

    return res.status(500).json({
      message: "Failed to join conversation",
    });
  }
}

export async function leave(req: Request, res: Response) {
  try {
    const guestId = getGuestId(req);
    const { conversationId } = req.params;

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    if (!guestId) {
      return res.status(401).json({
        message: "Guest session not found",
      });
    }

    if (
      typeof conversationId !== "string" ||
      !conversationId.trim()
    ) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    const result = await leaveConversation(
      guestId,
      conversationId.trim(),
    );

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "NOT_PARTICIPANT") {
      return res.status(404).json({
        message: "You are not a participant",
      });
    }

    return res.status(200).json({
      message: "You left the conversation",
    });
  } catch (error) {
    console.error("Leave conversation error:", error);

    return res.status(500).json({
      message: "Failed to leave conversation",
    });
  }
}

