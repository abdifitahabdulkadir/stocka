import { api, get, post } from "./api";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "staff";
}

export const getMe = () => get<{ user: User }>("/api/me").then((d) => d.user).catch(() => null);
export const needsSetup = () => get<{ needsSetup: boolean }>("/api/setup").then((d) => d.needsSetup).catch(() => false);
export const login = (email: string, password: string) =>
  post<{ user: User }>("/api/login", { email, password }).then((d) => d.user);
/** Creates the first admin (only works while there are no users). */
export const register = (email: string, password: string, name?: string) =>
  post<{ user: User }>("/api/register", { email, password, name }).then((d) => d.user);
export const logout = () => post("/api/logout").catch(() => null);
export const updateMe = (name: string) => api<{ user: User }>("PATCH", "/api/me", { name }).then((d) => d.user);
export const changePassword = (current: string, next: string) => post("/api/me/password", { current, next });
