import { useState, useRef, useEffect } from "react";
import { Home, MessageCircle, BarChart3, User, Settings, Moon, Sun, ChevronRight, Users2, Crown, Check, X, Calendar, Send, Zap, Smile, Reply, ThumbsUp, Laugh, Flame, Eye, UserPlus } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { FriendsScreenSocialV3 } from "./FriendsScreenSocialV3";
import { ScoreRing } from "./ScoreRing";

type Member = { id: string; name: string; avatar: string };
type ChallengeSettings = {
  start?: string;
  end?: string;
  preset?: "1w" | "2w" | "1m" | null;
  pool?: { enabled: boolean; amount?: number; currency?: "USD" | "EUR" | "GBP" };
  goals: string[];
};
type Group = {
  id: string;
  name: string;
  members: Member[];
  leaderId?: string;
  settings: ChallengeSettings;
};

type Message = {
  id: string;
  authorId?: string;
  kind: "user" | "system";
  text: string;
  createdAt: string;
  replyToId?: string;
  reactions?: Record<string, number>;
};

type LiveStats = {
  goalKeys: string[];
  perMember: Record<string, { steps?: number; energy?: number; screen?: number; streak?: number; pctBelowAvg?: number }>;
  groupTotals?: Record<string, number>;
  timeLeft: string;
  leaderId?: string;
};

type AppUsage = { appId: string; name: string; icon: string; category: string; minutes: number };
type CategoryUsage = { category: string; minutes: number; color: string };
type ScreenTimeGoal = {
  id: string;
  name: string;
  period: "daily" | "weekly";
  limitMinutes: number;
  apps?: string[];
  categories?: string[];
  schedule?: { days?: number[]; start?: string; end?: string };
};

