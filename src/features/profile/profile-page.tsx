"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Users, Trophy, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserThreads, useThreads } from "@/hooks/use-threads";
import { ThreadCard } from "@/components/threads/thread-card";
import { EmptyState } from "@/components/misc/empty-state";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChatWindow } from "@/components/chat/chat-window";
import type { Thread } from "@/types";
import { toast } from "sonner";

export function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: insights, isLoading } = useUserThreads(user?.id);
  const { deleteThread } = useThreads();
  const [activeThread, setActiveThread] = useState<Thread | null>(null);

  const createdThreads = insights?.createdThreads ?? [];
  const joinedThreads = insights?.joinedThreads ?? [];
  const stats = insights?.stats ?? { created: 0, joined: 0, impact: 0 };

  const memberSince = useMemo(() => {
    if (user && "createdAt" in user && typeof (user as { createdAt?: string }).createdAt === "string") {
      return new Date((user as { createdAt?: string }).createdAt as string).toLocaleDateString();
    }
    return new Date().toLocaleDateString();
  }, [user]);

  const handleDisabledRequest: (thread: Thread) => void = () => {
    toast.message("You're already inside this thread.");
  };

  const handleSettings = () => {
    toast("Creator hub coming soon", { description: "Profile settings will unlock after the admin console ships." });
  };

  const handleDeleteThread = async () => {
    if (!user || !activeThread) return;
    try {
      await deleteThread({ threadId: activeThread.id, userId: user.id });
      setActiveThread(null);
      toast.success("Thread deleted", { description: "The thread has been permanently removed." });
    } catch (error) {
      console.error(error);
      toast.error("Could not delete thread", { description: "Please try again." });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Profile</p>
            <h1 className="text-4xl font-semibold">{user?.username}</h1>
            <p className="text-sm text-white/70">Member since {memberSince}</p>
          </div>
          <div className="grid w-full gap-3 md:w-auto md:grid-cols-3">
            {[
              { icon: Trophy, label: "Threads", value: stats.created },
              { icon: Users, label: "Joined", value: stats.joined },
              { icon: MessageCircle, label: "Members", value: stats.impact },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-4 text-center shadow-soft">
                <item.icon className="mx-auto mb-2 h-5 w-5" />
                <p className="text-2xl font-semibold">{item.value}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-soft dark:bg-slate-900/60">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="rounded-2xl" onClick={handleSettings}>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
          <Button variant="destructive" className="rounded-2xl" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/30 bg-white/80 p-6 shadow-soft dark:bg-slate-900/60">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">My threads</h2>
          <Button className="rounded-2xl" onClick={() => router.push("/")}>
            Launch new
          </Button>
        </header>
        {isLoading ? (
          <div className="rounded-2xl bg-gradient-to-r from-slate-200/40 to-white/40 p-6 text-sm text-slate-500 dark:from-slate-800/40 dark:to-slate-900/40">
            Loading your threads...
          </div>
        ) : createdThreads.length === 0 ? (
          <EmptyState
            title="You haven't launched anything"
            description="Kickstart the first pop-up community and lead the conversation."
            actionLabel="Start creating"
            onAction={() => router.push("/")}
          />
        ) : (
          <div className="grid gap-4">
            {createdThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                currentUserId={user?.id}
                onOpen={(selected) => setActiveThread(selected)}
                onRequestJoin={handleDisabledRequest}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-dashed border-white/40 bg-transparent p-6 dark:border-slate-800">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Community</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Joined threads</h2>
          </div>
        </header>
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-white/30 p-6 text-sm text-slate-500 dark:text-slate-400">
            Fetching your joined threads...
          </div>
        ) : joinedThreads.length === 0 ? (
          <EmptyState
            title="No joined threads"
            description="Head to explore and jump into something trending."
            actionLabel="Browse explore"
            onAction={() => router.push("/explore")}
          />
        ) : (
          <div className="grid gap-4">
            {joinedThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                currentUserId={user?.id}
                onOpen={(selected) => setActiveThread(selected)}
                onRequestJoin={handleDisabledRequest}
              />
            ))}
          </div>
        )}
      </section>

      <Sheet open={Boolean(activeThread)} onOpenChange={(open) => !open && setActiveThread(null)}>
        <SheetContent side="right" className="h-full w-full max-w-3xl border-none p-0">
          {activeThread && user && (
            <ChatWindow
              thread={activeThread}
              currentUserId={user.id}
              isAdmin={user.isAdmin}
              messages={activeThread.chat ?? []}
              onSend={async () => {
                toast.message("Open the home hub to continue chatting.");
              }}
              onDelete={handleDeleteThread}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
