import type { Request, Response } from "express";

import {
  createMessage,
  getMessages,
  editMessage,
  deleteMessage,
  toggleReaction,
} from "../services/message.service.js";

export async function create(req: Request, res: Response) {
  try {
    const conversationId = req.params.conversationId;
    const { guestId, content, replyToId } = req.body;

    if (typeof conversationId !== "string" || !conversationId.trim()) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    if (typeof guestId !== "string" || !guestId.trim()) {
      return res.status(400).json({
        message: "Guest ID is required",
      });
    }

    if (typeof content !== "string") {
      return res.status(400).json({
        message: "Content must be a string",
      });
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    if (trimmedContent.length > 5000) {
      return res.status(400).json({
        message: "Message cannot exceed 5000 characters",
      });
    }

    if (replyToId !== undefined && typeof replyToId !== "string") {
      return res.status(400).json({
        message: "Invalid reply message ID",
      });
    }

    const result = await createMessage(
      guestId.trim(),
      conversationId.trim(),
      trimmedContent,
      replyToId,
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

    if (result.error === "NOT_PARTICIPANT") {
      return res.status(403).json({
        message: "You must join the conversation before sending messages",
      });
    }

    if (result.error === "INVALID_REPLY") {
      return res.status(400).json({
        message: "Reply message does not exist in this conversation",
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Create message error:", error);

    return res.status(500).json({
      message: "Failed to create message",
    });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const conversationId = req.params.conversationId;
    const guestId = req.headers["x-guest-id"];

    if (typeof conversationId !== "string" || !conversationId.trim()) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    if (typeof guestId !== "string" || !guestId.trim()) {
      return res.status(400).json({
        message: "Guest ID is required",
      });
    }

    const rawLimit = req.query.limit;

    let limit = 50;

    if (typeof rawLimit === "string") {
      const parsedLimit = Number(rawLimit);

      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
      ) {
        return res.status(400).json({
          message: "Limit must be between 1 and 100",
        });
      }

      limit = parsedLimit;
    }

    const cursor = req.query.cursor;

    if (cursor !== undefined && typeof cursor !== "string") {
      return res.status(400).json({
        message: "Invalid cursor",
      });
    }

    const result = await getMessages(
      guestId.trim(),
      conversationId.trim(),
      limit,
      cursor,
    );

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "NOT_PARTICIPANT") {
      return res.status(403).json({
        message: "You must join the conversation to view messages",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
}

export async function edit(req: Request, res: Response) {
  try {
    const messageId = req.params.messageId;
    const { guestId, content } = req.body;

    if (typeof messageId !== "string" || !messageId.trim()) {
      return res.status(400).json({
        message: "Message ID is required",
      });
    }

    if (typeof guestId !== "string" || !guestId.trim()) {
      return res.status(400).json({
        message: "Guest ID is required",
      });
    }

    if (typeof content !== "string") {
      return res.status(400).json({
        message: "Content must be a string",
      });
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    if (trimmedContent.length > 5000) {
      return res.status(400).json({
        message: "Message cannot exceed 5000 characters",
      });
    }

    const result = await editMessage(
      guestId.trim(),
      messageId.trim(),
      trimmedContent,
    );

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "MESSAGE_NOT_FOUND") {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (result.error === "NOT_MESSAGE_OWNER") {
      return res.status(403).json({
        message: "You can only edit your own messages",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Edit message error:", error);

    return res.status(500).json({
      message: "Failed to edit message",
    });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const messageId = req.params.messageId;
    const { guestId } = req.body;

    if (typeof messageId !== "string" || !messageId.trim()) {
      return res.status(400).json({
        message: "Message ID is required",
      });
    }

    if (typeof guestId !== "string" || !guestId.trim()) {
      return res.status(400).json({
        message: "Guest ID is required",
      });
    }

    const result = await deleteMessage(guestId.trim(), messageId.trim());

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "MESSAGE_NOT_FOUND") {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (result.error === "NOT_MESSAGE_OWNER") {
      return res.status(403).json({
        message: "You can only delete your own messages",
      });
    }

    if (result.error === "ALREADY_DELETED") {
      return res.status(409).json({
        message: "Message has already been deleted",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      message: "Failed to delete message",
    });
  }
}

export async function react(req: Request, res: Response) {
  try {
    const messageId = req.params.messageId;
    const { guestId, emoji } = req.body;

    if (typeof messageId !== "string" || !messageId.trim()) {
      return res.status(400).json({
        message: "Message ID is required",
      });
    }

    if (typeof guestId !== "string" || !guestId.trim()) {
      return res.status(400).json({
        message: "Guest ID is required",
      });
    }

    if (typeof emoji !== "string" || !emoji.trim()) {
      return res.status(400).json({
        message: "Emoji is required",
      });
    }

    if (emoji.trim().length > 20) {
      return res.status(400).json({
        message: "Emoji is too long",
      });
    }

    const result = await toggleReaction(
      guestId.trim(),
      messageId.trim(),
      emoji.trim(),
    );

    if (result.error === "GUEST_NOT_FOUND") {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    if (result.error === "MESSAGE_NOT_FOUND") {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (result.error === "MESSAGE_DELETED") {
      return res.status(400).json({
        message: "Cannot react to a deleted message",
      });
    }

    if (result.error === "NOT_PARTICIPANT") {
      return res.status(403).json({
        message: "You must join the conversation to react",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Toggle reaction error:", error);

    return res.status(500).json({
      message: "Failed to toggle reaction",
    });
  }
}
