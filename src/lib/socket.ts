import { io, type Socket } from "socket.io-client";
import type { ThreadMessage } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ThreadSocketEvents = {
  "refresh-threads": () => void;
  "new-message": (message: ThreadMessage & { threadId?: string }) => void;
};

export const createThreadSocket = (): Socket<ThreadSocketEvents, ThreadSocketEvents> =>
  io(SOCKET_URL, {
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket"],
  });
