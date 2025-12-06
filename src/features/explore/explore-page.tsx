"use client";

import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { THREAD_CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import { ThreadCard } from "@/components/threads/thread-card";
import { EmptyState } from "@/components/misc/empty-state";
import { useThreads } from "@/hooks/use-threads";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChatWindow } from "@/components/chat/chat-window";
import type { Thread } from "@/types";

export function ExplorePage() {
  const { user } = useAuth();
  const { threadsQuery, requestJoin, deleteThread } = useThreads();
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const threads = useMemo(() => threadsQuery.data ?? [], [threadsQuery.data]);
  const activeThread = useMemo<Thread | null>(() => {
    if (!activeThreadId) return null;
    return threads.find((thread) => thread.id === activeThreadId) ?? null;
  }, [threads, activeThreadId]);

  const filteredThreads = useMemo(() => {
    const searchQuery = search.trim().toLowerCase();
    let result = threads;

    if (searchQuery) {
      result = result.filter(
        (thread) =>
          thread.title.toLowerCase().includes(searchQuery) ||
          thread.description.toLowerCase().includes(searchQuery) ||
          thread.tags?.some((tag) => tag.toLowerCase().includes(searchQuery))
      );
    }

    if (category !== "all") {
      result = result.filter((thread) => thread.tags?.some((tag) => tag.toLowerCase().includes(category.toLowerCase())));
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "mostMembers":
          return (b.members?.length ?? 0) - (a.members?.length ?? 0);
        case "expiringSoon":
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        case "mostActive":
          return (b.chat?.length ?? 0) - (a.chat?.length ?? 0);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [threads, category, sortBy, search]);

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
      toast.error("Could not send request", { description: "Please try again." });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 p-8 text-white shadow-2xl">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Discover</p>
          <h1 className="text-4xl font-semibold">Explore live threads</h1>
          <p className="max-w-2xl text-sm text-white/80">Search, filter, and sort through every thread happening across campus.</p>
        </div>
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search titles, descriptions, tags"
            className="h-12 rounded-2xl border-white/20 bg-white/20 pl-12 text-white placeholder:text-white/70"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/30 bg-white/80 p-6 shadow-soft dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Categories</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tune the radar</h3>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 rounded-2xl border-slate-200 bg-white text-left dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.emoji} {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {THREAD_CATEGORIES.map((cat) => {
            const count =
              cat.id === "all"
                ? threads.length
                : threads.filter((thread) => thread.tags?.some((tag) => tag.toLowerCase().includes(cat.id.toLowerCase()))).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  category === cat.id
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <span className="mr-2" aria-hidden>
                  {cat.icon}
                </span>
                {cat.label.replace(/^[^\s]+\s/, "")}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            {filteredThreads.length} {filteredThreads.length === 1 ? "thread" : "threads"} visible
          </p>
          {search || category !== "all" ? (
            <Button
              variant="ghost"
              className="rounded-2xl"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        {threadsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-3xl bg-white/70 dark:bg-slate-800/50" />
            ))}
          </div>
        ) : filteredThreads.length === 0 ? (
          <EmptyState
            title="No threads match"
            description="Try a different search or reset the filters to browse everything."
            actionLabel="Reset filters"
            onAction={() => {
              setSearch("");
              setCategory("all");
            }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                currentUserId={user?.id}
                onOpen={(selected) => setActiveThreadId(selected.id)}
                onRequestJoin={handleRequestJoin}
              />
            ))}
          </div>
        )}
      </section>

      <Sheet open={Boolean(activeThread)} onOpenChange={(open) => !open && setActiveThreadId(null)}>
        <SheetContent side="right" className="h-full w-full max-w-3xl border-none p-0">
          {activeThread && user && (
            <ChatWindow
              thread={activeThread}
              currentUserId={user.id}
              isAdmin={user.isAdmin}
              messages={activeThread.chat ?? []}
              onSend={async (_payload) => {
                void _payload;
                toast.message("Chat is read-only from explore. Use the home hub to reply.");
              }}
              onDelete={async () => {
                try {
                  await deleteThread({ threadId: activeThread.id, userId: user.id });
                  setActiveThreadId(null);
                  toast.success("Thread deleted", { description: "The thread has been permanently removed." });
                } catch (error) {
                  console.error(error);
                  toast.error("Could not delete thread", { description: "Please try again." });
                }
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
