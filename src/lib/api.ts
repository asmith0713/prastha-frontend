import axios from "axios";
import type { Thread, ThreadAlert, ThreadInsights, User, Gossip, GossipComment } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_KEY = "prastha:token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

const unwrap = <T>(response: { success?: boolean; data?: T } & Partial<T>): T => {
  if ("data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export type LoginPayload = {
  username: string;
  password: string;
  isAdmin?: boolean;
};

type AuthResponse = {
  user: User;
  token?: string;
};

export const authAPI = {
  async login(payload: LoginPayload) {
    const { data } = await api.post("/api/auth/login", payload);
    return unwrap<AuthResponse>(data);
  },
  async register(payload: Omit<LoginPayload, "isAdmin">) {
    const { data } = await api.post("/api/auth/register", payload);
    return unwrap<AuthResponse>(data);
  },
};

export const threadsAPI = {
  async list(): Promise<Thread[]> {
    const { data } = await api.get("/api/threads");
    const payload = unwrap<{ threads: Thread[] }>(data);
    return payload.threads ?? [];
  },
  async byUser(userId: string): Promise<ThreadInsights> {
    const { data } = await api.get(`/api/threads/user/${userId}`);
    return unwrap<ThreadInsights>(data);
  },
  async alerts(userId: string): Promise<ThreadAlert[]> {
    const { data } = await api.get(`/api/threads/alerts/${userId}`);
    const payload = unwrap<{ alerts: ThreadAlert[] }>(data);
    return payload.alerts ?? [];
  },
  async create(threadData: Partial<Thread>) {
    const { data } = await api.post("/api/threads", threadData);
    return data;
  },
  async update(threadId: string, updateData: Partial<Thread>) {
    const { data } = await api.put(`/api/threads/${threadId}`, updateData);
    return data;
  },
  async remove(threadId: string, userId: string) {
    const { data } = await api.delete(`/api/threads/${threadId}`, { data: { userId } });
    return data;
  },
  async requestJoin(threadId: string, userId: string) {
    const { data } = await api.post(`/api/threads/${threadId}/join`, { userId });
    return data;
  },
  async handleRequest(threadId: string, userId: string, approve: boolean, creatorId: string) {
    const { data } = await api.post(`/api/threads/${threadId}/requests`, {
      userId,
      approve,
      currentUserId: creatorId,
    });
    return data;
  },
  async sendMessage(
    threadId: string,
    messageData: {
      user: string;
      userId: string;
      message: string;
      replyToMessageId?: string | null;
      replyToUser?: string | null;
      replyPreview?: string | null;
    }
  ) {
    const { data } = await api.post(`/api/threads/${threadId}/messages`, messageData);
    return data;
  },
};

export const adminAPI = {
  async dashboard(userId: string) {
    const { data } = await api.get(`/api/admin/dashboard/${userId}`);
    return data;
  },
};

export const gossipsAPI = {
  async list(sortBy: string = "newest"): Promise<Gossip[]> {
    const { data } = await api.get("/api/gossips", { params: { sortBy } });
    const payload = unwrap<{ gossips: Gossip[] }>(data);
    return payload.gossips ?? [];
  },
  async create(payload: { content: string; authorId: string; authorUsername: string }): Promise<Gossip> {
    const { data } = await api.post("/api/gossips", payload);
    const payloadData = unwrap<{ gossip: Gossip }>(data);
    return payloadData.gossip;
  },
  async vote(gossipId: string, payload: { userId: string; voteType: "up" | "down" | "none" }) {
    const { data } = await api.post(`/api/gossips/${gossipId}/vote`, payload);
    return data;
  },
  async addComment(
    gossipId: string,
    payload: { content: string; authorId: string; authorUsername: string; parentCommentId?: string; replyTo?: string }
  ): Promise<GossipComment> {
    const { data } = await api.post(`/api/gossips/${gossipId}/comments`, payload);
    const payloadData = unwrap<{ comment: GossipComment }>(data);
    return payloadData.comment;
  },
  async delete(gossipId: string, userId: string) {
    const { data } = await api.delete(`/api/gossips/${gossipId}`, { data: { userId } });
    return data;
  },
  async deleteComment(gossipId: string, commentId: string, userId: string) {
    const { data } = await api.delete(`/api/gossips/${gossipId}/comments/${commentId}`, { data: { userId } });
    return data;
  },
  async voteOnComment(
    gossipId: string,
    commentId: string,
    payload: { userId: string; voteType: "up" | "down" | "none" }
  ) {
    const { data } = await api.post(`/api/gossips/${gossipId}/comments/${commentId}/vote`, payload);
    return data;
  },
  async reportComment(
    gossipId: string,
    commentId: string,
    payload: {
      reporterUsername: string;
      reporterId: string;
      commentAuthor: string;
      commentAuthorId: string;
      commentContent: string;
      reason?: string;
    }
  ) {
    const { data } = await api.post(`/api/gossips/${gossipId}/comments/${commentId}/report`, payload);
    return data;
  },
};
