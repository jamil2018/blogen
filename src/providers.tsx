"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toast } from "@heroui/react";
import { AuthProvider } from "./components/auth/AuthProvider";
import type { User } from "./types";

export default function Providers({
  children,
  user,
}: {
  children: ReactNode;
  user: User | null;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AuthProvider user={user}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toast.Provider placement="bottom end" />
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      </QueryClientProvider>
    </AuthProvider>
  );
}
