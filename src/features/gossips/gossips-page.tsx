"use client";

import * as React from "react";
import { ArrowBigUp, ArrowBigDown, Flag, MessageCircleMore, Trash2, Send, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useGossips } from "@/hooks/use-gossips";
import type { Gossip, GossipComment, GossipSort } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/misc/empty-state";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { label: string; value: GossipSort; description: string }[] = [
  { label: "Newest", value: "newest", description: "Latest whispers" },
  { label: "Popular", value: "popular", description: "Most upvoted" },
  { label: "Controversial", value: "controversial", description: "Downvote magnets" },
];

export function GossipsPage() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = React.useState<GossipSort>("newest");
  const [draft, setDraft] = React.useState("");
  const [commentDrafts, setCommentDrafts] = React.useState<Record<string, string>>({});

  const {
    gossipsQuery,
    createGossip,
    voteOnGossip,
    addComment,
    deleteGossip,
    deleteComment,
    reportComment,
    isReportingComment,
  } = useGossips(sortBy);

  const isLoading = gossipsQuery.isLoading;
  const gossips = gossipsQuery.data ?? [];

  const ensureAuthed = () => {
    if (!user) {
      toast.error("Sign in required", { description: "Log in to interact with gossips." });
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!ensureAuthed()) return;
    if (!draft.trim()) {
      toast.error("Nothing to share", { description: "Type something before posting." });
      return;
    }

    try {
      const currentUser = user!;
      await createGossip({
        content: draft.trim(),
        authorId: currentUser.id,
        authorUsername: currentUser.username,
      });
      setDraft("");
      toast.success("Gossip posted");
    } catch (error) {
      console.error(error);
      toast.error("Could not post", { description: "Please try again." });
    }
  };

  const handleVote = async (gossipId: string, voteType: "up" | "down" | "none") => {
    if (!ensureAuthed()) return;
    try {
      await voteOnGossip({ gossipId, userId: user!.id, voteType });
    } catch (error) {
      console.error(error);
      toast.error("Vote failed", { description: "Please try again." });
    }
  };

  const handleComment = async (gossipId: string) => {
    if (!ensureAuthed()) return;
    const content = commentDrafts[gossipId]?.trim();
    if (!content) {
      toast.error("Empty reply", { description: "Say something before sending." });
      return;
    }

    try {
      await addComment({
        gossipId,
        content,
        authorId: user!.id,
        authorUsername: user!.username,
      });
      setCommentDrafts((prev) => ({ ...prev, [gossipId]: "" }));
    } catch (error) {
      console.error(error);
      toast.error("Comment failed", { description: "Please try again." });
    }
  };

  const handleDeleteGossip = async (gossip: Gossip) => {
    if (!ensureAuthed()) return;
    if (gossip.authorId !== user!.id && !user!.isAdmin) {
      toast.error("No access", { description: "Only the author or an admin can remove this." });
      return;
    }

    try {
      await deleteGossip({ gossipId: gossip.id, userId: user!.id });
      toast.success("Gossip deleted");
    } catch (error) {
      console.error(error);
      toast.error("Delete failed", { description: "Please try again." });
    }
  };

  const handleDeleteComment = async (gossipId: string, comment: GossipComment) => {
    if (!ensureAuthed()) return;
    if (comment.authorId !== user!.id && !user!.isAdmin) {
      toast.error("No access", { description: "Only the author or an admin can remove this." });
      return;
    }

    try {
      await deleteComment({ gossipId, commentId: comment.id, userId: user!.id });
      toast.success("Comment removed");
    } catch (error) {
      console.error(error);
      toast.error("Delete failed", { description: "Please try again." });
    }
  };

  const handleReportComment = async (gossipId: string, comment: GossipComment) => {
    if (!ensureAuthed()) return;
    const reason = window.prompt("Reason for reporting?", "Inappropriate content");
    if (reason === null) return;

    try {
      await reportComment({
        gossipId,
        commentId: comment.id,
        reporterUsername: user!.username,
        reporterId: user!.id,
        commentAuthor: comment.author,
        commentAuthorId: comment.authorId,
        commentContent: comment.content,
        reason: reason?.trim() || undefined,
      });
      toast.success("Comment reported", { description: "An admin will review it." });
    } catch (error) {
      console.error(error);
      toast.error("Report failed", { description: "Please try again." });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 md:pb-20">
      <section className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/80 shadow-lg p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Signal Boost</p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Gossip Board</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Quick hits from the field. Keep it respectful.</p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort by</p>
            <Select value={sortBy} onValueChange={(value: GossipSort) => setSortBy(value)}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-slate-500">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {user ? (
        <Card className="rounded-3xl border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Share a new thread of gossip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Example: Pop-up LAN shifted to Hall B at 6pm."
              className="min-h-[120px] rounded-2xl bg-slate-50/60 dark:bg-slate-800/60"
            />
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-slate-500">Maximum 500 characters. Keep it factual.</p>
              <Button onClick={handleCreate} disabled={!draft.trim()} className="rounded-2xl">
                <Send className="mr-2 h-4 w-4" />
                Post gossip
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-3xl border-dashed border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40">
          <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-400">
            Sign in to contribute new gossips or participate in the discussion.
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card className="rounded-3xl border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="p-8 text-center text-slate-500">Loading latest gossips...</CardContent>
        </Card>
      ) : gossips.length === 0 ? (
        <EmptyState
          title="No whispers yet"
          description="Once someone starts a thread, it will show up here."
          actionLabel="Share something"
          onAction={() => document.querySelector<HTMLTextAreaElement>("textarea")?.focus()}
        />
      ) : (
        <div className="space-y-4">
          {gossips.map((gossip) => (
            <GossipCard
              key={gossip.id}
              gossip={gossip}
              currentUserId={user?.id}
              isAdmin={Boolean(user?.isAdmin)}
              isReporting={isReportingComment}
              vote={(voteType) => handleVote(gossip.id, voteType)}
              onComment={() => handleComment(gossip.id)}
              commentValue={commentDrafts[gossip.id] ?? ""}
              onCommentChange={(value) => setCommentDrafts((prev) => ({ ...prev, [gossip.id]: value }))}
              deleteGossip={() => handleDeleteGossip(gossip)}
              deleteComment={(comment) => handleDeleteComment(gossip.id, comment)}
              reportComment={(comment) => handleReportComment(gossip.id, comment)}
              disabled={!user}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GossipCard({
  gossip,
  currentUserId,
  isAdmin,
  vote,
  onComment,
  commentValue,
  onCommentChange,
  deleteGossip,
  deleteComment,
  reportComment,
  disabled,
  isReporting,
}: {
  gossip: Gossip;
  currentUserId?: string;
  isAdmin?: boolean;
  vote: (voteType: "up" | "down" | "none") => void;
  onComment: () => void;
  commentValue: string;
  onCommentChange: (value: string) => void;
  deleteGossip: () => void;
  deleteComment: (comment: GossipComment) => void;
  reportComment: (comment: GossipComment) => void;
  disabled: boolean;
  isReporting: boolean;
}) {
  const hasUpvoted = currentUserId ? gossip.upvotedBy.includes(currentUserId) : false;
  const hasDownvoted = currentUserId ? gossip.downvotedBy.includes(currentUserId) : false;

  const voteCount = gossip.upvotes - gossip.downvotes;
  const createdLabel = new Date(gossip.createdAt).toLocaleString();

  return (
    <Card className="rounded-3xl border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-slate-900/80 shadow-soft">
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{gossip.author}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{createdLabel}</p>
            </div>
            {(gossip.authorId === currentUserId || isAdmin) && (
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={deleteGossip} title="Delete gossip">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-base text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{gossip.content}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60">
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-2xl", hasUpvoted && "text-green-600")}
              onClick={() => vote(hasUpvoted ? "none" : "up")}
              disabled={disabled}
            >
              <ArrowBigUp className="h-5 w-5" />
            </Button>
            <div className="px-3 text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[40px] text-center">{voteCount}</div>
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-2xl", hasDownvoted && "text-red-500")}
              onClick={() => vote(hasDownvoted ? "none" : "down")}
              disabled={disabled}
            >
              <ArrowBigDown className="h-5 w-5" />
            </Button>
          </div>
          <Badge variant="secondary" className="rounded-2xl gap-1 bg-slate-100 dark:bg-slate-800/80">
            <MessageCircleMore className="h-3.5 w-3.5" />
            {gossip.comments.length} replies
          </Badge>
          {gossip.expiresAt && (
            <Badge variant="outline" className="rounded-2xl gap-1">
              <Clock className="h-3.5 w-3.5" />
              Ends {new Date(gossip.expiresAt).toLocaleDateString()}
            </Badge>
          )}
        </div>

        <Separator className="bg-slate-200/80 dark:bg-slate-800/80" />

        <div className="space-y-3">
          {gossip.comments.length === 0 ? (
            <p className="text-sm text-slate-500">No replies yet.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {gossip.comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  canModerate={comment.authorId === currentUserId || Boolean(isAdmin)}
                  onDelete={() => deleteComment(comment)}
                  onReport={() => reportComment(comment)}
                  disableReport={comment.authorId === currentUserId || !currentUserId}
                  isReporting={isReporting}
                />
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 p-3 space-y-2">
            <Textarea
              value={commentValue}
              onChange={(event) => onCommentChange(event.target.value)}
              placeholder={disabled ? "Sign in to reply" : "Add a reply"}
              className="min-h-[80px] rounded-2xl bg-transparent"
              disabled={disabled}
            />
            <div className="flex justify-end">
              <Button onClick={onComment} disabled={disabled || !commentValue.trim()} size="sm" className="rounded-xl">
                Reply
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CommentRow({
  comment,
  canModerate,
  onDelete,
  onReport,
  disableReport,
  isReporting,
}: {
  comment: GossipComment;
  canModerate: boolean;
  onDelete: () => void;
  onReport: () => void;
  disableReport: boolean;
  isReporting: boolean;
}) {
  const timestamp = new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{comment.author}</p>
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{timestamp}</p>
        </div>
        <div className="flex items-center gap-1">
          {!disableReport && (
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onReport} disabled={isReporting} title="Report comment">
              {isReporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-3.5 w-3.5" />}
            </Button>
          )}
          {canModerate && (
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onDelete} title="Delete comment">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.content}</p>
    </div>
  );
}
