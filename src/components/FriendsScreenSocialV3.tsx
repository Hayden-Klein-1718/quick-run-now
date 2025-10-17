import { useState } from "react";
import { Search, Plus, Send, X, TrendingUp, Trophy, Flame, Dices, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { toast } from "@/hooks/use-toast";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  lifetimeWinnings: number;
  avgScreenTime: string;
  sparkline: number[];
}

interface Activity {
  id: string;
  type: "win" | "streak" | "join" | "taunt";
  friendName: string;
  description: string;
  timeAgo: string;
}

interface ChatThread {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  lastMessage: string;
  unread: number;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface FriendsScreenSocialV3Props {
  friends?: Friend[];
  activity?: Activity[];
  chats?: ChatThread[];
  messagesByThread?: Record<string, Message[]>;
  onNudge?: (payload: any) => void;
  onOpenChat?: (thread: ChatThread) => void;
  onChallengeCreate?: (payload: any) => void;
  onAddFriend?: (user: any) => void;
  onSendMessage?: (threadId: string, text: string) => void;
}

const mockFriends: Friend[] = [
  { id: "1", name: "Maya", avatar: "👩‍🎨", lifetimeWinnings: 250, avgScreenTime: "2h 15m", sparkline: [3, 2.5, 2, 1.8, 2.2, 1.5, 1.8] },
  { id: "2", name: "Jules", avatar: "👨‍💻", lifetimeWinnings: 180, avgScreenTime: "1h 45m", sparkline: [2.5, 2.2, 2, 1.5, 1.2, 1, 0.8] },
  { id: "3", name: "Diego", avatar: "🧑‍🎤", lifetimeWinnings: 320, avgScreenTime: "3h 10m", sparkline: [4, 3.8, 3.5, 3.2, 3, 2.8, 3.1] },
];

const mockActivity: Activity[] = [
  { id: "1", type: "win", friendName: "Maya", description: "won Weekend Detox ($20)", timeAgo: "3h ago" },
  { id: "2", type: "streak", friendName: "Jules", description: "hit a 7-day low-time streak", timeAgo: "5h ago" },
  { id: "3", type: "join", friendName: "Diego", description: "joined Daily 2h Cap", timeAgo: "1d ago" },
  { id: "4", type: "taunt", friendName: "Maya", description: "sent a taunt", timeAgo: "2d ago" },
];

const mockChats: ChatThread[] = [
  { id: "c1", friendId: "1", friendName: "Maya", friendAvatar: "👩‍🎨", lastMessage: "Let's do the weekend challenge!", unread: 2 },
  { id: "c2", friendId: "2", friendName: "Jules", friendAvatar: "👨‍💻", lastMessage: "Nice streak today!", unread: 0 },
];

const mockMessages: Record<string, Message[]> = {
  c1: [
    { id: "m1", senderId: "1", text: "Hey! How's your screen time today?", timestamp: "10:30 AM" },
    { id: "m2", senderId: "me", text: "Pretty good, staying under 2h!", timestamp: "10:32 AM" },
    { id: "m3", senderId: "1", text: "Let's do the weekend challenge!", timestamp: "10:35 AM" },
  ],
  c2: [
    { id: "m4", senderId: "2", text: "Nice streak today!", timestamp: "Yesterday" },
  ],
};

const activityIcons = {
  win: <Trophy className="w-4 h-4 text-yellow-500" />,
  streak: <Flame className="w-4 h-4 text-orange-500" />,
  join: <Dices className="w-4 h-4 text-blue-500" />,
  taunt: <MessageCircle className="w-4 h-4 text-purple-500" />,
};

const challengePresets = [
  { id: "1v1-weekend", name: "1v1 for the Weekend", description: "Lowest total screen time Fri–Sun wins" },
  { id: "weekday-detox", name: "Weekday Detox (Mon–Fri)", description: "Keep average under 2h/day" },
  { id: "daily-2h", name: "Daily 2h Cap (tomorrow)", description: "Pass 120 minutes and you lose" },
  { id: "no-social", name: "No Social 6–9pm", description: "No social apps during 6–9 PM" },
  { id: "custom", name: "Create Custom Challenge…", description: "Set your own rules" },
];

const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 20 - (val / max) * 15;
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg width="60" height="20" className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary"
      />
    </svg>
  );
};

