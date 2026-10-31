import { createContext, useContext } from "react";
import type { User } from "./auth";

interface UserState {
  user: User;
  /** Replace the signed-in user after a profile update. */
  setUser: (u: User) => void;
}

const UserContext = createContext<UserState | null>(null);

export const UserProvider = UserContext.Provider;

/** The signed-in user. Only call inside the signed-in app shell. */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}

export const isAdmin = (u: User) => u.role === "admin";

/** "Maryan Abdulaziz" -> "MA"; falls back to the email's first letter. */
export const initials = (u: Pick<User, "name" | "email">) =>
  (u.name || u.email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
