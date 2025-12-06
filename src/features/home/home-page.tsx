"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { HomeHero } from "@/features/home/home-hero";
import { ThreadFeed } from "@/features/home/thread-feed";
import type { Thread } from "@/types";
import { ChatWindow } from "@/components/chat/chat-window";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useThreads } from "@/hooks/use-threads";
import { useAuth } from "@/hooks/use-auth";
import { CreateThreadDialog, type CreateThreadFormValues } from "@/features/create/create-thread-dialog";

export function HomePage() {
  const { user } = useAuth();
  const { threadsQuery, requestJoin, sendMessage, createThread, deleteThread } = useThreads();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerCategory, setComposerCategory] = useState<string>("other");
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  const threads = useMemo(() => threadsQuery.data ?? [], [threadsQuery.data]);
  const activeThread = useMemo<Thread | null>(() => {
    if (!activeThreadId) return null;
    return threads.find((thread) => thread.id === activeThreadId) ?? null;
  }, [threads, activeThreadId]);

  const handleComposerOpen = (category?: string) => {
    if (!user) {
      toast.error("Sign in required", { description: "Log in to launch a thread." });
      return;
    }
    setComposerCategory(category && category !== "all" ? category : "other");
    setIsComposerOpen(true);
  };

  const handleCreateThreadSubmit = async (values: CreateThreadFormValues) => {
    if (!user) {
      toast.error("Sign in required", { description: "Log in to launch a thread." });
      throw new Error("User not authenticated");
    }

    setIsCreatingThread(true);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + Number(values.durationHours) * 60 * 60 * 1000).toISOString();
    const extraTags = values.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [];
    const tags = Array.from(new Set([values.category, ...extraTags]));

    try {
      await createThread({
        title: values.title.trim(),
        description: values.description.trim(),
        location: values.location.trim(),
        creator: user.username,
        creatorId: user.id,
        tags,
        members: [user.id],
        pendingRequests: [],
        chat: [],
        createdAt: now.toISOString(),
        expiresAt,
      });
      toast.success("Thread launched", { description: "Your drop is now live." });
      setIsComposerOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Could not create thread", { description: "Please try again." });
      throw error;
    } finally {
      setIsCreatingThread(false);
    }
  };

  const handleRequestJoin = async (thread: Thread) => {
    if (!user) {
      toast.error("Sign in required", { description: "Log in to request thread access." });
      return;
    }
    try {
      await requestJoin({ threadId: thread.id, userId: user.id });
      toast.success("Request sent", { description: "The host will review it shortly." });
    } catch (error) {
      console.error(error);
      toast.error("Could not send request", { description: "Please try again in a moment." });
    }
  };

  const handleSendMessage = async ({
    message,
    replyToMessageId,
    replyToUser,
    replyPreview,
  }: {
    message: string;
    replyToMessageId?: string | null;
    replyToUser?: string | null;
    replyPreview?: string | null;
  }) => {
    if (!user || !activeThread) return;
    try {
      await sendMessage({
        threadId: activeThread.id,
        message: {
          user: user.username,
          userId: user.id,
          message,
          replyToMessageId,
          replyToUser,
          replyPreview,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Message failed", { description: "Please retry." });
    }
  };

  const handleDeleteThread = async () => {
    if (!user || !activeThread) {
      return;
    }
    try {
      await deleteThread({ threadId: activeThread.id, userId: user.id });
      setActiveThreadId(null);
      toast.success("Thread deleted", { description: "The thread has been permanently removed." });
    } catch (error) {
      console.error("Delete thread error:", error);
      toast.error("Could not delete thread", { description: "Please try again." });
      throw error;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 md:pb-16">
      <HomeHero onCreate={() => handleComposerOpen()} />
      <ThreadFeed
        threads={threads}
        currentUserId={user?.id}
        onOpen={(thread) => setActiveThreadId(thread.id)}
        onRequestJoin={handleRequestJoin}
        onCreateThread={handleComposerOpen}
        isLoading={threadsQuery.isLoading}
      />

      <Sheet open={Boolean(activeThread)} onOpenChange={(open) => !open && setActiveThreadId(null)}>
        <SheetContent side="right" className="h-full w-full sm:w-[90vw] md:w-[80vw] lg:max-w-3xl border-none p-0">
          {activeThread && user && (
            <ChatWindow
              thread={activeThread}
              currentUserId={user.id}
              isAdmin={user.isAdmin}
              messages={activeThread.chat ?? []}
              onSend={handleSendMessage}
              onDelete={handleDeleteThread}
            />
          )}
        </SheetContent>
      </Sheet>

      <CreateThreadDialog
        open={isComposerOpen}
        defaultCategory={composerCategory}
        isSubmitting={isCreatingThread}
        onOpenChange={setIsComposerOpen}
        onSubmit={handleCreateThreadSubmit}
      />
    </div>
  );
}
