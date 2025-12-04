"use client";

import * as React from "react";
import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "glass-panel shadow-glow border border-white/20",
          description: "text-sm text-foreground/80",
        },
      }}
    />
  );
}
