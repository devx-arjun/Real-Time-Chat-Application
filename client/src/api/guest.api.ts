import { api } from "./client";

export interface Guest {
  id: string;
  guestId: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface CreateGuestResponse {
  guest: Guest;
}

interface GetGuestResponse {
  guest: Guest;
}

export async function createGuest(input: { username: string }) {
  const response = await api.post<CreateGuestResponse>("/guests", input);

  return response.data.guest;
}

export async function getGuest(guestId: string) {
  const response = await api.get<GetGuestResponse>(`/guests/${guestId}`);

  return response.data.guest;
}

export async function getCurrentGuest() {
  const response = await api.get<GetGuestResponse>("/guests/me");

  return response.data.guest;
}