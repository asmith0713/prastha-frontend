"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useThreadAlerts, useThreads } from "@/hooks/use-threads";
import { EmptyState } from "@/components/misc/empty-state";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChatWindow } from "@/components/chat/chat-window";
import type { Thread } from "@/types";
import { toast } from "sonner";

export function AlertsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: alertFeed, isLoading } = useThreadAlerts(user?.id);
  const { deleteThread } = useThreads();
  const [activeThread, setActiveThread] = useState<Thread | null>(null);

  const alerts = alertFeed ?? [];

  return (
    <div className="space-y-8 pb-16">
      <section className="rounded-3xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 p-8 text-white shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/20 p-3">
            <Bell className="h-6 w-6" />
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Alerts</p>
            <h1 className="text-4xl font-semibold">Notifications center</h1>
            <p className="max-w-2xl text-sm text-white/80">Stay on top of expiring threads, access approvals, and last-minute broadcasts.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/30 bg-white/80 p-6 shadow-soft dark:bg-slate-900/60">
        {isLoading ? (
          <div className="rounded-2xl bg-gradient-to-r from-white/60 to-white/30 p-6 text-sm text-slate-500 dark:from-slate-800/40 dark:to-slate-900/40">
            Checking for fresh alerts...
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState
            title="You're caught up"
            description="No alerts waiting. Join a few threads to start receiving updates."
            actionLabel="Browse explore"
            onAction={() => router.push("/explore")}
          />
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                className="flex w-full items-center gap-4 rounded-3xl border border-white/40 bg-white/90 p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-brand-500 dark:bg-slate-900/70"
                onClick={() => setActiveThread(alert.thread)}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{alert.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">{alert.message}</p>
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(alert.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </button>
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
              onSend={async (_payload) => {
                void _payload;
                toast.message("Open the home hub to post replies.");
              }}
              onDelete={async () => {
                try {
                  await deleteThread({ threadId: activeThread.id, userId: user.id });
                  setActiveThread(null);
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
