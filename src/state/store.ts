// Lightweight client store with persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_DEFAULTS } from "@/data/defaults";
import { computeScore } from "@/utils/score";

// Types
export type Member = {
  id: string;
  name: string;
  avatarUrl?: string;
  streak?: number;
};

export type Group = {
  id: string;
  name: string;
  memberIds: string[];
  leaderId?: string;
  preset?: "1w" | "2w" | "1m";
  poolEnabled?: boolean;
  poolAmount?: number;
  poolCurrency?: "USD" | "EUR" | "GBP";
  selectedGoals?: string[];
};

export type Goal = {
  id: string;
  name: string;
  period: "daily" | "weekly";
  limitMinutes: number;
  apps?: string[];
  categories?: string[];
  schedule?: {
    days?: number[];
    start?: string;
    end?: string;
  };
};

export type Usage = {
  appId: string;
  appName: string;
  category: string;
  minutes: number;
  icon?: string;
};

export type Message = {
  id: string;
  groupId: string;
  authorId?: string;
  kind: "user" | "system";
  text: string;
  createdAt: string;
  replyToId?: string;
  reactions?: Record<string, number>;
};

export type FriendRequest = {
  id: string;
  fromId: string;
  toId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export type AppState = {
  me: Member;
  members: Record<string, Member>;
  groups: Record<string, Group>;
  myGroupIds: string[];
  goals: Goal[];
  usageToday: Usage[];
  usageThisWeek: Usage[];
  messagesByGroup: Record<string, Message[]>;
  friendRequests: FriendRequest[];
};

// Store with persistence
type StoreState = AppState & {
  // Actions
  setLeader: (groupId: string, memberId: string) => void;
  updateGroupSettings: (groupId: string, settings: Partial<Group>) => void;
  saveGoal: (goal: Goal) => void;
  deleteGoal: (goalId: string) => void;
  sendMessage: (groupId: string, text: string, replyToId?: string) => void;
  addReaction: (groupId: string, messageId: string, emoji: string) => void;
  addFriend: (memberId: string) => void;
  sendFriendRequest: (toId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  leaderboard: (groupId: string, period: "today" | "week") => Array<{
    memberId: string;
    name: string;
    avatar: string;
    score: number;
    rank: number;
  }>;
  resetToDemo: () => void;
  updateUsage: (usage: Usage[]) => void;
};

const deepMerge = (target: any, source: any): any => {
  if (typeof target !== "object" || target === null) return source;
  if (typeof source !== "object" || source === null) return target;

  const result = { ...target };
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      result[key] = deepMerge(target[key], source[key]);
    }
  }
  return result;
};

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...DEMO_DEFAULTS,

      setLeader: (groupId: string, memberId: string) => {
        set((state) => {
          const group = state.groups[groupId];
          if (!group) return state;

          const member = state.members[memberId];
          const updatedGroup = { ...group, leaderId: memberId };

          // Add system message
          const systemMessage: Message = {
            id: Date.now().toString(),
            groupId,
            kind: "system",
            text: `${member?.name || "Someone"} is now the leader`,
            createdAt: new Date().toISOString(),
          };

          return {
            groups: { ...state.groups, [groupId]: updatedGroup },
            messagesByGroup: {
              ...state.messagesByGroup,
              [groupId]: [...(state.messagesByGroup[groupId] || []), systemMessage],
            },
          };
        });
      },

      updateGroupSettings: (groupId: string, settings: Partial<Group>) => {
        set((state) => {
          const group = state.groups[groupId];
          if (!group) return state;

          const updatedGroup = { ...group, ...settings };

          // Create system message about settings change
          const parts: string[] = [];
          if (settings.preset) parts.push(`Time: ${settings.preset}`);
          if (settings.poolEnabled !== undefined) {
            if (settings.poolEnabled && settings.poolAmount) {
              parts.push(`Pool: $${settings.poolAmount}`);
            }
          }
          if (settings.selectedGoals) parts.push(`Goals: ${settings.selectedGoals.join(", ")}`);

          const systemMessage: Message = {
            id: Date.now().toString(),
            groupId,
            kind: "system",
            text: `Leader updated settings: ${parts.join("; ")}`,
            createdAt: new Date().toISOString(),
          };

          return {
            groups: { ...state.groups, [groupId]: updatedGroup },
            messagesByGroup: {
              ...state.messagesByGroup,
              [groupId]: [...(state.messagesByGroup[groupId] || []), systemMessage],
            },
          };
        });
      },

      saveGoal: (goal: Goal) => {
        set((state) => {
          const existingIndex = state.goals.findIndex((g) => g.id === goal.id);
          if (existingIndex >= 0) {
            const updatedGoals = [...state.goals];
            updatedGoals[existingIndex] = goal;
            return { goals: updatedGoals };
          }
          return { goals: [...state.goals, goal] };
        });
      },

      deleteGoal: (goalId: string) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== goalId),
        }));
      },

      sendMessage: (groupId: string, text: string, replyToId?: string) => {
        set((state) => {
          const newMessage: Message = {
            id: Date.now().toString(),
            groupId,
            authorId: state.me.id,
            kind: "user",
            text,
            createdAt: new Date().toISOString(),
            replyToId,
          };

          return {
            messagesByGroup: {
              ...state.messagesByGroup,
              [groupId]: [...(state.messagesByGroup[groupId] || []), newMessage],
            },
          };
        });
      },

      addReaction: (groupId: string, messageId: string, emoji: string) => {
        set((state) => {
          const messages = state.messagesByGroup[groupId] || [];
          const updatedMessages = messages.map((msg) => {
            if (msg.id === messageId) {
              const reactions = { ...(msg.reactions || {}) };
              reactions[emoji] = (reactions[emoji] || 0) + 1;
              return { ...msg, reactions };
            }
            return msg;
          });

          return {
            messagesByGroup: {
              ...state.messagesByGroup,
              [groupId]: updatedMessages,
            },
          };
        });
      },

      addFriend: (memberId: string) => {
        // This would typically involve creating a new group or adding to existing
        // For now, just log
        console.log("Add friend:", memberId);
      },

      sendFriendRequest: (toId: string) => {
        set((state) => {
          const newRequest: FriendRequest = {
            id: Date.now().toString(),
            fromId: state.me.id,
            toId,
            status: "pending",
            createdAt: new Date().toISOString(),
          };
          return {
            friendRequests: [...state.friendRequests, newRequest],
          };
        });
      },

      acceptFriendRequest: (requestId: string) => {
        set((state) => {
          const updatedRequests = state.friendRequests.map((req) =>
            req.id === requestId ? { ...req, status: "accepted" as const } : req
          );
          return { friendRequests: updatedRequests };
        });
      },

      declineFriendRequest: (requestId: string) => {
        set((state) => ({
          friendRequests: state.friendRequests.filter((req) => req.id !== requestId),
        }));
      },

      leaderboard: (groupId: string, period: "today" | "week") => {
        const state = get();
        const group = state.groups[groupId];
        if (!group) return [];

        const usage = period === "today" ? state.usageToday : state.usageThisWeek;
        const goal = state.goals[0]; // Simplified: use first goal
        const limit = goal ? goal.limitMinutes : 120;

        // Compute scores for each member
        const scores = group.memberIds.map((memberId) => {
          const member = state.members[memberId];
          // Simplified: use total usage for this member (in real app, would track per-member)
          const totalUsed = usage.reduce((sum, u) => sum + u.minutes, 0) / group.memberIds.length;
          const score = computeScore(limit, totalUsed, member?.streak || 0);

          return {
            memberId,
            name: member?.name || "Unknown",
            avatar: member?.avatarUrl || "❓",
            score,
            rank: 0, // Will be set after sorting
          };
        });

        // Sort by score descending and assign ranks
        scores.sort((a, b) => b.score - a.score);
        scores.forEach((s, i) => {
          s.rank = i + 1;
        });

        return scores;
      },

      resetToDemo: () => {
        set(DEMO_DEFAULTS);
      },

      updateUsage: (usage: Usage[]) => {
        set({ usageToday: usage });
      },
    }),
    {
      name: "leuth@app@v1",
      partialize: (state) => {
        // Only persist user overrides, not the entire state
        const overrides: Partial<AppState> = {};

        // Check what's different from defaults
        if (JSON.stringify(state.me) !== JSON.stringify(DEMO_DEFAULTS.me)) {
          overrides.me = state.me;
        }
        if (JSON.stringify(state.groups) !== JSON.stringify(DEMO_DEFAULTS.groups)) {
          overrides.groups = state.groups;
        }
        if (JSON.stringify(state.goals) !== JSON.stringify(DEMO_DEFAULTS.goals)) {
          overrides.goals = state.goals;
        }
        if (JSON.stringify(state.messagesByGroup) !== JSON.stringify(DEMO_DEFAULTS.messagesByGroup)) {
          overrides.messagesByGroup = state.messagesByGroup;
        }
        if (state.friendRequests.length > 0) {
          overrides.friendRequests = state.friendRequests;
        }

        return overrides as StoreState;
      },
      merge: (persistedState: any, currentState: StoreState) => {
        // Merge persisted overrides with demo defaults
        return deepMerge(currentState, persistedState) as StoreState;
      },
    }
  )
);
