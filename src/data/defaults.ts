// DEMO_DEFAULTS - Seed data for the app
import type { Member, Group, Goal, Usage, Message, AppState } from "@/state/store";

const demoMembers: Record<string, Member> = {
  "1": { id: "1", name: "You", avatarUrl: "🔵", streak: 5 },
  "2": { id: "2", name: "Jake H.", avatarUrl: "🟢", streak: 7 },
  "3": { id: "3", name: "Sarah M.", avatarUrl: "🟣", streak: 3 },
  "4": { id: "4", name: "Mike T.", avatarUrl: "🟠", streak: 4 },
  "5": { id: "5", name: "Emma L.", avatarUrl: "🟡", streak: 2 },
  "6": { id: "6", name: "Mom", avatarUrl: "💐", streak: 12 },
  "7": { id: "7", name: "Dad", avatarUrl: "👔", streak: 8 },
  "8": { id: "8", name: "Sister", avatarUrl: "🌸", streak: 6 },
  "9": { id: "9", name: "Alex C.", avatarUrl: "💼", streak: 9 },
  "10": { id: "10", name: "Jordan P.", avatarUrl: "📊", streak: 10 },
  "11": { id: "11", name: "Taylor R.", avatarUrl: "💻", streak: 4 },
  "12": { id: "12", name: "Morgan L.", avatarUrl: "📱", streak: 3 },
  "13": { id: "13", name: "Casey M.", avatarUrl: "⌨️", streak: 2 },
  "14": { id: "14", name: "Chris P.", avatarUrl: "💪", streak: 15 },
  "15": { id: "15", name: "Sam K.", avatarUrl: "🏋️", streak: 7 },
};

const demoGroups: Record<string, Group> = {
  "friends": {
    id: "friends",
    name: "Friends",
    memberIds: ["1", "2", "3", "4", "5"],
    leaderId: "2",
    preset: "2w",
    poolEnabled: true,
    poolAmount: 250,
    poolCurrency: "USD",
    selectedGoals: ["Screen Time", "Steps"],
  },
  "family": {
    id: "family",
    name: "Family",
    memberIds: ["1", "6", "7", "8"],
    leaderId: "1",
    preset: "1w",
    poolEnabled: false,
    selectedGoals: ["Screen Time"],
  },
  "work": {
    id: "work",
    name: "Work Squad",
    memberIds: ["1", "9", "10", "11", "12", "13"],
    leaderId: "9",
    preset: "1m",
    poolEnabled: true,
    poolAmount: 500,
    poolCurrency: "USD",
    selectedGoals: ["Screen Time", "Steps"],
  },
  "gym": {
    id: "gym",
    name: "Gym Buddies",
    memberIds: ["1", "14", "15"],
    leaderId: "14",
    preset: "1w",
    poolEnabled: false,
    selectedGoals: ["Steps"],
  },
};

const demoGoals: Goal[] = [
  {
    id: "1",
    name: "Daily Social Limit",
    period: "daily",
    limitMinutes: 90,
    categories: ["Social"],
  },
];

const demoUsageToday: Usage[] = [
  { appId: "instagram", appName: "Instagram", category: "Social", minutes: 45, icon: "📸" },
  { appId: "tiktok", appName: "TikTok", category: "Social", minutes: 32, icon: "🎵" },
  { appId: "twitter", appName: "Twitter", category: "Social", minutes: 18, icon: "🐦" },
  { appId: "youtube", appName: "YouTube", category: "Entertainment", minutes: 67, icon: "📺" },
  { appId: "netflix", appName: "Netflix", category: "Entertainment", minutes: 42, icon: "🎬" },
  { appId: "spotify", appName: "Spotify", category: "Entertainment", minutes: 23, icon: "🎧" },
];

const demoUsageThisWeek: Usage[] = [
  { appId: "instagram", appName: "Instagram", category: "Social", minutes: 145, icon: "📸" },
  { appId: "tiktok", appName: "TikTok", category: "Social", minutes: 112, icon: "🎵" },
  { appId: "twitter", appName: "Twitter", category: "Social", minutes: 78, icon: "🐦" },
  { appId: "youtube", appName: "YouTube", category: "Entertainment", minutes: 203, icon: "📺" },
  { appId: "netflix", appName: "Netflix", category: "Entertainment", minutes: 156, icon: "🎬" },
  { appId: "spotify", appName: "Spotify", category: "Entertainment", minutes: 89, icon: "🎧" },
];

const demoMessages: Record<string, Message[]> = {
  "friends": [
    { id: "1", groupId: "friends", kind: "system", text: "Hayden nominated Alex as Leader", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "2", groupId: "friends", authorId: "2", kind: "user", text: "Let's crush this challenge! 💪", createdAt: new Date(Date.now() - 43200000).toISOString() },
    { id: "3", groupId: "friends", authorId: "1", kind: "user", text: "I'm ready! Who's with me?", createdAt: new Date(Date.now() - 21600000).toISOString(), reactions: { "👍": 3, "🔥": 2 } },
    { id: "4", groupId: "friends", kind: "system", text: "Leader set Time Limit: 2 Weeks; Pool: $250; Goals: Steps, Screen Time", createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: "5", groupId: "friends", authorId: "3", kind: "user", text: "2k steps to go!", createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "6", groupId: "friends", authorId: "1", kind: "user", text: "You got this Sarah! 🔥", createdAt: new Date(Date.now() - 3600000).toISOString(), replyToId: "5" },
  ],
  "family": [
    { id: "f1", groupId: "family", kind: "system", text: "Challenge started", createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: "f2", groupId: "family", authorId: "6", kind: "user", text: "Looking forward to this week!", createdAt: new Date(Date.now() - 86400000).toISOString() },
  ],
  "work": [
    { id: "w1", groupId: "work", kind: "system", text: "Alex C. is the group leader", createdAt: new Date(Date.now() - 259200000).toISOString() },
  ],
  "gym": [
    { id: "g1", groupId: "gym", kind: "system", text: "Chris P. started the challenge", createdAt: new Date(Date.now() - 172800000).toISOString() },
  ],
};

export const DEMO_DEFAULTS: AppState = {
  me: demoMembers["1"],
  members: demoMembers,
  groups: demoGroups,
  myGroupIds: ["friends", "family", "work", "gym"],
  goals: demoGoals,
  usageToday: demoUsageToday,
  usageThisWeek: demoUsageThisWeek,
  messagesByGroup: demoMessages,
  friendRequests: [],
};
