import { api } from "./client";

export interface ConversationUser {
  id: string;
  guestId: string;
  username: string;
  avatarUrl: string | null;
  bio?: string | null;
}

export interface ConversationParticipant {
  id: string;
  joinedAt: string;
  userId: string;
  conversationId: string;
  user: ConversationUser;
}

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  spaceId: string;

  space?: {
    id: string;
    name: string;
    slug: string;
  };

  participants: ConversationParticipant[];

  _count: {
    participants: number;
    messages: number;
  };
}

interface CreateConversationResponse {
  conversation: Conversation;
}

interface GetConversationsResponse {
  conversations: Conversation[];
}

interface GetConversationResponse {
  conversation: Conversation;
  isParticipant: boolean;
}

interface JoinConversationResponse {
  participant: ConversationParticipant;
}

interface LeaveConversationResponse {
  message: string;
}

export async function createConversation(
  spaceId: string,
  title?: string,
): Promise<Conversation> {
  const response = await api.post<CreateConversationResponse>(
    `/spaces/${spaceId}/conversations`,
    {
      ...(title?.trim()
        ? {
            title: title.trim(),
          }
        : {}),
    },
  );

  return response.data.conversation;
}

export async function getSpaceConversations(
  spaceId: string,
): Promise<Conversation[]> {
  const response = await api.get<GetConversationsResponse>(
    `/spaces/${spaceId}/conversations`,
  );

  return response.data.conversations;
}

export async function getConversation(
  conversationId: string,
): Promise<GetConversationResponse> {
  const response = await api.get<GetConversationResponse>(
    `/conversations/${conversationId}`,
  );

  return response.data;
}

export async function joinConversation(
  conversationId: string,
): Promise<ConversationParticipant> {
  const response = await api.post<JoinConversationResponse>(
    `/conversations/${conversationId}/join`,
  );

  return response.data.participant;
}

export async function leaveConversation(
  conversationId: string,
): Promise<LeaveConversationResponse> {
  const response = await api.post<LeaveConversationResponse>(
    `/conversations/${conversationId}/leave`,
  );

  return response.data;
}

export interface MessageSender {
  id: string;
  guestId: string;
  username: string;
  avatarUrl: string | null;
}

export interface MessageReply {
  id: string;
  content: string;
  sender: {
    id: string;
    guestId: string;
    username: string;
  };
}

export interface MessageReaction {
  id: string;
  emoji: string;
  user: {
    id: string;
    guestId: string;
    username: string;
  };
}

export interface ConversationMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sender: MessageSender;
  replyTo: MessageReply | null;
  reactions: MessageReaction[];
}

interface GetMessagesResponse {
  messages: ConversationMessage[];
  nextCursor: string | null;
}

export async function getMessages(
  conversationId: string,
  limit = 50,
  cursor?: string,
): Promise<GetMessagesResponse> {
  const response = await api.get<GetMessagesResponse>(
    `/conversations/${conversationId}/messages`,
    {
      params: {
        limit,
        ...(cursor ? { cursor } : {}),
      },
    },
  );

  return response.data;
}

export async function deleteMessage(messageId: string): Promise<void> {
  await api.delete(`/messages/${messageId}`, {
    data: {
      guestId: localStorage.getItem("linkup_guest_id"),
    },
  });
}

export async function editMessage(
  messageId: string,
  content: string,
): Promise<void> {
  await api.patch(`/messages/${messageId}`, {
    guestId: localStorage.getItem("linkup_guest_id"),
    content: content.trim(),
  });
}