export function FriendsScreenSocialV3({
  friends = mockFriends,
  activity = mockActivity,
  chats = mockChats,
  messagesByThread = mockMessages,
  onNudge = (payload) => console.log("Nudge:", payload),
  onOpenChat = (thread) => console.log("Open chat:", thread),
  onChallengeCreate = (payload) => console.log("Challenge:", payload),
  onAddFriend = (user) => console.log("Add friend:", user),
  onSendMessage = (threadId, text) => console.log("Send:", threadId, text),
}: FriendsScreenSocialV3Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [challengeStep, setChallengeStep] = useState<"select-friends" | "choose-challenge">("select-friends");
  const [activeChatThread, setActiveChatThread] = useState<ChatThread | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const discoverable = [
    { id: "d1", name: "Alex", avatar: "🧑‍🚀" },
    { id: "d2", name: "Sam", avatar: "👨‍🔬" },
  ];

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNudge = (friendId: string, type: string) => {
    const friend = friends.find((f) => f.id === friendId);
    onNudge({ friendId, type });
    toast({ title: `Sent ${type} to ${friend?.name}!` });
  };

  const handleStartChallenge = (challengeId: string) => {
    onChallengeCreate({ friends: selectedFriends, challenge: challengeId });
    toast({ title: "Challenge created!" });
    setShowChallengeModal(false);
    setSelectedFriends([]);
    setChallengeStep("select-friends");
  };

  const handleSendMessage = () => {
    if (!activeChatThread || !messageInput.trim()) return;
    onSendMessage(activeChatThread.id, messageInput);
    setMessageInput("");
    toast({ title: "Message sent!" });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Search & Discover */}
      <div className="glass-card rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Discover</p>
            {discoverable.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{user.avatar}</span>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onAddFriend(user);
                    toast({ title: `Added ${user.name}!` });
                  }}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {activity.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-2 bg-secondary/20 rounded-lg">
              <div className="mt-1">{activityIcons[item.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{item.friendName}</span> {item.description}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.timeAgo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chats Section */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Chats</h3>
        <div className="space-y-2">
          {chats.map((thread) => (
            <div
              key={thread.id}
              onClick={() => {
                setActiveChatThread(thread);
                onOpenChat(thread);
              }}
              className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors"
            >
              <span className="text-2xl">{thread.friendAvatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{thread.friendName}</p>
                <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
              </div>
              {thread.unread > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {thread.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Friends List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold px-1">Friends</h3>
        {filteredFriends.map((friend) => (
          <div key={friend.id} className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{friend.avatar}</span>
              <div className="flex-1">
                <p className="font-semibold">{friend.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>💰 ${friend.lifetimeWinnings}</span>
                  <span>📱 {friend.avgScreenTime}</span>
                  <Sparkline data={friend.sparkline} />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={() => handleNudge(friend.id, "cheer")}
              >
                💪
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={() => handleNudge(friend.id, "watch")}
              >
                👀
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={() => handleNudge(friend.id, "taunt")}
              >
                😈
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={() => handleNudge(friend.id, "zen")}
              >
                🧘
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                const thread = chats.find((c) => c.friendId === friend.id);
                if (thread) {
                  setActiveChatThread(thread);
                  onOpenChat(thread);
                }
              }}
            >
              Open Thread
            </Button>
          </div>
        ))}
      </div>

      {/* FAB */}
      <Button
        size="icon"
        className="fixed top-6 right-6 w-14 h-14 rounded-full shadow-lg z-50"
        onClick={() => setShowChallengeModal(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Challenge Modal */}
      <Dialog open={showChallengeModal} onOpenChange={setShowChallengeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {challengeStep === "select-friends" ? "Select Friends" : "Choose Challenge"}
            </DialogTitle>
          </DialogHeader>

          {challengeStep === "select-friends" ? (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => {
                    setSelectedFriends((prev) =>
                      prev.includes(friend.id)
                        ? prev.filter((id) => id !== friend.id)
                        : [...prev, friend.id]
                    );
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFriends.includes(friend.id)
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-secondary/20 border-2 border-transparent"
                  }`}
                >
                  <span className="text-2xl">{friend.avatar}</span>
                  <span className="font-medium">{friend.name}</span>
                </div>
              ))}
              <Button
                className="w-full"
                disabled={selectedFriends.length === 0}
                onClick={() => setChallengeStep("choose-challenge")}
              >
                Next
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {challengePresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleStartChallenge(preset.id)}
                  className="p-3 bg-secondary/20 rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors"
                >
                  <p className="font-medium text-sm">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </div>
              ))}
              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={() => {
                  setChallengeStep("select-friends");
                  setSelectedFriends([]);
                }}
              >
                Back
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Drawer */}
      <Drawer open={!!activeChatThread} onOpenChange={(open) => !open && setActiveChatThread(null)}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2">
                <span className="text-2xl">{activeChatThread?.friendAvatar}</span>
                {activeChatThread?.friendName}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeChatThread &&
              messagesByThread[activeChatThread.id]?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.senderId === "me"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
          </div>

          <div className="border-t p-4 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
