"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gossipsAPI } from "@/lib/api";
import type { Gossip, GossipSort } from "@/types";

const GOSSIPS_CACHE_KEY = ["gossips"] as const;

type VoteInput = {
  gossipId: string;
  userId: string;
  voteType: "up" | "down" | "none";
};

type CommentInput = {
  gossipId: string;
  content: string;
  authorId: string;
  authorUsername: string;
  parentCommentId?: string;
  replyTo?: string;
};

type DeleteInput = {
  gossipId: string;
  userId: string;
};

type DeleteCommentInput = {
  gossipId: string;
  commentId: string;
  userId: string;
};

type CommentVoteInput = {
  gossipId: string;
  commentId: string;
  userId: string;
  voteType: "up" | "down" | "none";
};

type ReportCommentInput = {
  gossipId: string;
  commentId: string;
  reporterUsername: string;
  reporterId: string;
  commentAuthor: string;
  commentAuthorId: string;
  commentContent: string;
  reason?: string;
};

export function useGossips(sortBy: GossipSort = "newest") {
  const queryClient = useQueryClient();
  const queryKey = [...GOSSIPS_CACHE_KEY, sortBy] as const;

  const gossipsQuery = useQuery<Gossip[]>({
    queryKey,
    queryFn: () => gossipsAPI.list(sortBy),
    staleTime: 30_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: GOSSIPS_CACHE_KEY });

  const updateGossip = (gossipId: string, updater: (gossip: Gossip) => Gossip) => {
    queryClient.setQueryData<Gossip[]>(queryKey, (current) => {
      if (!current) return current;
      return current.map((gossip) => (gossip.id === gossipId ? updater(gossip) : gossip));
    });
  };

  const updateComment = (
    gossipId: string,
    commentId: string,
    updater: (comment: Gossip["comments"][number]) => Gossip["comments"][number]
  ) => {
    updateGossip(gossipId, (gossip) => ({
      ...gossip,
      comments: gossip.comments.map((comment) => (comment.id === commentId ? updater(comment) : comment)),
    }));
  };

  const removeGossip = (gossipId: string) => {
    queryClient.setQueryData<Gossip[]>(queryKey, (current) => current?.filter((gossip) => gossip.id !== gossipId));
  };

  const createGossipMutation = useMutation({
    mutationFn: gossipsAPI.create,
    onSuccess: (newGossip) => {
      queryClient.setQueryData<Gossip[]>(queryKey, (current = []) =>
        sortBy === "newest" ? [newGossip, ...current] : [...current, newGossip]
      );
      invalidate();
    },
  });

  const voteMutation = useMutation({
    mutationFn: ({ gossipId, userId, voteType }: VoteInput) =>
      gossipsAPI.vote(gossipId, { userId, voteType }),
    onSuccess: (result, { gossipId, userId, voteType }) => {
      updateGossip(gossipId, (gossip) => {
        let upvotedBy = gossip.upvotedBy.filter((id) => id !== userId);
        let downvotedBy = gossip.downvotedBy.filter((id) => id !== userId);

        if (voteType === "up") {
          upvotedBy = [...upvotedBy, userId];
        } else if (voteType === "down") {
          downvotedBy = [...downvotedBy, userId];
        }

        return {
          ...gossip,
          upvotes: result?.upvotes ?? upvotedBy.length,
          downvotes: result?.downvotes ?? downvotedBy.length,
          upvotedBy,
          downvotedBy,
        };
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ gossipId, ...rest }: CommentInput) =>
      gossipsAPI.addComment(gossipId, rest),
    onSuccess: (comment, { gossipId }) => {
      updateGossip(gossipId, (gossip) => ({
        ...gossip,
        comments: [...gossip.comments, comment],
        lastActivity: comment.createdAt ?? gossip.lastActivity,
      }));
      invalidate();
    },
  });

  const deleteGossipMutation = useMutation({
    mutationFn: ({ gossipId, userId }: DeleteInput) => gossipsAPI.delete(gossipId, userId),
    onSuccess: (_data, { gossipId }) => {
      removeGossip(gossipId);
      invalidate();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ gossipId, commentId, userId }: DeleteCommentInput) =>
      gossipsAPI.deleteComment(gossipId, commentId, userId),
    onSuccess: (_data, { gossipId, commentId }) => {
      updateGossip(gossipId, (gossip) => ({
        ...gossip,
        comments: gossip.comments.filter((comment) => comment.id !== commentId),
      }));
      invalidate();
    },
  });

  const reportCommentMutation = useMutation({
    mutationFn: ({ gossipId, commentId, ...rest }: ReportCommentInput) =>
      gossipsAPI.reportComment(gossipId, commentId, rest),
  });

  const commentVoteMutation = useMutation({
    mutationFn: ({ gossipId, commentId, userId, voteType }: CommentVoteInput) =>
      gossipsAPI.voteOnComment(gossipId, commentId, { userId, voteType }),
    onSuccess: (result, { gossipId, commentId }) => {
      updateComment(gossipId, commentId, (comment) => ({
        ...comment,
        upvotes: result?.upvotes ?? comment.upvotes,
        downvotes: result?.downvotes ?? comment.downvotes,
        upvotedBy: result?.upvotedBy ?? comment.upvotedBy,
        downvotedBy: result?.downvotedBy ?? comment.downvotedBy,
      }));
    },
  });

  return {
    gossipsQuery,
    createGossip: createGossipMutation.mutateAsync,
    voteOnGossip: voteMutation.mutateAsync,
    addComment: commentMutation.mutateAsync,
    deleteGossip: deleteGossipMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    reportComment: reportCommentMutation.mutateAsync,
    isReportingComment: reportCommentMutation.isPending,
    voteOnComment: commentVoteMutation.mutateAsync,
  };
}
