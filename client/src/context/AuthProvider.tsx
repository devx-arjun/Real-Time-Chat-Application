import { useEffect, useState, type ReactNode } from "react";

import {
  createGuest as createGuestApi,
  getGuest,
  type Guest,
} from "../api/guest.api";

import { AuthContext } from "./AuthContext";

const GUEST_ID_KEY = "linkup_guest_id";
const USERNAME_KEY = "linkup_username";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreGuest() {
      const guestId = localStorage.getItem(GUEST_ID_KEY);

      console.log("Restoring guest...");
      console.log("Stored guest ID:", guestId);

      if (!guestId) {
        console.log("No guest ID found");
        setGuest(null);
        setLoading(false);
        return;
      }

      try {
        const currentGuest = await getGuest(guestId);

        console.log("Guest restored:", currentGuest);

        setGuest(currentGuest);

        localStorage.setItem(USERNAME_KEY, currentGuest.username);
      } catch (error) {
        console.error("Guest does not exist or could not be restored:", error);

        // Remove stale authentication data.
        localStorage.removeItem(GUEST_ID_KEY);
        localStorage.removeItem(USERNAME_KEY);

        setGuest(null);
      } finally {
        setLoading(false);
      }
    }

    restoreGuest();
  }, []);

  async function createGuest(username: string) {
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      throw new Error("Username is required");
    }

    const newGuest = await createGuestApi({
      username: cleanUsername,
    });

    console.log("CREATE GUEST RESULT:", newGuest);

    localStorage.setItem(GUEST_ID_KEY, newGuest.guestId);
    localStorage.setItem(USERNAME_KEY, newGuest.username);

    setGuest(newGuest);
  }

  function logout() {
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(USERNAME_KEY);

    setGuest(null);
  }

  return (
    <AuthContext.Provider
      value={{
        guest,
        guestId: guest?.guestId ?? null,
        loading,
        createGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
