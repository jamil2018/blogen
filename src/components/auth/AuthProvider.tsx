"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { User } from "../../types";

type AuthContextValue = {
  user: User | null;
};

const AuthContext = createContext<AuthContextValue>({ user: null });

export function AuthProvider({
  user,
  children,
}: {
  user: User | null;
  children: ReactNode;
}) {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(AuthContext).user;
}
