"use client";

import { useMemo, useState } from "react";
import { ThreadCard } from "@/components/threads/thread-card";
import { CategoryCarousel } from "@/components/threads/category-carousel";
import { EmptyState } from "@/components/misc/empty-state";
import type { Thread } from "@/types";
import { SORT_OPTIONS } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ThreadFeedProps = {
  threads: Thread[];
  currentUserId?: string;
  onOpen: (thread: Thread) => void;
  onRequestJoin: (thread: Thread) => void;
  onCreateThread?: (category?: string) => void;
  isLoading?: boolean;
};

export function ThreadFeed({ threads, currentUserId, onOpen, onRequestJoin, onCreateThread, isLoading }: ThreadFeedProps) {
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredThreads = useMemo(() => {
    // Step 1: Filter by category
    let filtered = threads;
    if (category !== "all") {
      const categoryLower = category.toLowerCase();
      filtered = threads.filter((thread) => {
        if (!thread.tags || thread.tags.length === 0) return false;
        // Match if any tag equals or contains the category
        return thread.tags.some((tag) => {
          const tagLower = tag.toLowerCase();
          return tagLower === categoryLower || tagLower.includes(categoryLower);
        });
      });
    }

    // Step 2: Sort by selected criteria
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest": {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Newest first (descending)
        }
        case "oldest": {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB; // Oldest first (ascending)
        }
        case "mostMembers": {
          const membersA = a.members?.length ?? 0;
          const membersB = b.members?.length ?? 0;
          return membersB - membersA; // Most members first (descending)
        }
        case "expiringSoon": {
          const expiresA = new Date(a.expiresAt).getTime();
          const expiresB = new Date(b.expiresAt).getTime();
          return expiresA - expiresB; // Expiring soonest first (ascending)
        }
        case "mostActive": {
          const chatA = a.chat?.length ?? 0;
          const chatB = b.chat?.length ?? 0;
          return chatB - chatA; // Most messages first (descending)
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [threads, category, sortBy]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/90 p-4 sm:p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500 dark:text-slate-400">Filters</p>
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Thread Radar</h3>
          </div>
          <Tabs value={sortBy} onValueChange={setSortBy} className="w-full sm:w-auto">
            <TabsList className="flex w-full overflow-x-auto no-scrollbar rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-700/50 p-1 sm:w-auto sm:grid sm:grid-cols-5">
              {SORT_OPTIONS.map((option) => (
                <TabsTrigger key={option.id} value={option.id} className="rounded-lg sm:rounded-2xl text-[10px] sm:text-xs font-semibold whitespace-nowrap px-2 sm:px-3">
                  <span className="mr-1">{option.emoji}</span>
                  <span className="hidden xs:inline">{option.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {SORT_OPTIONS.map((option) => (
              <TabsContent key={option.id} value={option.id}>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{option.description}</span>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        <CategoryCarousel active={category} onSelect={setCategory} />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-2xl sm:rounded-3xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : filteredThreads.length === 0 ? (
          <EmptyState
            title="No threads yet"
            description="Be the first to launch a pulse in this category."
            actionLabel="Launch thread"
            onAction={() => onCreateThread?.(category === "all" ? undefined : category)}
          />
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {filteredThreads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} currentUserId={currentUserId} onOpen={onOpen} onRequestJoin={onRequestJoin} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
