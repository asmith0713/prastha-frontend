"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const hydrate = useAuthStore((state) => state.hydrate);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  React.useEffect(() => {
    if (status === "loading") {
      hydrate();
    }
  }, [status, hydrate]);

  return { user, status, setUser, logout } as const;
}
