"use client";

import * as React from "react";
import { useInView } from "framer-motion";
import { Send, AlertTriangle, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import TextareaAutosize from "react-textarea-autosize";
import type { Thread, ThreadMessage } from "@/types";
import { cn } from "@/lib/utils";

export type ChatWindowProps = {
  thread: Thread;
  currentUserId: string;
  isAdmin?: boolean;
  messages: ThreadMessage[];
  onSend: (message: string) => Promise<void>;
  onAlert?: () => void;
  onDelete?: () => Promise<void>;
};

export function ChatWindow({ thread, currentUserId, isAdmin, messages, onSend, onAlert, onDelete }: ChatWindowProps) {
  const [value, setValue] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const isBottomVisible = useInView(bottomRef, { margin: "-120px" });

  const isCreator = thread.creatorId === currentUserId;
  const canDelete = isCreator || isAdmin;

  React.useEffect(() => {
    if (!isBottomVisible) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isBottomVisible]);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setIsSending(true);
    try {
      await onSend(value.trim());
      setValue("");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 shadow-2xl backdrop-blur-xl">
      <header className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-500 dark:text-slate-400">Active thread</p>
          <h3 className="text-lg sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 truncate">{thread.title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {thread.members.length} connected • ends {new Date(thread.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Button variant="destructive" className="rounded-xl sm:rounded-2xl h-9 sm:h-10 text-xs sm:text-sm" onClick={onAlert}>
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Send alert</span>
          </Button>
          
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 sm:h-10 sm:w-10">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete thread
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl border border-slate-200/60 dark:border-slate-700/60">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete this thread?</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              This will permanently delete &ldquo;{thread.title}&rdquo; and all its messages. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
        {messages.map((message) => {
          const isOwn = message.userId === currentUserId;
          return (
            <div key={message.id} className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}> 
              <div className={cn(
                "max-w-[85%] sm:max-w-[70%] rounded-2xl sm:rounded-3xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-soft",
                isOwn 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-slate-100 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100"
              )}> 
                <div className={cn("text-[10px] sm:text-xs font-medium", isOwn ? "text-primary-foreground/80" : "text-slate-600 dark:text-slate-400")}>
                  {message.user}
                </div>
                <p className="leading-relaxed mt-0.5 sm:mt-1">{message.message}</p>
                <div className={cn("mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em]", isOwn ? "text-primary-foreground/60" : "text-slate-500 dark:text-slate-500")}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <footer className="border-t border-slate-200/60 dark:border-slate-700/60 p-3 sm:p-4 safe-area-pb">
        <div className="flex items-end gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-900/70 p-2 sm:p-3 border border-slate-200/60 dark:border-slate-700/60">
          <TextareaAutosize
            maxRows={5}
            placeholder="Type a message"
            className="flex-1 resize-none bg-transparent text-xs sm:text-sm outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 min-h-[36px] py-2"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />
          <Button className="rounded-xl sm:rounded-2xl h-9 sm:h-10 px-3 sm:px-4" onClick={() => void handleSubmit()} disabled={isSending || !value.trim()}>
            <Send className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
