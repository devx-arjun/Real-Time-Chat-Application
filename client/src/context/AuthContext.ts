import { createContext } from "react";

import type { Guest } from "../api/guest.api";

export interface AuthContextValue {
  guest: Guest | null;
  guestId: string | null;
  loading: boolean;
  createGuest: (username: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);