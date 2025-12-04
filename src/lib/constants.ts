import type { Category, SortOption } from "@/types";

export const THREAD_CATEGORIES: Category[] = [
  { id: "all", label: "🌐 All signals", icon: "🌐" },
  { id: "sports", label: "⚽ Sports", icon: "⚽" },
  { id: "food", label: "🍜 Food", icon: "🍜" },
  { id: "entertainment", label: "🎬 Entertainment", icon: "🎬" },
  { id: "tech", label: "💻 Tech", icon: "💻" },
  { id: "study", label: "📚 Study", icon: "📚" },
  { id: "music", label: "🎵 Music", icon: "🎵" },
  { id: "fitness", label: "💪 Fitness", icon: "💪" },
  { id: "gaming", label: "🎮 Gaming", icon: "🎮" },
  { id: "other", label: "✨ Other", icon: "✨" },
];

export const SORT_OPTIONS: SortOption[] = [
  { id: "newest", label: "Newest first", description: "Fresh drops first", emoji: "🆕" },
  { id: "mostMembers", label: "Most members", description: "Crowd favorites", emoji: "👥" },
  { id: "expiringSoon", label: "Expiring soon", description: "Act quickly", emoji: "⏳" },
  { id: "mostActive", label: "Most active", description: "Buzzing chats", emoji: "💬" },
  { id: "oldest", label: "Oldest", description: "Heritage threads", emoji: "📼" },
];
