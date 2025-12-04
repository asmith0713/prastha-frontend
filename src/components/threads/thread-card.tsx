import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, MessageCircle, Users, AlertTriangle } from "lucide-react";
import type { Thread } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig = {
  creator: {
    label: "You created this",
    tone: "bg-amber-100 text-amber-700",
  },
  member: {
    label: "You joined",
    tone: "bg-emerald-100 text-emerald-700",
  },
  pending: {
    label: "Request pending",
    tone: "bg-blue-100 text-blue-700",
  },
};

export type ThreadCardProps = {
  thread: Thread;
  currentUserId?: string;
  onOpen: (thread: Thread) => void;
  onRequestJoin: (thread: Thread) => void;
};

export function ThreadCard({ thread, currentUserId, onOpen, onRequestJoin }: ThreadCardProps) {
  const isCreator = thread.creatorId === currentUserId;
  const isMember = thread.members?.includes(currentUserId ?? "");
  const hasPendingRequest = thread.pendingRequests?.includes(currentUserId ?? "");

  const status = isCreator ? statusConfig.creator : isMember ? statusConfig.member : hasPendingRequest ? statusConfig.pending : undefined;

  return (
    <Card className="border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/90 shadow-soft hover-lift transition-all">
      <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
            <div className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
              {thread.title}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{thread.description}</p>
          </div>
          {status && <Badge className={cn("rounded-xl sm:rounded-2xl px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium shrink-0", status.tone)}>{status.label}</Badge>}
        </div>

        <div className="grid gap-2 sm:gap-3 text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 grid-cols-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 dark:text-slate-400" />
            {thread.members?.length ?? 0} members
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-500 dark:text-rose-400" />
            <span className="truncate">{thread.location}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 dark:text-amber-400" />
            Ends {new Date(thread.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500 dark:text-sky-400" />
            {thread.chat?.length ?? 0} signals
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {thread.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-lg sm:rounded-2xl bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs px-2 sm:px-2.5">
              #{tag}
            </Badge>
          ))}
          {(thread.tags?.length ?? 0) > 3 && (
            <Badge variant="secondary" className="rounded-lg sm:rounded-2xl bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs px-2 sm:px-2.5">
              +{(thread.tags?.length ?? 0) - 3}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button onClick={() => onOpen(thread)} className="flex-1 rounded-xl sm:rounded-2xl h-9 sm:h-10 text-xs sm:text-sm" variant="default">
            {isMember || isCreator ? "Open chat" : "Preview"}
          </Button>
          {!isMember && !isCreator && (
            <Button onClick={() => onRequestJoin(thread)} className="flex-1 rounded-xl sm:rounded-2xl h-9 sm:h-10 text-xs sm:text-sm" variant="outline">
              Request access
            </Button>
          )}
          {isCreator && thread.pendingRequests?.length ? (
            <Button variant="secondary" className="rounded-xl sm:rounded-2xl text-amber-600 h-9 sm:h-10 text-xs sm:text-sm" onClick={() => onOpen(thread)}>
              <AlertTriangle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> {thread.pendingRequests.length}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
