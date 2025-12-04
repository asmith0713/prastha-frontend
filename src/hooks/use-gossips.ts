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

  const gossipsQuery = useQuery<Gossip[]>({
    queryKey: [...GOSSIPS_CACHE_KEY, sortBy],
    queryFn: () => gossipsAPI.list(sortBy),
    staleTime: 30_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: GOSSIPS_CACHE_KEY });

  const createGossipMutation = useMutation({
    mutationFn: gossipsAPI.create,
    onSuccess: invalidate,
  });

  const voteMutation = useMutation({
    mutationFn: ({ gossipId, userId, voteType }: VoteInput) =>
      gossipsAPI.vote(gossipId, { userId, voteType }),
    onSuccess: invalidate,
  });

  const commentMutation = useMutation({
    mutationFn: ({ gossipId, ...rest }: CommentInput) =>
      gossipsAPI.addComment(gossipId, rest),
    onSuccess: invalidate,
  });

  const deleteGossipMutation = useMutation({
    mutationFn: ({ gossipId, userId }: DeleteInput) => gossipsAPI.delete(gossipId, userId),
    onSuccess: invalidate,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ gossipId, commentId, userId }: DeleteCommentInput) =>
      gossipsAPI.deleteComment(gossipId, commentId, userId),
    onSuccess: invalidate,
  });

  const reportCommentMutation = useMutation({
    mutationFn: ({ gossipId, commentId, ...rest }: ReportCommentInput) =>
      gossipsAPI.reportComment(gossipId, commentId, rest),
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
  };
}
