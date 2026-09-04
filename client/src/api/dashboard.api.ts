import { api } from "./client";

export interface DashboardMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    username: string;
    avatarUrl: string | null;
  };
}

export interface DashboardSpace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  members: number;
  online: number;
  messages: DashboardMessage[];
}

export interface DashboardActivity {
  id: string;
  username: string;
  avatarUrl: string | null;
  action: "joined" | "posted";
  room: string;
  createdAt: string;
}

export interface DashboardData {
  spaces: DashboardSpace[];
  activity: DashboardActivity[];
  totalOnline: number;
}

export async function getDashboard() {
  const response = await api.get<DashboardData>("/dashboard");

  return response.data;
}