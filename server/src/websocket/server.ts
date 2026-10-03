import { prisma } from "../config/database.js";
import type { Server as HttpServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import {
  createMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
} from "../services/message.service.js";

const connections = new Map<string, Set<WebSocket>>();
const conversationConnections = new Map<string, Set<WebSocket>>();

function send(socket: WebSocket, payload: unknown) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function addConnection(userId: string, socket: WebSocket) {
  let sockets = connections.get(userId);

  if (!sockets) {
    sockets = new Set();
    connections.set(userId, sockets);
  }

  sockets.add(socket);
}

function removeConnection(userId: string, socket: WebSocket) {
  const sockets = connections.get(userId);

  if (!sockets) {
    return;
  }

  sockets.delete(socket);

  if (sockets.size === 0) {
    connections.delete(userId);
  }
}

function joinConversation(conversationId: string, socket: WebSocket) {
  let sockets = conversationConnections.get(conversationId);

  if (!sockets) {
    sockets = new Set();
    conversationConnections.set(conversationId, sockets);
  }

  sockets.add(socket);
}

function leaveConversation(conversationId: string, socket: WebSocket) {
  const sockets = conversationConnections.get(conversationId);

  if (!sockets) {
    return;
  }

  sockets.delete(socket);

  if (sockets.size === 0) {
    conversationConnections.delete(conversationId);
  }
}

export function broadcastToConversation(conversationId: string, payload: unknown) {
  const sockets = conversationConnections.get(conversationId);

  if (!sockets) {
    return;
  }

  for (const socket of sockets) {
    send(socket, payload);
  }
}

export function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  wss.on("connection", (socket) => {

    let userId: string | null = null;
    let authenticatedGuestId: string | null = null;
    let authenticatedUsername: string | null = null;

    const joinedConversations = new Set<string>();

    socket.on("message", async (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        // --------------------------------------------------
        // PING
        // --------------------------------------------------

        if (data.type === "ping") {
          send(socket, {
            type: "pong",
          });

          return;
        }

        // --------------------------------------------------
        // AUTH
        // --------------------------------------------------

        if (data.type === "auth") {
          if (typeof data.guestId !== "string") {
            send(socket, {
              type: "error",
              message: "Guest ID is required",
            });

            return;
          }

          const guestId = data.guestId.trim();

          if (!guestId) {
            send(socket, {
              type: "error",
              message: "Guest ID is required",
            });

            return;
          }

          const user = await prisma.user.findUnique({
            where: {
              guestId,
            },
            select: {
              id: true,
              guestId: true,
              username: true,
            },
          });

          if (!user) {
            send(socket, {
              type: "error",
              message: "Invalid guest ID",
            });

            socket.close();
            return;
          }

          userId = user.id;
          authenticatedGuestId = user.guestId;
          authenticatedUsername = user.username;

          addConnection(user.id, socket);

          send(socket, {
            type: "auth:success",
            user,
          });

          return;
        }

        // --------------------------------------------------
        // AUTHENTICATION CHECK
        // --------------------------------------------------

        if (!userId || !authenticatedGuestId) {
          send(socket, {
            type: "error",
            message: "Authentication required",
          });

          return;
        }

        // --------------------------------------------------
        // CONVERSATION JOIN
        // --------------------------------------------------

        if (data.type === "conversation:join") {
          if (typeof data.conversationId !== "string") {
            send(socket, {
              type: "error",
              message: "Invalid conversation ID",
            });

            return;
          }

          const conversationId = data.conversationId.trim();

          if (!conversationId) {
            send(socket, {
              type: "error",
              message: "Invalid conversation ID",
            });

            return;
          }

          const participant = await prisma.conversationParticipant.findUnique({
            where: {
              userId_conversationId: {
                userId,
                conversationId,
              },
            },
          });

          if (!participant) {
            send(socket, {
              type: "error",
              message: "You are not a participant in this conversation",
            });

            return;
          }

          joinConversation(conversationId, socket);
          joinedConversations.add(conversationId);
          send(socket, {
            type: "conversation:joined",
            conversationId,
          });

          return;
        }

        // --------------------------------------------------
        // CONVERSATION LEAVE
        // --------------------------------------------------

        if (data.type === "conversation:leave") {
          if (typeof data.conversationId !== "string") {
            send(socket, {
              type: "error",
              message: "Invalid conversation ID",
            });

            return;
          }

          const conversationId = data.conversationId.trim();

          leaveConversation(conversationId, socket);
          joinedConversations.delete(conversationId);

          send(socket, {
            type: "conversation:left",
            conversationId,
          });

          return;
        }

        // --------------------------------------------------
        // TYPING START
        // --------------------------------------------------

        if (data.type === "typing:start") {
          if (typeof data.conversationId !== "string") {
            send(socket, {
              type: "error",
              message: "Invalid conversation ID",
            });

            return;
          }

          const conversationId = data.conversationId.trim();

          if (!conversationId) {
            send(socket, {
              type: "error",
              message: "Invalid conversation ID",
            });

            return;
          }

          // The user must already be inside the WebSocket conversation room.
          if (!joinedConversations.has(conversationId)) {
            send(socket, {
              type: "error",
              message: "Join the conversation first",
            });

            return;
          }

          // Make sure the user is actually a database participant.
          const participant = await prisma.conversationParticipant.findUnique({
            where: {
              userId_conversationId: {
                userId,
                conversationId,
              },
            },
          });

          if (!participant) {
            send(socket, {
              type: "error",
              message: "You are not a participant in this conversation",
            });

            return;
          }

          broadcastToConversation(conversationId, {
            type: "typing:start",
            conversationId,
            userId,
            username: authenticatedUsername,
          });

          return;
        }

        // --------------------------------------------------
        // TYPING STOP
        // --------------------------------------------------

        if (data.type === "typing:stop") {
          if (typeof data.conversationId !== "string") {
            send(socket, {
              type: "error",
              message: "Invalid conversation ID",
            });

            return;
          }

          const conversationId = data.conversationId.trim();

          if (!conversationId) {
            send(socket, {
              type: "error",
              message: "Invalid conversation ID",
            });

            return;
          }

          if (!joinedConversations.has(conversationId)) {
            return;
          }

          broadcastToConversation(conversationId, {
            type: "typing:stop",
            conversationId,
            userId,
          });

          return;
        }

        // --------------------------------------------------
        // MESSAGE SEND
        // --------------------------------------------------

        if (data.type === "message:send") {
          if (typeof data.conversationId !== "string") {
            send(socket, {
              type: "error",
              message: "Conversation ID is required",
            });

            return;
          }

          const conversationId = data.conversationId.trim();

          if (!conversationId) {
            send(socket, {
              type: "error",
              message: "Conversation ID is required",
            });

            return;
          }

          if (!joinedConversations.has(conversationId)) {
            send(socket, {
              type: "error",
              message: "Join the conversation first",
            });

            return;
          }

          if (typeof data.content !== "string") {
            send(socket, {
              type: "error",
              message: "Message content is required",
            });

            return;
          }

          const content = data.content.trim();

          if (!content) {
            send(socket, {
              type: "error",
              message: "Message cannot be empty",
            });

            return;
          }

          if (content.length > 5000) {
            send(socket, {
              type: "error",
              message: "Message cannot exceed 5000 characters",
            });

            return;
          }

          if (
            data.replyToId !== undefined &&
            typeof data.replyToId !== "string"
          ) {
            send(socket, {
              type: "error",
              message: "Invalid reply message ID",
            });

            return;
          }

          // IMPORTANT:
          // createMessage expects guestId, NOT userId.
          const result = await createMessage(
            authenticatedGuestId,
            conversationId,
            content,
            data.replyToId,
          );
          if (result.error === "GUEST_NOT_FOUND") {
            send(socket, {
              type: "error",
              message: "Guest not found",
            });

            return;
          }

          if (result.error === "NOT_PARTICIPANT") {
            send(socket, {
              type: "error",
              message: "You must join the conversation before sending messages",
            });

            return;
          }

          if (result.error === "CONVERSATION_NOT_FOUND") {
            send(socket, {
              type: "error",
              message: "Conversation not found",
            });

            return;
          }

          if (result.error === "INVALID_REPLY") {
            send(socket, {
              type: "error",
              message: "Reply message does not exist in this conversation",
            });

            return;
          }

          if (!result.message) {
            console.error(
              "Message creation succeeded but no message was returned",
            );

            send(socket, {
              type: "error",
              message: "Failed to create message",
            });

            return;
          }

          broadcastToConversation(conversationId, {
            type: "message:new",
            message: result.message,
          });

          return;
        }

        // --------------------------------------------------
        // MESSAGE EDIT
        // --------------------------------------------------

        if (data.type === "message:edit") {
          if (typeof data.messageId !== "string") {
            send(socket, {
              type: "error",
              message: "Message ID is required",
            });

            return;
          }

          if (typeof data.content !== "string") {
            send(socket, {
              type: "error",
              message: "Message content is required",
            });

            return;
          }

          const content = data.content.trim();

          if (!content) {
            send(socket, {
              type: "error",
              message: "Message cannot be empty",
            });

            return;
          }

          if (content.length > 5000) {
            send(socket, {
              type: "error",
              message: "Message cannot exceed 5000 characters",
            });

            return;
          }

          const existingMessage = await prisma.message.findUnique({
            where: {
              id: data.messageId,
            },
            select: {
              conversationId: true,
            },
          });

          if (!existingMessage) {
            send(socket, {
              type: "error",
              message: "Message not found",
            });

            return;
          }

          if (!joinedConversations.has(existingMessage.conversationId)) {
            send(socket, {
              type: "error",
              message: "Join the conversation first",
            });

            return;
          }

          // message service expects guestId.
          const result = await editMessage(
            authenticatedGuestId,
            data.messageId,
            content,
          );

          if (result.error === "GUEST_NOT_FOUND") {
            send(socket, {
              type: "error",
              message: "Guest not found",
            });

            return;
          }

          if (result.error === "MESSAGE_NOT_FOUND") {
            send(socket, {
              type: "error",
              message: "Message not found",
            });

            return;
          }

          if (result.error === "NOT_MESSAGE_OWNER") {
            send(socket, {
              type: "error",
              message: "You can only edit your own messages",
            });

            return;
          }

          if (!result.message) {
            send(socket, {
              type: "error",
              message: "Failed to edit message",
            });

            return;
          }

          broadcastToConversation(existingMessage.conversationId, {
            type: "message:updated",
            message: result.message,
          });

          return;
        }

        // --------------------------------------------------
        // MESSAGE DELETE
        // --------------------------------------------------

        if (data.type === "message:delete") {
          if (typeof data.messageId !== "string") {
            send(socket, {
              type: "error",
              message: "Message ID is required",
            });

            return;
          }

          const existingMessage = await prisma.message.findUnique({
            where: {
              id: data.messageId,
            },
            select: {
              conversationId: true,
            },
          });

          if (!existingMessage) {
            send(socket, {
              type: "error",
              message: "Message not found",
            });

            return;
          }

          if (!joinedConversations.has(existingMessage.conversationId)) {
            send(socket, {
              type: "error",
              message: "Join the conversation first",
            });

            return;
          }

          // message service expects guestId.
          const result = await deleteMessage(
            authenticatedGuestId,
            data.messageId,
          );

          if (result.error === "GUEST_NOT_FOUND") {
            send(socket, {
              type: "error",
              message: "Guest not found",
            });

            return;
          }

          if (result.error === "MESSAGE_NOT_FOUND") {
            send(socket, {
              type: "error",
              message: "Message not found",
            });

            return;
          }

          if (result.error === "NOT_MESSAGE_OWNER") {
            send(socket, {
              type: "error",
              message: "You can only delete your own messages",
            });

            return;
          }

          if (result.error === "ALREADY_DELETED") {
            send(socket, {
              type: "error",
              message: "Message has already been deleted",
            });

            return;
          }

          if (!result.message) {
            send(socket, {
              type: "error",
              message: "Failed to delete message",
            });

            return;
          }

          broadcastToConversation(existingMessage.conversationId, {
            type: "message:deleted",
            message: result.message,
          });

          return;
        }

        // --------------------------------------------------
        // MESSAGE REACTION
        // --------------------------------------------------

        if (data.type === "message:reaction") {
          if (typeof data.messageId !== "string") {
            send(socket, {
              type: "error",
              message: "Message ID is required",
            });

            return;
          }

          if (typeof data.emoji !== "string") {
            send(socket, {
              type: "error",
              message: "Emoji is required",
            });

            return;
          }

          const emoji = data.emoji.trim();

          if (!emoji) {
            send(socket, {
              type: "error",
              message: "Emoji cannot be empty",
            });

            return;
          }

          if (emoji.length > 20) {
            send(socket, {
              type: "error",
              message: "Invalid emoji",
            });

            return;
          }

          const message = await prisma.message.findUnique({
            where: {
              id: data.messageId,
            },
            select: {
              conversationId: true,
            },
          });

          if (!message) {
            send(socket, {
              type: "error",
              message: "Message not found",
            });

            return;
          }

          if (!joinedConversations.has(message.conversationId)) {
            send(socket, {
              type: "error",
              message: "Join the conversation first",
            });

            return;
          }

          // message service expects guestId.
          const result = await toggleReaction(
            authenticatedGuestId,
            data.messageId,
            emoji,
          );

          if (result.error === "GUEST_NOT_FOUND") {
            send(socket, {
              type: "error",
              message: "Guest not found",
            });

            return;
          }

          if (result.error === "MESSAGE_NOT_FOUND") {
            send(socket, {
              type: "error",
              message: "Message not found",
            });

            return;
          }

          if (result.error === "MESSAGE_DELETED") {
            send(socket, {
              type: "error",
              message: "Cannot react to a deleted message",
            });

            return;
          }

          if (result.error === "NOT_PARTICIPANT") {
            send(socket, {
              type: "error",
              message: "You are not a participant in this conversation",
            });

            return;
          }

          broadcastToConversation(result.conversationId, {
            type: "message:reaction",
            conversationId: result.conversationId,
            messageId: result.messageId,
            emoji: result.emoji,
            reacted: result.reacted,
            reactions: result.reactions,
          });

          return;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);

        send(socket, {
          type: "error",
          message: "Invalid WebSocket message",
        });
      }
    });

    // --------------------------------------------------
    // SOCKET CLOSE
    // --------------------------------------------------

    socket.on("close", () => {
      for (const conversationId of joinedConversations) {
        leaveConversation(conversationId, socket);
      }

      joinedConversations.clear();

      if (userId) {
        removeConnection(userId, socket);
      }
    });

    // --------------------------------------------------
    // SOCKET ERROR
    // --------------------------------------------------

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
}
