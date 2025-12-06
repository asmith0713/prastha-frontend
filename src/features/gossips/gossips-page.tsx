"use client";

import * as React from "react";
import { ArrowBigUp, ArrowBigDown, Flag, MessageCircleMore, Trash2, Send, Loader2, Clock, CornerUpRight } from "lucide-react";
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

type CommentContext = {
  parentCommentId?: string;
  replyTo?: string;
};

type GossipCommentNode = GossipComment & {
  children: GossipCommentNode[];
};

const commentDraftKey = (gossipId: string, parentCommentId?: string | null) => `${gossipId}:${parentCommentId ?? "root"}`;

const buildCommentTree = (comments: GossipComment[]): GossipCommentNode[] => {
  const nodes = new Map<string, GossipCommentNode>();
  const roots: GossipCommentNode[] = [];

  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, children: [] });
  });

  const attachChildren = (list: GossipCommentNode[]) => {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    list.forEach((node) => {
      if (node.children.length > 0) {
        attachChildren(node.children);
      }
    });
  };

  nodes.forEach((node) => {
    if (node.parentCommentId && nodes.has(node.parentCommentId)) {
      nodes.get(node.parentCommentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  attachChildren(roots);
  return roots;
};

export function GossipsPage() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = React.useState<GossipSort>("newest");
  const [draft, setDraft] = React.useState("");
  const [commentDrafts, setCommentDrafts] = React.useState<Record<string, string>>({});
  const [replyTargets, setReplyTargets] = React.useState<Record<string, string | null>>({});

  const getCommentDraft = (gossipId: string, parentCommentId?: string | null) =>
    commentDrafts[commentDraftKey(gossipId, parentCommentId)] ?? "";

  const setCommentDraft = (gossipId: string, parentCommentId: string | null, value: string) => {
    setCommentDrafts((prev) => ({ ...prev, [commentDraftKey(gossipId, parentCommentId)]: value }));
  };

  const clearCommentDraft = (gossipId: string, parentCommentId?: string | null) => {
    setCommentDrafts((prev) => {
      const key = commentDraftKey(gossipId, parentCommentId);
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleReplySelect = (gossipId: string, commentId: string | null) => {
    setReplyTargets((prev) => ({
      ...prev,
      [gossipId]: prev[gossipId] === commentId ? null : commentId,
    }));
  };

  const {
    gossipsQuery,
    createGossip,
    voteOnGossip,
    voteOnComment,
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

  const handleCommentVote = async (gossipId: string, commentId: string, voteType: "up" | "down" | "none") => {
    if (!ensureAuthed()) return;
    try {
      await voteOnComment({ gossipId, commentId, userId: user!.id, voteType });
    } catch (error) {
      console.error(error);
      toast.error("Vote failed", { description: "Please try again." });
    }
  };

  const handleComment = async (gossipId: string, context?: CommentContext) => {
    if (!ensureAuthed()) return;
    const content = getCommentDraft(gossipId, context?.parentCommentId ?? null).trim();
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
        parentCommentId: context?.parentCommentId,
        replyTo: context?.replyTo,
      });
      clearCommentDraft(gossipId, context?.parentCommentId ?? null);
      if (context?.parentCommentId) {
        setReplyTargets((prev) => ({ ...prev, [gossipId]: null }));
      }
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
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleCreate();
                }
              }}
            />
            <div className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="space-y-0.5">
                <p>Maximum 500 characters. Keep it factual.</p>
                <p className="text-[11px] text-slate-400">Press Enter to post • Shift+Enter for a new line</p>
              </div>
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
              onComment={(context?: CommentContext) => handleComment(gossip.id, context)}
              getCommentValue={(parentCommentId?: string | null) => getCommentDraft(gossip.id, parentCommentId ?? null)}
              onCommentChange={(value: string, parentCommentId?: string | null) => setCommentDraft(gossip.id, parentCommentId ?? null, value)}
              replyTargetId={replyTargets[gossip.id] ?? null}
              onReplyTargetChange={(commentId: string | null) => handleReplySelect(gossip.id, commentId)}
              onCommentVote={(commentId, voteType) => void handleCommentVote(gossip.id, commentId, voteType)}
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
  getCommentValue,
  onCommentChange,
  replyTargetId,
  onReplyTargetChange,
  onCommentVote,
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
  onComment: (context?: CommentContext) => Promise<void> | void;
  getCommentValue: (parentCommentId?: string | null) => string;
  onCommentChange: (value: string, parentCommentId?: string | null) => void;
  replyTargetId?: string | null;
  onReplyTargetChange: (commentId: string | null) => void;
  onCommentVote: (commentId: string, voteType: "up" | "down" | "none") => void;
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
  const commentTree = React.useMemo(() => buildCommentTree(gossip.comments), [gossip.comments]);
  const activeReplyId = replyTargetId ?? null;
  const rootCommentValue = getCommentValue();

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
          {commentTree.length === 0 ? (
            <p className="text-sm text-slate-500">No replies yet.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {commentTree.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  deleteComment={deleteComment}
                  reportComment={reportComment}
                  disabled={disabled}
                  isReporting={isReporting}
                  replyTargetId={activeReplyId}
                  onReplyTargetChange={onReplyTargetChange}
                  getCommentValue={getCommentValue}
                  onCommentChange={onCommentChange}
                  onCommentSubmit={onComment}
                  voteOnComment={onCommentVote}
                />
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 p-3 space-y-2">
            <Textarea
              value={rootCommentValue}
              onChange={(event) => onCommentChange(event.target.value)}
              placeholder={disabled ? "Sign in to reply" : "Add a reply"}
              className="min-h-[80px] rounded-2xl bg-transparent"
              disabled={disabled}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !disabled && rootCommentValue.trim()) {
                  event.preventDefault();
                  void onComment();
                }
              }}
            />
            <div className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-slate-400">Press Enter to reply • Shift+Enter for a new line</p>
              <Button onClick={() => void onComment()} disabled={disabled || !rootCommentValue.trim()} size="sm" className="rounded-xl self-end sm:self-auto">
                Reply
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type CommentThreadProps = {
  comment: GossipCommentNode;
  currentUserId?: string;
  isAdmin?: boolean;
  deleteComment: (comment: GossipComment) => void;
  reportComment: (comment: GossipComment) => void;
  disabled: boolean;
  isReporting: boolean;
  replyTargetId?: string | null;
  onReplyTargetChange: (commentId: string | null) => void;
  getCommentValue: (parentCommentId?: string | null) => string;
  onCommentChange: (value: string, parentCommentId?: string | null) => void;
  onCommentSubmit: (context: CommentContext) => Promise<void> | void;
  voteOnComment: (commentId: string, voteType: "up" | "down" | "none") => void;
  depth?: number;
};

function CommentThread({
  comment,
  currentUserId,
  isAdmin,
  deleteComment,
  reportComment,
  disabled,
  isReporting,
  replyTargetId,
  onReplyTargetChange,
  getCommentValue,
  onCommentChange,
  onCommentSubmit,
  voteOnComment,
  depth = 0,
}: CommentThreadProps) {
  const timestamp = new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const canModerate = comment.authorId === currentUserId || Boolean(isAdmin);
  const disableReport = comment.authorId === currentUserId || !currentUserId;
  const isReplying = replyTargetId === comment.id;
  const replyValue = getCommentValue(comment.id);
  const replyInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const upvoteCount = comment.upvotes ?? 0;
  const downvoteCount = comment.downvotes ?? 0;
  const upvoters = comment.upvotedBy ?? [];
  const downvoters = comment.downvotedBy ?? [];
  const hasUpvoted = currentUserId ? upvoters.includes(currentUserId) : false;
  const hasDownvoted = currentUserId ? downvoters.includes(currentUserId) : false;
  const commentScore = upvoteCount - downvoteCount;

  React.useEffect(() => {
    if (isReplying && !disabled) {
      const input = replyInputRef.current;
      if (input) {
        input.focus();
        const caret = input.value.length;
        input.setSelectionRange(caret, caret);
      }
    }
  }, [isReplying, disabled]);

  return (
    <div className={cn("space-y-3", depth > 0 && "pl-4 sm:pl-6 border-l border-slate-200/60 dark:border-slate-800/60")}
    >
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{comment.author}</p>
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{timestamp}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60">
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-xl", hasUpvoted && "text-green-600")}
                onClick={() => voteOnComment(comment.id, hasUpvoted ? "none" : "up")}
                disabled={disabled}
                title="Upvote comment"
              >
                <ArrowBigUp className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 text-xs font-semibold text-slate-600 dark:text-slate-200 min-w-[32px] text-center">{commentScore}</span>
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-xl", hasDownvoted && "text-red-500")}
                onClick={() => voteOnComment(comment.id, hasDownvoted ? "none" : "down")}
                disabled={disabled}
                title="Downvote comment"
              >
                <ArrowBigDown className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => onReplyTargetChange(comment.id)}
                disabled={disabled}
                title="Reply to comment"
              >
                <CornerUpRight className="h-3.5 w-3.5" />
              </Button>
              {!disableReport && (
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => reportComment(comment)} disabled={isReporting} title="Report comment">
                  {isReporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-3.5 w-3.5" />}
                </Button>
              )}
              {canModerate && (
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => deleteComment(comment)} title="Delete comment">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
        {comment.replyTo && (
          <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-slate-500">Replying to {comment.replyTo}</p>
        )}
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.content}</p>
      </div>

      {isReplying && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-3 space-y-2">
          <Textarea
            value={replyValue}
            onChange={(event) => onCommentChange(event.target.value, comment.id)}
            placeholder="Reply to this comment"
            className="min-h-[70px] rounded-2xl bg-transparent"
            ref={replyInputRef}
            disabled={disabled}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && replyValue.trim()) {
                event.preventDefault();
                void onCommentSubmit({ parentCommentId: comment.id, replyTo: comment.author });
              }
            }}
          />
          <div className="flex justify-end gap-2 text-xs text-slate-500">
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => onReplyTargetChange(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="rounded-xl"
              onClick={() => void onCommentSubmit({ parentCommentId: comment.id, replyTo: comment.author })}
              disabled={!replyValue.trim()}
            >
              Reply
            </Button>
          </div>
        </div>
      )}

      {comment.children.length > 0 && (
        <div className="space-y-3">
          {comment.children.map((child) => (
            <CommentThread
              key={child.id}
              comment={child}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              deleteComment={deleteComment}
              reportComment={reportComment}
              disabled={disabled}
              isReporting={isReporting}
              replyTargetId={replyTargetId}
              onReplyTargetChange={onReplyTargetChange}
              getCommentValue={getCommentValue}
              onCommentChange={onCommentChange}
              onCommentSubmit={onCommentSubmit}
              voteOnComment={voteOnComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
