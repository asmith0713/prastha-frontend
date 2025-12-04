"use client";

import { create } from "zustand";
import type { User } from "@/types";

const STORAGE_KEY = "prastha:user";

export type AuthState = {
  user: User | null;
  status: "loading" | "idle";
  hydrate: () => void;
  setUser: (user: User, token?: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        set({ user: JSON.parse(stored), status: "idle" });
        return;
      } catch (error) {
        console.warn("Failed to parse stored user", error);
      }
    }
    set({ status: "idle", user: null });
  },
  setUser: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      if (token) localStorage.setItem("prastha:token", token);
    }
    set({ user, status: "idle" });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("prastha:token");
    }
    set({ user: null, status: "idle" });
  },
}));
