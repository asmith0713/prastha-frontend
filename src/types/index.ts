export type User = {
  id: string;
  username: string;
  isAdmin?: boolean;
};

export type ThreadMessage = {
  id: string;
  user: string;
  userId: string;
  message: string;
  timestamp: string;
};

export type Thread = {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorId: string;
  location: string;
  tags: string[];
  members: string[];
  pendingRequests: string[];
  chat: ThreadMessage[];
  createdAt: string;
  expiresAt: string;
};

export type ThreadStats = {
  created: number;
  joined: number;
  impact: number;
};

export type ThreadInsights = {
  stats: ThreadStats;
  createdThreads: Thread[];
  joinedThreads: Thread[];
};

export type ThreadAlert = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "urgent" | "soon" | "scheduled";
  location: string;
  thread: Thread;
};

export type Category = {
  id: string;
  label: string;
  icon: string;
};

export type SortOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
};

export type GossipComment = {
  id: string;
  content: string;
  author: string;
  authorId: string;
  isAnonymous: boolean;
  parentCommentId: string | null;
  replyTo: string | null;
  createdAt: string;
};

export type Gossip = {
  id: string;
  content: string;
  author: string;
  authorId: string;
  isAnonymous: boolean;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  lastActivity?: string;
  expiresAt?: string;
  comments: GossipComment[];
  createdAt: string;
};

export type GossipSort = "newest" | "popular" | "controversial";
