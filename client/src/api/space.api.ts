import { api } from "./client";

export interface SpaceMember {
  id: string;
  role: "OWNER" | "MODERATOR" | "MEMBER";
  joinedAt: string;
  user: {
    id: string;
    guestId: string;
    username: string;
    avatarUrl: string | null;
    bio?: string | null;
  };
}

export interface SpaceConversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    participants: number;
    messages: number;
  };
}

export interface Space {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  role?: "OWNER" | "MODERATOR" | "MEMBER";
  joinedAt?: string;
  currentUserRole?: "OWNER" | "MODERATOR" | "MEMBER";

  _count?: {
    members: number;
    conversations: number;
  };

  members?: SpaceMember[];
  conversations?: SpaceConversation[];
}

export interface CreateSpaceInput {
  name: string;
  description?: string;
}

interface CreateSpaceResponse {
  space: Space;
}

interface GetSpacesResponse {
  spaces: Space[];
}

interface DiscoverSpacesResponse {
  spaces: Space[];
}

interface GetSpaceResponse {
  space: Space;
}

interface JoinSpaceResponse {
  membership: {
    id: string;
    role: "MEMBER";
    joinedAt: string;
    space: {
      id: string;
      name: string;
      slug: string;
    };
    user: {
      id: string;
      guestId: string;
      username: string;
      avatarUrl: string | null;
    };
  };
}

interface LeaveSpaceResponse {
  success?: boolean;
  message?: string;
}

export async function getMySpaces(): Promise<Space[]> {
  const response = await api.get<GetSpacesResponse>("/spaces");

  return response.data.spaces;
}

export async function getDiscoverableSpaces(): Promise<Space[]> {
  const response = await api.get<DiscoverSpacesResponse>(
    "/spaces/discover",
  );

  return response.data.spaces;
}

export async function getSpace(spaceId: string): Promise<Space> {
  const response = await api.get<GetSpaceResponse>(
    `/spaces/${spaceId}`,
  );

  return response.data.space;
}

export async function createSpace(
  input: CreateSpaceInput,
): Promise<Space> {
  const response = await api.post<CreateSpaceResponse>(
    "/spaces",
    input,
  );

  return response.data.space;
}

export async function joinSpace(
  spaceId: string,
): Promise<JoinSpaceResponse["membership"]> {
  const response = await api.post<JoinSpaceResponse>(
    `/spaces/${spaceId}/join`,
  );

  return response.data.membership;
}

export async function leaveSpace(
  spaceId: string,
): Promise<LeaveSpaceResponse> {
  const response = await api.post<LeaveSpaceResponse>(
    `/spaces/${spaceId}/leave`,
  );

  return response.data;
}

export async function deleteSpace(spaceId: string): Promise<void> {
  await api.delete(`/spaces/${spaceId}`);
}