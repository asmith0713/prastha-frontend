"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { threadsAPI } from "@/lib/api";
import type { Thread, ThreadAlert, ThreadInsights } from "@/types";

const THREADS_CACHE_KEY = ["threads"] as const;

export function useThreads() {
  const queryClient = useQueryClient();

  const threadsQuery = useQuery<Thread[]>({
    queryKey: THREADS_CACHE_KEY,
    queryFn: () => threadsAPI.list(),
    refetchInterval: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: threadsAPI.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: THREADS_CACHE_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Thread> }) => threadsAPI.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: THREADS_CACHE_KEY }),
  });

  const requestMutation = useMutation({
    mutationFn: ({ threadId, userId }: { threadId: string; userId: string }) =>
      threadsAPI.requestJoin(threadId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: THREADS_CACHE_KEY }),
  });

  const handleReqMutation = useMutation({
    mutationFn: ({ threadId, userId, approve, creatorId }: { threadId: string; userId: string; approve: boolean; creatorId: string }) =>
      threadsAPI.handleRequest(threadId, userId, approve, creatorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: THREADS_CACHE_KEY }),
  });

  const messageMutation = useMutation({
    mutationFn: ({
      threadId,
      message,
    }: {
      threadId: string;
      message: {
        user: string;
        userId: string;
        message: string;
        replyToMessageId?: string | null;
        replyToUser?: string | null;
        replyPreview?: string | null;
      };
    }) => threadsAPI.sendMessage(threadId, message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: THREADS_CACHE_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ threadId, userId }: { threadId: string; userId: string }) =>
      threadsAPI.remove(threadId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: THREADS_CACHE_KEY }),
  });

  return {
    threadsQuery,
    createThread: createMutation.mutateAsync,
    updateThread: updateMutation.mutateAsync,
    requestJoin: requestMutation.mutateAsync,
    handleRequest: handleReqMutation.mutateAsync,
    sendMessage: messageMutation.mutateAsync,
    deleteThread: deleteMutation.mutateAsync,
  };
}

export function useUserThreads(userId?: string) {
  return useQuery<ThreadInsights>({
    queryKey: [...THREADS_CACHE_KEY, "user", userId],
    queryFn: () => threadsAPI.byUser(userId as string),
    enabled: Boolean(userId),
  });
}

export function useThreadAlerts(userId?: string) {
  return useQuery<ThreadAlert[]>({
    queryKey: [...THREADS_CACHE_KEY, "alerts", userId],
    queryFn: () => threadsAPI.alerts(userId as string),
    enabled: Boolean(userId),
  });
}
