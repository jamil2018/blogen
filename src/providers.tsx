"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider, useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toast } from "@heroui/react";
import { store } from "./redux/store";
import {
  hydrateUserData,
  USER_STORAGE_KEY,
} from "./redux/slices/userDataSlice";

function AuthHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(USER_STORAGE_KEY);
      dispatch(hydrateUserData(raw ? JSON.parse(raw) : {}));
    } catch {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      dispatch(hydrateUserData({}));
    }
  }, [dispatch]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthHydrator />
        {children}
        <Toast.Provider placement="bottom end" />
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      </QueryClientProvider>
    </Provider>
  );
}