const IOSMockup = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedGroup, setSelectedGroup] = useState<string>("Friends");
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  
  // Group settings state
  const [currentGroup, setCurrentGroup] = useState<Group>({
    id: "friends-group",
    name: "Friends",
    members: [
      { id: "1", name: "You", avatar: "🔵" },
      { id: "2", name: "Jake H.", avatar: "🟢" },
      { id: "3", name: "Sarah M.", avatar: "🟣" },
      { id: "4", name: "Mike T.", avatar: "🟠" },
      { id: "5", name: "Emma L.", avatar: "🟡" },
    ],
    leaderId: "1",
    settings: {
      preset: "2w",
      pool: { enabled: true, amount: 250, currency: "USD" },
      goals: ["Screen Time", "Steps"],
    },
  });
  
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [timePreset, setTimePreset] = useState<"1w" | "2w" | "1m" | "custom">(currentGroup.settings.preset || "2w");
  const [poolEnabled, setPoolEnabled] = useState(currentGroup.settings.pool?.enabled || false);
  const [poolAmount, setPoolAmount] = useState(currentGroup.settings.pool?.amount || 0);
  const [poolCurrency, setPoolCurrency] = useState<"USD" | "EUR" | "GBP">(currentGroup.settings.pool?.currency || "USD");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(currentGroup.settings.goals || []);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", kind: "system", text: "Hayden nominated Alex as Leader", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "2", authorId: "2", kind: "user", text: "Let's crush this challenge! 💪", createdAt: new Date(Date.now() - 43200000).toISOString() },
    { id: "3", authorId: "1", kind: "user", text: "I'm ready! Who's with me?", createdAt: new Date(Date.now() - 21600000).toISOString(), reactions: { "👍": 3, "🔥": 2 } },
    { id: "4", kind: "system", text: "Leader set Time Limit: 2 Weeks; Pool: $250; Goals: Steps, Screen Time", createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: "5", authorId: "3", kind: "user", text: "2k steps to go!", createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "6", authorId: "1", kind: "user", text: "You got this Sarah! 🔥", createdAt: new Date(Date.now() - 3600000).toISOString(), replyToId: "5" },
  ]);
  const [messageText, setMessageText] = useState("");
  const [showCalloutMenu, setShowCalloutMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Screen Time Goal state
  const [screenTimeGoals, setScreenTimeGoals] = useState<ScreenTimeGoal[]>([
    {
      id: "1",
      name: "Daily Social Limit",
      period: "daily",
      limitMinutes: 90,
      categories: ["Social"],
    },
  ]);
  const [showGoalBuilder, setShowGoalBuilder] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ScreenTimeGoal | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalPeriod, setGoalPeriod] = useState<"daily" | "weekly">("daily");
  const [goalLimit, setGoalLimit] = useState(90);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const appUsageData: AppUsage[] = [
    { appId: "instagram", name: "Instagram", icon: "📸", category: "Social", minutes: 145 },
    { appId: "tiktok", name: "TikTok", icon: "🎵", category: "Social", minutes: 112 },
    { appId: "twitter", name: "Twitter", icon: "🐦", category: "Social", minutes: 78 },
    { appId: "youtube", name: "YouTube", icon: "📺", category: "Entertainment", minutes: 203 },
    { appId: "netflix", name: "Netflix", icon: "🎬", category: "Entertainment", minutes: 156 },
    { appId: "spotify", name: "Spotify", icon: "🎧", category: "Entertainment", minutes: 89 },
  ];
  
  const categoryUsageData: CategoryUsage[] = [
    { category: "Social", minutes: 335, color: "#FF6B9D" },
    { category: "Entertainment", minutes: 448, color: "#4ECDC4" },
    { category: "Productivity", minutes: 67, color: "#95E1D3" },
  ];
  
  const availableApps = appUsageData.map(app => ({ id: app.appId, name: app.name, icon: app.icon }));
  const availableCategories = ["Social", "Entertainment", "Productivity", "Games", "News"];
  
  const liveStats: LiveStats = {
    goalKeys: ["Steps", "Screen Time"],
    perMember: {
      "1": { steps: 8500, screen: 18.5, streak: 5, pctBelowAvg: 0 },
      "2": { steps: 12000, screen: 15.2, streak: 7, pctBelowAvg: -15 },
      "3": { steps: 6200, screen: 22.7, streak: 3, pctBelowAvg: 12 },
      "4": { steps: 9500, screen: 25.3, streak: 4, pctBelowAvg: 8 },
      "5": { steps: 7800, screen: 28.1, streak: 2, pctBelowAvg: 18 },
    },
    groupTotals: { steps: 44000, screen: 109.8 },
    timeLeft: "2d 4h",
    leaderId: "2",
  };

  const [showChatSheet, setShowChatSheet] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showGroupRankModal, setShowGroupRankModal] = useState(false);
  const [selectedHomeGroup, setSelectedHomeGroup] = useState("Friends");
  
  // Mock groups data for rank selector
  const userGroups = [
    { id: "friends", name: "Friends", rank: 2, total: 5, score: 76 },
    { id: "family", name: "Family", rank: 1, total: 4, score: 82 },
    { id: "work", name: "Work Squad", rank: 3, total: 6, score: 71 },
    { id: "gym", name: "Gym Buddies", rank: 2, total: 3, score: 79 },
  ];

  // Mock leaderboard data for home page based on selected group
  const homeLeaderboards: Record<string, Array<{ id: number; name: string; score: number; rank: number; avatar: string }>> = {
    "Friends": [
      { id: 1, name: "Jake H.", score: 85, rank: 1, avatar: "🟢" },
      { id: 2, name: "You", score: 76, rank: 2, avatar: "🔵" },
      { id: 3, name: "Sarah M.", score: 72, rank: 3, avatar: "🟣" },
      { id: 4, name: "Mike T.", score: 68, rank: 4, avatar: "🟠" },
      { id: 5, name: "Emma L.", score: 61, rank: 5, avatar: "🟡" },
    ],
    "Family": [
      { id: 1, name: "Mom", score: 92, rank: 1, avatar: "💐" },
      { id: 2, name: "You", score: 82, rank: 2, avatar: "🔵" },
      { id: 3, name: "Dad", score: 78, rank: 3, avatar: "👔" },
      { id: 4, name: "Sister", score: 70, rank: 4, avatar: "🌸" },
    ],
    "Work Squad": [
      { id: 1, name: "Alex C.", score: 88, rank: 1, avatar: "💼" },
      { id: 2, name: "Jordan P.", score: 84, rank: 2, avatar: "📊" },
      { id: 3, name: "You", score: 71, rank: 3, avatar: "🔵" },
      { id: 4, name: "Taylor R.", score: 67, rank: 4, avatar: "💻" },
      { id: 5, name: "Morgan L.", score: 65, rank: 5, avatar: "📱" },
      { id: 6, name: "Casey M.", score: 59, rank: 6, avatar: "⌨️" },
    ],
    "Gym Buddies": [
      { id: 1, name: "Chris P.", score: 95, rank: 1, avatar: "💪" },
      { id: 2, name: "You", score: 79, rank: 2, avatar: "🔵" },
      { id: 3, name: "Sam K.", score: 73, rank: 3, avatar: "🏋️" },
    ],
  };

  const TabContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />;
      case "group":
        return <GroupTab />;
      case "stats":
        return <StatsTab />;
      case "friends":
        return <FriendsTab />;
      case "settings":
        return <SettingsTab theme={theme} setTheme={setTheme} />;
      default:
        return <HomeTab />;
    }
  };

  const HomeTab = () => {
    const screenTimeScore = 76; // 0-100 score
    const scoreDelta = 8; // vs yesterday
    
    // Get leaderboard data based on selected group
    const leaderboardData = homeLeaderboards[selectedHomeGroup] || homeLeaderboards["Friends"];
    const selectedGroupData = userGroups.find(g => g.name === selectedHomeGroup);

    return (
      <div className="h-full flex flex-col relative">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary italic">Analog</h1>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Main Score Ring - Centered */}
          <div className="flex items-center justify-center py-12">
            <ScoreRing score={screenTimeScore} delta={scoreDelta} size={260} />
          </div>

          {/* Your Rank Card - Clickable */}
          <button 
            onClick={() => setShowGroupRankModal(true)}
            className="glass-card rounded-3xl p-6 mb-6 text-center w-full hover:scale-[1.02] transition-transform"
          >
            <p className="text-sm text-muted-foreground mb-2">Your Rank vs {selectedHomeGroup}</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-bold text-foreground">#{selectedGroupData?.rank || 2}</span>
              <span className="text-lg text-muted-foreground">of {selectedGroupData?.total || 5}</span>
            </div>
            <p className="text-xs text-primary mt-2">Tap to view all groups</p>
          </button>

          {/* Leaderboard */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">{selectedHomeGroup} Leaderboard</h3>
            <div className="space-y-3">
              {leaderboardData.map((person) => {
                const getScoreColor = (score: number) => {
                  if (score >= 80) return "text-green-500";
                  if (score >= 60) return "text-yellow-500";
                  return "text-red-500";
                };

                return (
                  <div
                    key={person.id}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                      person.name === "You"
                        ? "glass-card-inner border-2 border-primary"
                        : "glass-card-inner"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-muted-foreground w-6">
                        #{person.rank}
                      </span>
                      <span className="text-3xl">{person.avatar}</span>
                      <span className={`font-bold ${
                        person.name === "You" ? "text-primary" : "text-foreground"
                      }`}>
                        {person.name}
                      </span>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(person.score)}`}>
                      {person.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Group Rank Modal */}
        {showGroupRankModal && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowGroupRankModal(false)}>
            <div 
              className="w-full bg-background rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
              style={{ height: '60vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0 px-6 pt-4 pb-2 border-b border-border">
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Your Rankings</h2>
                  <button
                    onClick={() => setShowGroupRankModal(false)}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                {userGroups.map((group) => {
                  const getScoreColor = (score: number) => {
                    if (score >= 80) return "text-green-500";
                    if (score >= 60) return "text-yellow-500";
                    return "text-red-500";
                  };

                  return (
                    <button 
                      key={group.id} 
                      onClick={() => {
                        setSelectedHomeGroup(group.name);
                        setShowGroupRankModal(false);
                        toast.success(`Viewing ${group.name} leaderboard`);
                      }}
                      className={`glass-card rounded-3xl p-5 w-full hover:scale-[1.02] transition-transform ${
                        selectedHomeGroup === group.name ? "border-2 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-foreground">{group.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            #{group.rank} of {group.total}
                          </p>
                        </div>
                        <span className={`text-3xl font-bold ${getScoreColor(group.score)}`}>
                          {group.score}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(group.rank / group.total) * 100}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const FriendsTab = () => {
    const leaderboardData = [
      { id: 1, name: "Jake H.", score: 85, rank: 1, avatar: "🟢", delta: "+5" },
      { id: 2, name: "You", score: 76, rank: 2, avatar: "🔵", delta: "+8" },
      { id: 3, name: "Sarah M.", score: 72, rank: 3, avatar: "🟣", delta: "-2" },
      { id: 4, name: "Mike T.", score: 68, rank: 4, avatar: "🟠", delta: "+3" },
      { id: 5, name: "Emma L.", score: 61, rank: 5, avatar: "🟡", delta: "-1" },
    ];

    const quickChips = ["GG", "Nice run!", "Catch me if you can 😎"];
    const reactions = ["👍", "👏", "😂", "🔥", "😴"];
    
    useEffect(() => {
      if (showChatSheet) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, [showChatSheet, messages]);
    
    const filterProfanity = (text: string) => {
      const badWords = ["damn", "hell", "stupid", "idiot"];
      let filtered = text;
      badWords.forEach(word => {
        const regex = new RegExp(word, "gi");
        filtered = filtered.replace(regex, "—");
      });
      return filtered;
    };
    
    const sendMessage = (text: string) => {
      const filtered = filterProfanity(text);
      const newMessage: Message = {
        id: Date.now().toString(),
        authorId: "1",
        kind: "user",
        text: filtered,
        createdAt: new Date().toISOString(),
        replyToId: replyingTo?.id,
      };
      setMessages([...messages, newMessage]);
      setMessageText("");
      setReplyingTo(null);
      toast.success("Message sent!");
    };
    
    const insertCallout = (kind: "props" | "nudge" | "flex") => {
      const member = currentGroup.members.find(m => m.id === "2");
      const stats = liveStats.perMember["2"];
      const templates = {
        props: `🔥 ${member?.name} is on a ${stats?.streak}-day streak — carrying the squad!`,
        nudge: `👀 ${member?.name} is ${Math.abs(stats?.pctBelowAvg || 0)}% below avg on Steps… time to step it up?`,
        flex: `💪 Group crushed Steps: ${liveStats.groupTotals?.steps} today! MVP: ${member?.name}.`,
      };
      setMessageText(templates[kind]);
      setShowCalloutMenu(false);
    };
    
    const reactToMessage = (messageId: string, emoji: string) => {
      setMessages(messages.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || {};
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...msg, reactions };
        }
        return msg;
      }));
      setShowReactionPicker(null);
      toast.success("Reaction added!");
    };
    
    const getMember = (id: string) => currentGroup.members.find(m => m.id === id);
    const formatTime = (iso: string) => {
      const date = new Date(iso);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return "just now";
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    };

    const getScoreColor = (score: number) => {
      if (score >= 80) return "text-green-500";
      if (score >= 60) return "text-yellow-500";
      return "text-red-500";
    };

    return (
      <div className="h-full flex flex-col relative">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary italic">Analog</h1>
            <button
              onClick={() => setShowAddFriendModal(true)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
            >
              <UserPlus className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Scrollable Leaderboard Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="py-6 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Friends Leaderboard</h2>
            
            {leaderboardData.map((person) => (
              <div
                key={person.id}
                className={`glass-card rounded-3xl p-6 transition-all hover:scale-[1.02] ${
                  person.name === "You" ? "border-2 border-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8">
                      #{person.rank}
                    </span>
                    <span className="text-4xl">{person.avatar}</span>
                    <div>
                      <p className={`font-bold text-lg ${
                        person.name === "You" ? "text-primary" : "text-foreground"
                      }`}>
                        {person.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {person.delta.startsWith("+") ? "▲" : "▼"} {person.delta} vs yesterday
                      </p>
                    </div>
                  </div>
                  <span className={`text-3xl font-bold ${getScoreColor(person.score)}`}>
                    {person.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Action Button (FAB) - Chat */}
        <button
          onClick={() => setShowChatSheet(true)}
          className="fixed bottom-28 right-8 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40"
          style={{ bottom: 'calc(88px + env(safe-area-inset-bottom))' }}
        >
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        </button>

        {/* Bottom Sheet - Group Chat */}
        {showChatSheet && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowChatSheet(false)}>
            <div 
              className="w-full bg-background rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
              style={{ height: '70vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Header with Drag Handle */}
              <div className="flex-shrink-0 px-6 pt-4 pb-2 border-b border-border">
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Group Chat</h2>
                  <button
                    onClick={() => setShowChatSheet(false)}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </div>

              {/* Message List - Scrollable */}
              <div 
                className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-3"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: '140px'
                }}
              >
                {messages.map((msg) => {
                  const member = msg.authorId ? getMember(msg.authorId) : null;
                  const isMe = msg.authorId === "1";
                  const replyTo = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;
                  
                  if (msg.kind === "system") {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <div className="glass-card rounded-xl px-4 py-2 max-w-[80%]">
                          <p className="text-xs text-muted-foreground text-center">{msg.text}</p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm flex-shrink-0">
                          {member?.avatar}
                        </div>
                      )}
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                        {!isMe && (
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-bold text-foreground">{member?.name}</p>
                            {msg.authorId === currentGroup.leaderId && (
                              <Crown className="w-3 h-3 text-primary" />
                            )}
                          </div>
                        )}
                        {replyTo && (
                          <div className="glass-card-inner rounded-lg px-3 py-1.5 mb-1 max-w-full">
                            <p className="text-[10px] text-muted-foreground">Replying to {getMember(replyTo.authorId!)?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{replyTo.text}</p>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isMe ? "bg-primary text-primary-foreground" : "glass-card-inner"
                          } relative`}
                          onClick={() => setShowReactionPicker(msg.id)}
                        >
                          <p className={`text-sm ${isMe ? "text-primary-foreground" : "text-foreground"}`}>{msg.text}</p>
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {Object.entries(msg.reactions).map(([emoji, count]) => (
                                <div
                                  key={emoji}
                                  className="glass-card rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                                >
                                  <span>{emoji}</span>
                                  <span className="text-[10px] font-bold">{count}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatTime(msg.createdAt)}</p>
                        
                        {showReactionPicker === msg.id && (
                          <div className="glass-card rounded-2xl p-2 flex gap-2 mt-2 animate-in scale-in duration-200">
                            {reactions.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => reactToMessage(msg.id, emoji)}
                                className="text-xl hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                setReplyingTo(msg);
                                setShowReactionPicker(null);
                              }}
                              className="glass-card-inner rounded-full p-2 hover:scale-110 transition-transform"
                            >
                              <Reply className="w-4 h-4 text-primary" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer - Fixed at Bottom of Sheet */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-background">
                {replyingTo && (
                  <div className="glass-card-inner rounded-xl px-3 py-2 mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Replying to {getMember(replyingTo.authorId!)?.name}</p>
                      <p className="text-xs text-foreground truncate max-w-[200px]">{replyingTo.text}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2 mb-2">
                  {quickChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setMessageText(chip)}
                      className="glass-card-inner rounded-full px-3 py-1 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowCalloutMenu(!showCalloutMenu)}
                      className="glass-card rounded-full p-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Zap className="w-5 h-5" />
                    </button>
                    {showCalloutMenu && (
                      <div className="absolute bottom-full mb-2 left-0 glass-card rounded-2xl p-2 space-y-1 animate-in scale-in duration-200 z-10">
                        <button
                          onClick={() => insertCallout("props")}
                          className="glass-card-inner rounded-xl px-3 py-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors w-full text-left"
                        >
                          🔥 Props
                        </button>
                        <button
                          onClick={() => insertCallout("nudge")}
                          className="glass-card-inner rounded-xl px-3 py-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors w-full text-left"
                        >
                          👀 Nudge
                        </button>
                        <button
                          onClick={() => insertCallout("flex")}
                          className="glass-card-inner rounded-xl px-3 py-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors w-full text-left"
                        >
                          💪 Flex
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="glass-card rounded-full p-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && messageText.trim() && sendMessage(messageText)}
                    placeholder="Type a message..."
                    className="flex-1 glass-card rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background/50"
                  />
                  <button
                    onClick={() => sendMessage(messageText)}
                    disabled={!messageText.trim()}
                    className="bg-primary rounded-full p-2 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Friend Modal */}
        {showAddFriendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50" onClick={() => setShowAddFriendModal(false)}>
            <div 
              className="glass-card rounded-3xl p-6 w-full max-w-md animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Add Friend</h2>
                <button
                  onClick={() => setShowAddFriendModal(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Username or Email</label>
                  <input
                    type="text"
                    placeholder="@username or email@example.com"
                    className="w-full glass-card-inner rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="pt-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Suggested Friends</h3>
                  <div className="space-y-2">
                    {[
                      { id: 1, name: "Alex Chen", username: "@alexc", avatar: "🟢", mutualFriends: 3 },
                      { id: 2, name: "Riley Park", username: "@rileyp", avatar: "🟣", mutualFriends: 5 },
                      { id: 3, name: "Jordan Lee", username: "@jordanl", avatar: "🟡", mutualFriends: 2 },
                    ].map((suggestion) => (
                      <div key={suggestion.id} className="glass-card-inner rounded-2xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{suggestion.avatar}</span>
                          <div>
                            <p className="font-bold text-sm text-foreground">{suggestion.name}</p>
                            <p className="text-xs text-muted-foreground">{suggestion.username} • {suggestion.mutualFriends} mutual</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            toast.success(`Friend request sent to ${suggestion.name}!`);
                            setShowAddFriendModal(false);
                          }}
                          className="bg-primary rounded-full px-4 py-1.5 text-xs font-bold text-primary-foreground hover:scale-105 transition-transform"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ChatTab = () => {
    const quickChips = ["GG", "Nice run!", "Catch me if you can 😎"];
    const reactions = ["👍", "👏", "😂", "🔥", "😴"];
    
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const filterProfanity = (text: string) => {
      const badWords = ["damn", "hell", "stupid", "idiot"]; // Basic filter
      let filtered = text;
      badWords.forEach(word => {
        const regex = new RegExp(word, "gi");
        filtered = filtered.replace(regex, "—");
      });
      return filtered;
    };
    
    const sendMessage = (text: string) => {
      const filtered = filterProfanity(text);
      const newMessage: Message = {
        id: Date.now().toString(),
        authorId: "1",
        kind: "user",
        text: filtered,
        createdAt: new Date().toISOString(),
        replyToId: replyingTo?.id,
      };
      setMessages([...messages, newMessage]);
      setMessageText("");
      setReplyingTo(null);
      toast.success("Message sent!");
    };
    
    const insertCallout = (kind: "props" | "nudge" | "flex") => {
      const member = currentGroup.members.find(m => m.id === "2");
      const stats = liveStats.perMember["2"];
      const templates = {
        props: `🔥 ${member?.name} is on a ${stats?.streak}-day streak — carrying the squad!`,
        nudge: `👀 ${member?.name} is ${Math.abs(stats?.pctBelowAvg || 0)}% below avg on Steps… time to step it up?`,
        flex: `💪 Group crushed Steps: ${liveStats.groupTotals?.steps} today! MVP: ${member?.name}.`,
      };
      setMessageText(templates[kind]);
      setShowCalloutMenu(false);
    };
    
    const reactToMessage = (messageId: string, emoji: string) => {
      setMessages(messages.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || {};
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...msg, reactions };
        }
        return msg;
      }));
      setShowReactionPicker(null);
      toast.success("Reaction added!");
    };
    
    const getMember = (id: string) => currentGroup.members.find(m => m.id === id);
    const formatTime = (iso: string) => {
      const date = new Date(iso);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return "just now";
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    };
    
    return (
      <div className="h-full flex flex-col">
        {/* Challenge Summary Header - Fixed */}
        <div className="flex-shrink-0 px-6 pt-4 pb-2 backdrop-blur-xl bg-background/80 border-b border-border">
          <h1 className="text-xl font-bold text-primary mb-3 italic">Analog</h1>
          <div className="glass-card rounded-2xl p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-muted-foreground">Challenge Active</p>
              </div>
              <p className="text-xs font-bold text-primary">{liveStats.timeLeft} left</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentGroup.members.map((member) => {
                const stats = liveStats.perMember[member.id];
                return (
                  <button
                    key={member.id}
                    className="glass-card-inner rounded-xl px-3 py-1.5 text-xs hover:scale-105 transition-transform"
                    onClick={() => toast.info(`${member.name}: ${stats?.steps || 0} steps, ${stats?.screen || 0}h screen`)}
                  >
                    <span className="mr-1">{member.avatar}</span>
                    <span className="font-semibold">{member.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Message List - Scrollable with extra bottom padding */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-3" 
          style={{ 
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '180px' // Composer (80px) + Nav (56px) + safe area (44px)
          }}
        >
          {messages.map((msg) => {
            const member = msg.authorId ? getMember(msg.authorId) : null;
            const isMe = msg.authorId === "1";
            const replyTo = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;
            
            if (msg.kind === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="glass-card rounded-xl px-4 py-2 max-w-[80%]">
                    <p className="text-xs text-muted-foreground text-center">{msg.text}</p>
                  </div>
                </div>
              );
            }
            
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm flex-shrink-0">
                    {member?.avatar}
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold text-foreground">{member?.name}</p>
                      {msg.authorId === currentGroup.leaderId && (
                        <Crown className="w-3 h-3 text-primary" />
                      )}
                    </div>
                  )}
                  {replyTo && (
                    <div className="glass-card-inner rounded-lg px-3 py-1.5 mb-1 max-w-full">
                      <p className="text-[10px] text-muted-foreground">Replying to {getMember(replyTo.authorId!)?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{replyTo.text}</p>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "glass-card-inner"
                    } relative`}
                    onClick={() => setShowReactionPicker(msg.id)}
                  >
                    <p className={`text-sm ${isMe ? "text-primary-foreground" : "text-foreground"}`}>{msg.text}</p>
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <div
                            key={emoji}
                            className="glass-card rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatTime(msg.createdAt)}</p>
                  
                  {/* Reaction Picker */}
                  {showReactionPicker === msg.id && (
                    <div className="glass-card rounded-2xl p-2 flex gap-2 mt-2 animate-in scale-in duration-200">
                      {reactions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => reactToMessage(msg.id, emoji)}
                          className="text-xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setReplyingTo(msg);
                          setShowReactionPicker(null);
                        }}
                        className="glass-card-inner rounded-full p-2 hover:scale-110 transition-transform"
                      >
                        <Reply className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Composer Bar - Fixed above bottom nav */}
        <div className="absolute bottom-[88px] left-0 right-0 px-6 py-3 backdrop-blur-xl bg-background/95 border-t border-border shadow-lg">
          {replyingTo && (
            <div className="glass-card rounded-xl p-2 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="w-3 h-3 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Replying to {getMember(replyingTo.authorId!)?.name}: "{replyingTo.text.slice(0, 30)}..."
                </p>
              </div>
              <button onClick={() => setReplyingTo(null)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
          
          {/* Quick Chips */}
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setMessageText(chip)}
                className="glass-card-inner rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap hover:scale-105 transition-transform"
              >
                {chip}
              </button>
            ))}
            <button
              onClick={() => setMessageText(`💪 Group crushed Steps: ${liveStats.groupTotals?.steps} today!`)}
              className="glass-card rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 hover:scale-105 transition-transform"
            >
              📊 Group Stats
            </button>
          </div>
          
          <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
            <button
              onClick={() => setShowCalloutMenu(!showCalloutMenu)}
              className="glass-card-inner rounded-full p-2 hover:scale-110 transition-transform relative"
            >
              <Zap className="w-5 h-5 text-primary" />
              {showCalloutMenu && (
                <div className="absolute bottom-full left-0 mb-2 glass-card rounded-xl p-2 space-y-1 min-w-[120px] animate-in fade-in scale-in duration-200">
                  <button
                    onClick={() => insertCallout("props")}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-semibold"
                  >
                    🔥 Props
                  </button>
                  <button
                    onClick={() => insertCallout("nudge")}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-semibold"
                  >
                    👀 Nudge
                  </button>
                  <button
                    onClick={() => insertCallout("flex")}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-semibold"
                  >
                    💪 Flex
                  </button>
                </div>
              )}
            </button>
            
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && messageText.trim() && sendMessage(messageText)}
              placeholder="Send a message..."
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
            
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="glass-card-inner rounded-full p-2 hover:scale-110 transition-transform"
            >
              <Smile className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={() => messageText.trim() && sendMessage(messageText)}
              disabled={!messageText.trim()}
              className="bg-primary rounded-full p-2 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const GroupTab = () => {
    const groups = [
      { name: "Friends", icon: "👥", members: 8 },
      { name: "Family", icon: "👨‍👩‍👧‍👦", members: 5 },
      { name: "Work", icon: "💼", members: 12 },
    ];

    // Mock leaderboard data for each group
    const groupLeaderboards: Record<string, Array<{ id: number; name: string; score: number; rank: number; avatar: string }>> = {
      "Friends": [
        { id: 1, name: "Jake H.", score: 85, rank: 1, avatar: "🟢" },
        { id: 2, name: "You", score: 76, rank: 2, avatar: "🔵" },
        { id: 3, name: "Sarah M.", score: 72, rank: 3, avatar: "🟣" },
        { id: 4, name: "Mike T.", score: 68, rank: 4, avatar: "🟠" },
        { id: 5, name: "Emma L.", score: 61, rank: 5, avatar: "🟡" },
      ],
      "Family": [
        { id: 1, name: "Mom", score: 92, rank: 1, avatar: "💐" },
        { id: 2, name: "You", score: 82, rank: 2, avatar: "🔵" },
        { id: 3, name: "Dad", score: 78, rank: 3, avatar: "👔" },
        { id: 4, name: "Sister", score: 70, rank: 4, avatar: "🌸" },
      ],
      "Work": [
        { id: 1, name: "Alex C.", score: 88, rank: 1, avatar: "💼" },
        { id: 2, name: "Jordan P.", score: 84, rank: 2, avatar: "📊" },
        { id: 3, name: "You", score: 71, rank: 3, avatar: "🔵" },
        { id: 4, name: "Taylor R.", score: 67, rank: 4, avatar: "💻" },
        { id: 5, name: "Morgan L.", score: 65, rank: 5, avatar: "📱" },
        { id: 6, name: "Casey M.", score: 59, rank: 6, avatar: "⌨️" },
      ],
    };

    const currentLeaderboard = groupLeaderboards[currentGroup.name] || groupLeaderboards["Friends"];

    const isLeader = currentGroup.leaderId === "1"; // Assuming user ID is "1"
    const leader = currentGroup.members.find(m => m.id === currentGroup.leaderId);
    const availableGoals = ["Screen Time", "Steps", "Energy", "Water Intake", "Sleep"];
    const currentGroupInfo = groups.find(g => g.name === currentGroup.name);
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);

    const handleGroupChange = (groupName: string) => {
      setSelectedGroup(groupName);
      setCurrentGroup(prev => ({ ...prev, name: groupName }));
      setShowGroupDropdown(false);
      toast.success(`Switched to ${groupName}`);
    };

    const handleNominateLeader = (memberId: string) => {
      setSelectedLeaderId(memberId);
      setShowLeaderModal(true);
    };

    const confirmLeader = () => {
      if (selectedLeaderId) {
        setCurrentGroup(prev => ({ ...prev, leaderId: selectedLeaderId }));
        const newLeader = currentGroup.members.find(m => m.id === selectedLeaderId);
        toast.success(`${newLeader?.name} is now the Group Leader!`);
        setShowLeaderModal(false);
        setSelectedLeaderId(null);
      }
    };

    const toggleGoal = (goal: string) => {
      if (!isLeader) return;
      setSelectedGoals(prev =>
        prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
      );
    };

    const handleSaveSettings = () => {
      if (!isLeader) return;
      setCurrentGroup(prev => ({
        ...prev,
        settings: {
          preset: timePreset !== "custom" ? timePreset : null,
          pool: { enabled: poolEnabled, amount: poolAmount, currency: poolCurrency },
          goals: selectedGoals,
        },
      }));
      toast.success("Challenge settings saved!");
    };

    const handleStartChallenge = () => {
      setShowStartModal(true);
    };

    const confirmStartChallenge = () => {
      const duration = timePreset === "1w" ? "1 Week" : timePreset === "2w" ? "2 Weeks" : "1 Month";
      toast.success(`Challenge started for ${currentGroup.name}!`);
      setShowStartModal(false);
    };

    return (
      <div className="h-full flex flex-col">
        {/* Group Selector Header - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-primary italic">Analog</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowGroupDropdown(!showGroupDropdown)}
              className="w-full glass-card rounded-[20px] p-4 flex items-center justify-between hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentGroupInfo?.icon}</span>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Current Challenge</p>
                  <p className="text-lg font-bold text-foreground">{currentGroup.name}</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-primary transition-transform ${showGroupDropdown ? "rotate-90" : ""}`} />
            </button>

            {/* Group Selector Dropdown */}
            {showGroupDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-[20px] p-3 space-y-2 z-50 animate-in fade-in duration-200">
                {groups.map((group) => (
                  <button
                    key={group.name}
                    onClick={() => handleGroupChange(group.name)}
                    className={`w-full rounded-[15px] p-3 flex items-center gap-3 transition-all hover:scale-[1.02] ${
                      currentGroup.name === group.name
                        ? "bg-primary/20 border-2 border-primary"
                        : "glass-card-inner"
                    }`}
                  >
                    <span className="text-2xl">{group.icon}</span>
                    <div className="text-left flex-1">
                      <p className="font-bold text-foreground">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.members} members</p>
                    </div>
                    {currentGroup.name === group.name && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
          <h1 className="text-2xl font-bold mb-6 text-foreground">Leader & Challenge Settings</h1>

          {/* Card 1: Start Challenge */}
          {isLeader && (
            <div className="glass-card rounded-2xl p-5 mb-4 relative overflow-hidden backdrop-blur-xl border border-white/20 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5" />
              <div className="relative">
                <button
                  onClick={handleStartChallenge}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:scale-[1.02] transition-all shadow-lg"
                >
                  Start Challenge
                </button>
              </div>
            </div>
          )}

          {/* Card 2: Challenge Settings */}
          <div className="glass-card rounded-2xl p-5 mb-4 relative overflow-hidden backdrop-blur-xl border border-white/20 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
            <div className="relative">
              <h2 className="text-lg font-bold text-foreground mb-4">Challenge Settings</h2>
              
              {!isLeader && (
                <div className="mb-3 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 text-center">
                  Only the leader can change these settings
                </div>
              )}

              {/* Time Limit */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Time Limit</label>
                <div className="flex gap-2">
                  {["1w", "2w", "1m"].map((preset) => (
                    <button
                      key={preset}
                      disabled={!isLeader}
                      onClick={() => setTimePreset(preset as any)}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                        timePreset === preset
                          ? "bg-primary text-white"
                          : "bg-muted/30 text-foreground hover:bg-muted/50"
                      } ${!isLeader ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {preset === "1w" ? "1 Week" : preset === "2w" ? "2 Weeks" : "1 Month"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Money Pool */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-foreground">Money Pool</label>
                  <button
                    disabled={!isLeader}
                    onClick={() => setPoolEnabled(!poolEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${
                      poolEnabled ? "bg-primary" : "bg-muted"
                    } ${!isLeader ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
                        poolEnabled ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                {poolEnabled && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      disabled={!isLeader}
                      value={poolAmount}
                      onChange={(e) => setPoolAmount(Number(e.target.value))}
                      className={`flex-1 px-3 py-2 rounded-xl bg-muted/30 text-foreground font-semibold ${
                        !isLeader ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="Amount"
                    />
                    <select
                      disabled={!isLeader}
                      value={poolCurrency}
                      onChange={(e) => setPoolCurrency(e.target.value as any)}
                      className={`px-3 py-2 rounded-xl bg-muted/30 text-foreground font-semibold ${
                        !isLeader ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Main Goals */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Main Goals</label>
                <div className="flex flex-wrap gap-2">
                  {availableGoals.map((goal) => (
                    <button
                      key={goal}
                      disabled={!isLeader}
                      onClick={() => toggleGoal(goal)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedGoals.includes(goal)
                          ? "bg-primary text-white"
                          : "bg-muted/30 text-foreground hover:bg-muted/50"
                      } ${!isLeader ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!isLeader}
                onClick={handleSaveSettings}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  isLeader
                    ? "bg-primary text-white hover:scale-[1.02]"
                    : "bg-muted/30 text-muted-foreground cursor-not-allowed"
                }`}
              >
                {isLeader ? "Save Settings" : "View Only (Leader can Save)"}
              </button>
            </div>
          </div>

          {/* Card 3: Leader Nomination */}
          <div className="glass-card rounded-2xl p-5 mb-4 relative overflow-hidden backdrop-blur-xl border border-white/20 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-foreground">Challenge Leader</h2>
              </div>
              
              <div className="space-y-2">
                {currentGroup.members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleNominateLeader(member.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      currentGroup.leaderId === member.id
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-2xl">{member.avatar}</span>
                    <span className="font-semibold text-foreground flex-1 text-left">{member.name}</span>
                    {currentGroup.leaderId === member.id && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard for Current Group */}
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl border border-white/20 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative">
              <h2 className="text-lg font-bold text-foreground mb-4">{currentGroup.name} Leaderboard</h2>
              <div className="space-y-3">
                {currentLeaderboard.map((person) => {
                  const getScoreColor = (score: number) => {
                    if (score >= 80) return "text-green-500";
                    if (score >= 60) return "text-yellow-500";
                    return "text-red-500";
                  };

                  return (
                    <div
                      key={person.id}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                        person.name === "You"
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-muted-foreground w-6">
                          #{person.rank}
                        </span>
                        <span className="text-3xl">{person.avatar}</span>
                        <span className={`font-bold ${
                          person.name === "You" ? "text-primary" : "text-foreground"
                        }`}>
                          {person.name}
                        </span>
                      </div>
                      <span className={`text-2xl font-bold ${getScoreColor(person.score)}`}>
                        {person.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Leader Nomination Modal */}
        {showLeaderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="glass-card rounded-2xl p-6 max-w-sm mx-4 border border-white/30">
              <h3 className="text-xl font-bold text-foreground mb-3">Nominate Leader</h3>
              <p className="text-foreground mb-6">
                Nominate {currentGroup.members.find(m => m.id === selectedLeaderId)?.name} as Group Leader? This gives them control of challenge settings.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaderModal(false)}
                  className="flex-1 py-3 rounded-xl bg-muted text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeader}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start Challenge Modal */}
        {showStartModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="glass-card rounded-2xl p-6 max-w-sm mx-4 border border-white/30">
              <h3 className="text-xl font-bold text-foreground mb-3">Start Challenge</h3>
              <p className="text-foreground mb-2">
                Start challenge for <span className="font-bold">{currentGroup.name}</span>?
              </p>
              <div className="text-sm text-muted-foreground mb-6 space-y-1">
                <p>• Duration: {timePreset === "1w" ? "1 Week" : timePreset === "2w" ? "2 Weeks" : "1 Month"}</p>
                <p>• Pool: {poolEnabled ? `$${poolAmount} ${poolCurrency}` : "None"}</p>
                <p>• Goals: {selectedGoals.join(", ")}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStartModal(false)}
                  className="flex-1 py-3 rounded-xl bg-muted text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartChallenge}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold"
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const StatsTab = () => {
    const totalMinutes = appUsageData.reduce((sum, app) => sum + app.minutes, 0);
    const currentGoal = screenTimeGoals[0];
    const currentUsage = currentGoal?.categories 
      ? categoryUsageData.filter(c => currentGoal.categories?.includes(c.category)).reduce((sum, c) => sum + c.minutes, 0)
      : totalMinutes;
    const progressPercent = currentGoal ? Math.min((currentUsage / currentGoal.limitMinutes) * 100, 100) : 0;
    
    const createOrUpdateGoal = () => {
      const newGoal: ScreenTimeGoal = {
        id: editingGoal?.id || Date.now().toString(),
        name: goalName || "Screen Time Goal",
        period: goalPeriod,
        limitMinutes: goalLimit,
        apps: selectedApps.length > 0 ? selectedApps : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      };
      
      if (editingGoal) {
        setScreenTimeGoals(goals => goals.map(g => g.id === editingGoal.id ? newGoal : g));
      } else {
        setScreenTimeGoals(goals => [...goals, newGoal]);
      }
      
      toast.success("Goal saved!");
      setShowGoalBuilder(false);
      resetGoalForm();
    };
    
    const resetGoalForm = () => {
      setGoalName("");
      setGoalPeriod("daily");
      setGoalLimit(90);
      setSelectedApps([]);
      setSelectedCategories([]);
      setEditingGoal(null);
    };
    
    const toggleApp = (appId: string) => {
      setSelectedApps(prev => 
        prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
      );
    };
    
    const toggleCategory = (category: string) => {
      setSelectedCategories(prev =>
        prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
      );
    };
    
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-8 pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
          <h1 className="text-xl font-bold text-primary mb-4 italic">Analog</h1>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">Your Stats</h2>
            <button
              onClick={() => setShowGoalBuilder(true)}
              className="glass-card rounded-xl px-4 py-2 text-sm font-semibold text-primary hover:scale-105 transition-transform"
            >
              + New Goal
            </button>
          </div>
          
          {/* Current Goal Progress */}
          {currentGoal && (
            <div className="glass-card rounded-2xl p-6 mb-6 relative overflow-hidden backdrop-blur-xl border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="relative">
                <h2 className="text-lg font-bold text-foreground mb-4">{currentGoal.name}</h2>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted/20"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#1E90FF"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56 * (progressPercent / 100)} ${2 * Math.PI * 56}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">{currentUsage}</p>
                        <p className="text-xs text-muted-foreground">of {currentGoal.limitMinutes} min</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {currentGoal.period === "daily" ? "Today" : "This Week"} • {currentGoal.categories?.join(", ") || "All Apps"}
                </p>
              </div>
            </div>
          )}

          {/* By App Breakdown */}
          <div className="glass-card rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              📱 By App
            </h3>
            <div className="space-y-3">
              {appUsageData.map((app) => {
                const percent = ((app.minutes / totalMinutes) * 100).toFixed(0);
                return (
                  <button
                    key={app.appId}
                    onClick={() => toast.info(`${app.name}: ${app.minutes} min today`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all"
                  >
                    <span className="text-2xl">{app.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">{app.name}</span>
                        <span className="text-sm font-bold text-foreground">{app.minutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{percent}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* By Category Breakdown */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              📊 By Category
            </h3>
            <div className="space-y-3">
              {categoryUsageData.map((cat) => {
                const catTotal = categoryUsageData.reduce((sum, c) => sum + c.minutes, 0);
                const percent = ((cat.minutes / catTotal) * 100).toFixed(0);
                return (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">{cat.category}</span>
                        <span className="text-sm font-bold text-foreground">{cat.minutes} min</span>
                      </div>
                      <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percent}%`,
                            backgroundColor: cat.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Goal Builder Modal */}
        {showGoalBuilder && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Screen Time Goal</h2>
                <button onClick={() => { setShowGoalBuilder(false); resetGoalForm(); }}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              {/* Goal Name */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Goal Name</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g., Daily Social Limit"
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Period */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Period</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGoalPeriod("daily")}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      goalPeriod === "daily" ? "bg-primary text-white" : "bg-muted/30 text-foreground"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setGoalPeriod("weekly")}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      goalPeriod === "weekly" ? "bg-primary text-white" : "bg-muted/30 text-foreground"
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
              
              {/* Target Minutes */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Target ({goalPeriod === "daily" ? "minutes/day" : "hours/week"})
                </label>
                <input
                  type="number"
                  value={goalLimit}
                  onChange={(e) => setGoalLimit(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Select Apps */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Apps (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {availableApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => toggleApp(app.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedApps.includes(app.id)
                          ? "bg-primary/20 border-2 border-primary text-primary"
                          : "bg-muted/30 text-foreground"
                      }`}
                    >
                      {app.icon} {app.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Select Categories */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-foreground mb-2 block">Categories (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedCategories.includes(cat)
                          ? "bg-primary/20 border-2 border-primary text-primary"
                          : "bg-muted/30 text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Save Button */}
              <button
                onClick={createOrUpdateGoal}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-transform"
              >
                Save Goal
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };


  const SettingsTab = ({ theme, setTheme }: { theme: string | undefined; setTheme: (theme: string) => void }) => (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-8 pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
        <h1 className="text-5xl font-bold text-primary mb-8 text-center italic">Analog</h1>
        
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1E90FF] to-[#4169E1] flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
            JD
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">John Doe</h2>
          <p className="text-sm text-muted-foreground mb-6">@johndoe</p>

          <div className="w-full max-w-sm space-y-4 mb-8">
            <div className="glass-card rounded-[20px] p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-semibold text-foreground">Jan 2025</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Total Challenges</span>
                <span className="text-sm font-semibold text-foreground">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Wins</span>
                <span className="text-sm font-semibold text-[#1E90FF]">5 🏆</span>
              </div>
            </div>

            <div className="glass-card rounded-[20px] p-5">
              <p className="text-sm text-muted-foreground mb-3">Achievements</p>
              <div className="flex gap-3">
                <div className="flex-1 text-center glass-card-inner rounded-[15px] p-4">
                  <span className="text-3xl mb-2 block">🔥</span>
                  <p className="text-xs text-muted-foreground">7 Day Streak</p>
                </div>
                <div className="flex-1 text-center glass-card-inner rounded-[15px] p-4">
                  <span className="text-3xl mb-2 block">⭐</span>
                  <p className="text-xs text-muted-foreground">First Win</p>
                </div>
                <div className="flex-1 text-center glass-card-inner rounded-[15px] p-4">
                  <span className="text-3xl mb-2 block">💎</span>
                  <p className="text-xs text-muted-foreground">Pro Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <h2 className="text-2xl font-bold text-foreground mb-6">Settings</h2>
        <div className="space-y-4">
        <div className="glass-card rounded-[20px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Appearance</p>
              <p className="text-sm text-muted-foreground mt-1">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </p>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-14 h-8 rounded-full bg-[#1E90FF] flex items-center transition-all p-1"
              style={{
                justifyContent: theme === "dark" ? "flex-end" : "flex-start",
              }}
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                {theme === "dark" ? (
                  <Moon className="w-3 h-3 text-[#1E90FF]" />
                ) : (
                  <Sun className="w-3 h-3 text-[#1E90FF]" />
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="glass-card rounded-[20px] p-5">
          <p className="font-semibold text-foreground mb-1">Notifications</p>
          <p className="text-sm text-muted-foreground">Push notifications enabled</p>
        </div>

        <div className="glass-card rounded-[20px] p-5">
          <p className="font-semibold text-foreground mb-1">Account</p>
          <p className="text-sm text-muted-foreground">johndoe@email.com</p>
        </div>

        <div className="glass-card rounded-[20px] p-5">
          <p className="font-semibold text-foreground mb-1">Privacy</p>
          <p className="text-sm text-muted-foreground">Manage your data and privacy</p>
        </div>

        <button className="w-full glass-card rounded-[20px] p-5 text-red-500 font-semibold hover:scale-[1.02] transition-transform">
          Sign Out
        </button>
      </div>
    </div>
  </div>
  );

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "group", label: "Challenge", icon: Users2 },
    { id: "friends", label: "Friends", icon: UserPlus },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div 
        className="w-full max-w-[430px] h-[932px] bg-background rounded-[60px] shadow-2xl overflow-hidden flex flex-col relative border-[14px] border-gray-800 dark:border-gray-900"
        style={{ transform: 'scale(0.70)', transformOrigin: 'center' }}
      >
        {/* Status Bar */}
        <div className="h-12 flex items-center justify-between px-8 text-xs font-semibold text-foreground bg-background">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span>📶</span>
            <span>📡</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Tab Content with fade transition */}
        <div className="flex-1 overflow-hidden relative">
          <div
            key={activeTab}
            className="h-full animate-in fade-in duration-300"
          >
            <TabContent />
          </div>
        </div>

        {/* Glassmorphic Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 px-4">
          <nav className="glass-nav rounded-[25px] px-4 py-3 flex justify-around items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                    isActive ? "scale-110" : "scale-100 opacity-60"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 transition-all ${
                      isActive ? "text-[#1E90FF]" : "text-foreground"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold transition-all ${
                      isActive ? "text-[#1E90FF]" : "text-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <style>{`
        .glass-card {
          background: rgba(var(--glass-bg));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(var(--glass-border));
          box-shadow: var(--glass-shadow);
        }

        .glass-card-inner {
          background: rgba(var(--glass-bg));
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .glass-nav {
          background: rgba(var(--glass-bg));
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(var(--glass-border));
          box-shadow: var(--glass-shadow);
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default IOSMockup;
