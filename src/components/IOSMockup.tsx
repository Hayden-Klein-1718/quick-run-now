import { useState, useRef, useEffect } from "react";
import { Home, MessageCircle, BarChart3, User, Settings, Moon, Sun, ChevronRight, Users2, Crown, Check, X, Calendar, Send, Zap, Smile, Reply, ThumbsUp, Laugh, Flame, Eye, UserPlus } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { ScoreRing } from "./ScoreRing";
import { useAppStore } from "@/state/store";
import { computeScore, scoreColor } from "@/utils/score";

const IOSMockup = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("friends");
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  
  // Get state and actions from store
  const {
    me,
    members,
    groups,
    myGroupIds,
    goals,
    usageToday,
    usageThisWeek,
    messagesByGroup,
    friendRequests,
    setLeader,
    updateGroupSettings,
    saveGoal,
    deleteGoal,
    sendMessage,
    addReaction,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    leaderboard,
    resetToDemo,
  } = useAppStore();

  const currentGroup = groups[selectedGroupId] || groups["friends"];
  const isLeader = currentGroup?.leaderId === me.id;
  
  // Local UI state
  const [showChatSheet, setShowChatSheet] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showGroupRankModal, setShowGroupRankModal] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  
  // Group settings state
  const [timePreset, setTimePreset] = useState<"1w" | "2w" | "1m">(currentGroup?.preset || "2w");
  const [poolEnabled, setPoolEnabled] = useState(currentGroup?.poolEnabled || false);
  const [poolAmount, setPoolAmount] = useState(currentGroup?.poolAmount || 0);
  const [poolCurrency, setPoolCurrency] = useState<"USD" | "EUR" | "GBP">(currentGroup?.poolCurrency || "USD");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(currentGroup?.selectedGoals || []);

  // Chat state
  const [messageText, setMessageText] = useState("");
  const [showCalloutMenu, setShowCalloutMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stats & goals state
  const [showGoalBuilder, setShowGoalBuilder] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalPeriod, setGoalPeriod] = useState<"daily" | "weekly">("daily");
  const [goalLimit, setGoalLimit] = useState(90);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Compute current score
  const currentGoal = goals[0];
  const totalUsedToday = usageToday.reduce((sum, u) => sum + u.minutes, 0);
  const limit = currentGoal ? currentGoal.limitMinutes : 120;
  const currentScore = computeScore(limit, totalUsedToday, me.streak);
  const scoreDelta = 8; // Simplified; would compute from previous day in real app

  const availableApps = usageToday.map(app => ({ id: app.appId, name: app.appName, icon: app.icon || "📱" }));
  const availableCategories = ["Social", "Entertainment", "Productivity", "Games", "News"];
  const availableGoalTypes = ["Screen Time", "Steps", "Energy", "Water Intake", "Sleep"];

  useEffect(() => {
    if (showChatSheet && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showChatSheet, messagesByGroup]);

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
    const leaderboardData = leaderboard(selectedGroupId, "today");
    const myRank = leaderboardData.find(l => l.memberId === me.id);

    return (
      <div className="h-full flex flex-col relative">
        <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary italic">Analog</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex items-center justify-center py-12">
            <ScoreRing score={currentScore} delta={scoreDelta} size={260} />
          </div>

          <button 
            onClick={() => setShowGroupRankModal(true)}
            className="glass-card rounded-3xl p-6 mb-6 text-center w-full hover:scale-[1.02] transition-transform min-h-[44px] min-w-[44px]"
          >
            <p className="text-sm text-muted-foreground mb-2">Your Rank vs {currentGroup?.name || "Friends"}</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-bold text-foreground">#{myRank?.rank || 1}</span>
              <span className="text-lg text-muted-foreground">of {leaderboardData.length}</span>
            </div>
            <p className="text-xs text-primary mt-2">Tap to view all groups</p>
          </button>

          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">{currentGroup?.name || "Friends"} Leaderboard</h3>
            <div className="space-y-3">
              {leaderboardData.map((person) => {
                const colors = scoreColor(person.score);
                const isMe = person.memberId === me.id;

                return (
                  <div
                    key={person.memberId}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                      isMe ? "glass-card-inner border-2 border-primary" : "glass-card-inner"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-muted-foreground w-6">
                        #{person.rank}
                      </span>
                      <span className="text-3xl">{person.avatar}</span>
                      <span className={`font-bold ${isMe ? "text-primary" : "text-foreground"}`}>
                        {person.name}
                      </span>
                    </div>
                    <span className={`text-2xl font-bold ${colors.text}`}>
                      {person.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Group Rank Modal (Floating Leaderboard) */}
        {showGroupRankModal && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowGroupRankModal(false)}>
            <div 
              className="w-full bg-background rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
              style={{ height: '70vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0 px-6 pt-4 pb-2 border-b border-border">
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Your Rankings</h2>
                  <button
                    onClick={() => setShowGroupRankModal(false)}
                    className="p-2 rounded-full hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                {myGroupIds.map((groupId) => {
                  const group = groups[groupId];
                  const groupLeaderboard = leaderboard(groupId, "today");
                  const myEntry = groupLeaderboard.find(l => l.memberId === me.id);
                  const colors = scoreColor(myEntry?.score || 0);

                  return (
                    <button 
                      key={groupId} 
                      onClick={() => {
                        setSelectedGroupId(groupId);
                        setShowGroupRankModal(false);
                        toast.success(`Viewing ${group?.name} leaderboard`);
                      }}
                      className={`glass-card rounded-3xl p-5 w-full hover:scale-[1.02] transition-transform ${
                        selectedGroupId === groupId ? "border-2 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-foreground">{group?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            #{myEntry?.rank || 1} of {groupLeaderboard.length}
                          </p>
                        </div>
                        <span className={`text-3xl font-bold ${colors.text}`}>
                          {myEntry?.score || 0}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${((myEntry?.rank || 1) / groupLeaderboard.length) * 100}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
                
                <button
                  onClick={() => {
                    setShowChatSheet(true);
                    setShowGroupRankModal(false);
                  }}
                  className="w-full mt-4 py-3 rounded-xl bg-primary text-white font-bold hover:scale-[1.02] transition-transform"
                >
                  Open Group Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const FriendsTab = () => {
    const leaderboardData = leaderboard(selectedGroupId, "today");

    const filterProfanity = (text: string) => {
      const badWords = ["damn", "hell", "stupid", "idiot"];
      let filtered = text;
      badWords.forEach(word => {
        const regex = new RegExp(word, "gi");
        filtered = filtered.replace(regex, "—");
      });
      return filtered;
    };

    const handleSendMessage = (text: string) => {
      const filtered = filterProfanity(text);
      sendMessage(selectedGroupId, filtered, replyingTo?.id);
      setMessageText("");
      setReplyingTo(null);
      toast.success("Message sent!");
    };

    const formatTime = (iso: string) => {
      const date = new Date(iso);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return "just now";
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    };

    const currentMessages = messagesByGroup[selectedGroupId] || [];

    return (
      <div className="h-full flex flex-col relative">
        <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary italic">Analog</h1>
            <button
              onClick={() => setShowAddFriendModal(true)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform min-h-[44px] min-w-[44px]"
              aria-label="Add Friend"
            >
              <UserPlus className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="py-6 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Friends Leaderboard</h2>
            
            {leaderboardData.map((person) => {
              const colors = scoreColor(person.score);
              const isMe = person.memberId === me.id;

              return (
                <div
                  key={person.memberId}
                  className={`glass-card rounded-3xl p-6 transition-all hover:scale-[1.02] ${
                    isMe ? "border-2 border-primary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        #{person.rank}
                      </span>
                      <span className="text-4xl">{person.avatar}</span>
                      <div>
                        <p className={`font-bold text-lg ${isMe ? "text-primary" : "text-foreground"}`}>
                          {person.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Streak: {members[person.memberId]?.streak || 0} days 🔥
                        </p>
                      </div>
                    </div>
                    <span className={`text-3xl font-bold ${colors.text}`}>
                      {person.score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Action Button (FAB) - Chat */}
        <button
          onClick={() => setShowChatSheet(true)}
          className="fixed bottom-28 right-8 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40 min-h-[44px] min-w-[44px]"
          style={{ bottom: 'calc(88px + env(safe-area-inset-bottom))' }}
          aria-label="Open chat"
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
              <div className="flex-shrink-0 px-6 pt-4 pb-2 border-b border-border">
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Group Chat</h2>
                  <button
                    onClick={() => setShowChatSheet(false)}
                    className="p-2 rounded-full hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
                    aria-label="Close chat"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </div>

              <div 
                className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-3"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: '140px'
                }}
              >
                {currentMessages.map((msg) => {
                  const member = msg.authorId ? members[msg.authorId] : null;
                  const isMe = msg.authorId === me.id;
                  const replyTo = msg.replyToId ? currentMessages.find(m => m.id === msg.replyToId) : null;
                  
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
                          {member?.avatarUrl}
                        </div>
                      )}
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                        {!isMe && (
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-bold text-foreground">{member?.name}</p>
                            {msg.authorId === currentGroup?.leaderId && (
                              <Crown className="w-3 h-3 text-primary" />
                            )}
                          </div>
                        )}
                        {replyTo && (
                          <div className="glass-card-inner rounded-lg px-3 py-1.5 mb-1 max-w-full">
                            <p className="text-[10px] text-muted-foreground">Replying to {members[replyTo.authorId!]?.name}</p>
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
                            {["👍", "👏", "😂", "🔥", "😴"].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  addReaction(selectedGroupId, msg.id, emoji);
                                  setShowReactionPicker(null);
                                  toast.success("Reaction added!");
                                }}
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
                              className="glass-card-inner rounded-full p-2 hover:scale-110 transition-transform min-h-[44px] min-w-[44px]"
                              aria-label="Reply to message"
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

              <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-background">
                {replyingTo && (
                  <div className="glass-card-inner rounded-xl px-3 py-2 mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Replying to {members[replyingTo.authorId!]?.name}</p>
                      <p className="text-xs text-foreground truncate max-w-[200px]">{replyingTo.text}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2 mb-2">
                  {["GG", "Nice run!", "Catch me if you can 😎"].map((chip) => (
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
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && messageText.trim() && handleSendMessage(messageText)}
                    placeholder="Type a message..."
                    className="flex-1 glass-card rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background/50"
                    aria-label="Message input"
                  />
                  <button
                    onClick={() => messageText.trim() && handleSendMessage(messageText)}
                    disabled={!messageText.trim()}
                    className="bg-primary rounded-full p-2 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
                    aria-label="Send message"
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
                  className="p-2 rounded-full hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
                  aria-label="Close"
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
                    aria-label="Search for friend"
                  />
                </div>
                
                <div className="pt-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Suggested Friends</h3>
                  <div className="space-y-2">
                    {Object.values(members).slice(5, 8).map((suggestion) => (
                      <div key={suggestion.id} className="glass-card-inner rounded-2xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{suggestion.avatarUrl}</span>
                          <div>
                            <p className="font-bold text-sm text-foreground">{suggestion.name}</p>
                            <p className="text-xs text-muted-foreground">Suggested friend</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            sendFriendRequest(suggestion.id);
                            toast.success(`Friend request sent to ${suggestion.name}!`);
                            setShowAddFriendModal(false);
                          }}
                          className="bg-primary text-white rounded-full px-4 py-2 text-xs font-bold hover:scale-105 transition-transform min-h-[44px]"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {friendRequests.filter(r => r.status === "pending" && r.toId === me.id).length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-bold text-foreground mb-3">Pending Requests</h3>
                    <div className="space-y-2">
                      {friendRequests
                        .filter(r => r.status === "pending" && r.toId === me.id)
                        .map((request) => {
                          const requester = members[request.fromId];
                          return (
                            <div key={request.id} className="glass-card-inner rounded-2xl p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{requester?.avatarUrl}</span>
                                <p className="font-bold text-sm text-foreground">{requester?.name}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    acceptFriendRequest(request.id);
                                    toast.success(`Accepted ${requester?.name}'s request!`);
                                  }}
                                  className="bg-primary text-white rounded-full px-3 py-1 text-xs font-bold hover:scale-105 transition-transform min-h-[44px]"
                                  aria-label="Accept request"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => {
                                    declineFriendRequest(request.id);
                                    toast.info("Request declined");
                                  }}
                                  className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-bold hover:scale-105 transition-transform min-h-[44px]"
                                  aria-label="Decline request"
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-foreground mb-3">Invite Link</h3>
                  <div className="glass-card-inner rounded-2xl p-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-mono">analog.app/invite/xyz123</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("analog.app/invite/xyz123");
                        toast.success("Link copied to clipboard!");
                      }}
                      className="text-primary text-xs font-bold hover:scale-105 transition-transform"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const GroupTab = () => {
    const groupLeaderboard = leaderboard(selectedGroupId, "today");

    const handleGroupChange = (groupId: string) => {
      setSelectedGroupId(groupId);
      setShowGroupSelector(false);
      toast.success(`Switched to ${groups[groupId]?.name}`);
    };

    const handleNominateLeader = (memberId: string) => {
      setSelectedLeaderId(memberId);
      setShowLeaderModal(true);
    };

    const confirmLeader = () => {
      if (selectedLeaderId) {
        setLeader(selectedGroupId, selectedLeaderId);
        const newLeader = members[selectedLeaderId];
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
      updateGroupSettings(selectedGroupId, {
        preset: timePreset,
        poolEnabled,
        poolAmount,
        poolCurrency,
        selectedGoals,
      });
      toast.success("Challenge settings saved!");
    };

    return (
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-primary italic">Analog</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowGroupSelector(!showGroupSelector)}
              className="w-full glass-card rounded-[20px] p-4 flex items-center justify-between hover:scale-[1.02] transition-transform"
              aria-label="Select group"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">👥</span>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Current Challenge</p>
                  <p className="text-lg font-bold text-foreground">{currentGroup?.name}</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-primary transition-transform ${showGroupSelector ? "rotate-90" : ""}`} />
            </button>

            {showGroupSelector && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-[20px] p-3 space-y-2 z-50 animate-in fade-in duration-200">
                {myGroupIds.map((groupId) => {
                  const group = groups[groupId];
                  return (
                    <button
                      key={groupId}
                      onClick={() => handleGroupChange(groupId)}
                      className={`w-full rounded-[15px] p-3 flex items-center gap-3 transition-all hover:scale-[1.02] ${
                        selectedGroupId === groupId
                          ? "bg-primary/20 border-2 border-primary"
                          : "glass-card-inner"
                      }`}
                    >
                      <span className="text-2xl">👥</span>
                      <div className="text-left flex-1">
                        <p className="font-bold text-foreground">{group?.name}</p>
                        <p className="text-xs text-muted-foreground">{group?.memberIds.length} members</p>
                      </div>
                      {selectedGroupId === groupId && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
          <h1 className="text-2xl font-bold mb-6 text-foreground">Leader & Challenge Settings</h1>

          {/* Start Challenge */}
          {isLeader && (
            <div className="glass-card rounded-2xl p-5 mb-4 relative overflow-hidden backdrop-blur-xl border border-white/20 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5" />
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStartModal(true);
                  }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:scale-[1.02] transition-all shadow-lg min-h-[44px]"
                >
                  Start Challenge
                </button>
              </div>
            </div>
          )}

          {/* Challenge Settings */}
          <div className="glass-card rounded-2xl p-5 mb-4 relative overflow-hidden backdrop-blur-xl border border-white/20 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
            <div className="relative">
              <h2 className="text-lg font-bold text-foreground mb-4">Challenge Settings</h2>
              
              {!isLeader && (
                <div className="mb-3 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 text-center">
                  Only the leader can change these settings
                </div>
              )}

              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Time Limit</label>
                <div className="flex gap-2">
                  {(["1w", "2w", "1m"] as const).map((preset) => (
                    <button
                      key={preset}
                      disabled={!isLeader}
                      onClick={() => setTimePreset(preset)}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                        timePreset === preset
                          ? "bg-primary text-white"
                          : "bg-muted/30 text-foreground hover:bg-muted/50"
                      } ${!isLeader ? "opacity-50 cursor-not-allowed" : ""}`}
                      aria-label={`Set time limit to ${preset === "1w" ? "1 Week" : preset === "2w" ? "2 Weeks" : "1 Month"}`}
                    >
                      {preset === "1w" ? "1 Week" : preset === "2w" ? "2 Weeks" : "1 Month"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-foreground">Money Pool</label>
                  <button
                    disabled={!isLeader}
                    onClick={() => setPoolEnabled(!poolEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${
                      poolEnabled ? "bg-primary" : "bg-muted"
                    } ${!isLeader ? "opacity-50 cursor-not-allowed" : ""}`}
                    aria-label={`Toggle money pool ${poolEnabled ? "off" : "on"}`}
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
                      aria-label="Pool amount"
                    />
                    <select
                      disabled={!isLeader}
                      value={poolCurrency}
                      onChange={(e) => setPoolCurrency(e.target.value as any)}
                      className={`px-3 py-2 rounded-xl bg-muted/30 text-foreground font-semibold ${
                        !isLeader ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      aria-label="Pool currency"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Main Goals</label>
                <div className="flex flex-wrap gap-2">
                  {availableGoalTypes.map((goal) => (
                    <button
                      key={goal}
                      disabled={!isLeader}
                      onClick={() => toggleGoal(goal)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedGoals.includes(goal)
                          ? "bg-primary text-white"
                          : "bg-muted/30 text-foreground hover:bg-muted/50"
                      } ${!isLeader ? "opacity-50 cursor-not-allowed" : ""}`}
                      aria-label={`Toggle ${goal}`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!isLeader}
                onClick={handleSaveSettings}
                className={`w-full py-3 rounded-xl font-bold transition-all min-h-[44px] ${
                  isLeader
                    ? "bg-primary text-white hover:scale-[1.02]"
                    : "bg-muted/30 text-muted-foreground cursor-not-allowed"
                }`}
              >
                {isLeader ? "Save Settings" : "View Only (Leader can Save)"}
              </button>
            </div>
          </div>

          {/* Leader Nomination */}
          <div className="glass-card rounded-2xl p-5 mb-4 relative overflow-hidden backdrop-blur-xl border border-white/20 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-foreground">Challenge Leader</h2>
              </div>
              
              <div className="space-y-2">
                {currentGroup?.memberIds.map((memberId) => {
                  const member = members[memberId];
                  return (
                    <button
                      key={memberId}
                      onClick={() => handleNominateLeader(memberId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all min-h-[44px] ${
                        currentGroup?.leaderId === memberId
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                      aria-label={`Nominate ${member?.name} as leader`}
                    >
                      <span className="text-2xl">{member?.avatarUrl}</span>
                      <span className="font-semibold text-foreground flex-1 text-left">{member?.name}</span>
                      {currentGroup?.leaderId === memberId && (
                        <Crown className="w-5 h-5 text-yellow-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-lg font-bold text-foreground mb-4">Current Leaderboard</h3>
            <div className="space-y-2">
              {groupLeaderboard.map((person) => {
                const colors = scoreColor(person.score);
                const isMe = person.memberId === me.id;

                return (
                  <div
                    key={person.memberId}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      isMe ? "bg-primary/10 border border-primary" : "glass-card-inner"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        #{person.rank}
                      </span>
                      <span className="text-2xl">{person.avatar}</span>
                      <span className={`font-semibold ${isMe ? "text-primary" : "text-foreground"}`}>
                        {person.name}
                      </span>
                    </div>
                    <span className={`text-xl font-bold ${colors.text}`}>
                      {person.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Leader Confirmation Modal */}
        {showLeaderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50" onClick={() => setShowLeaderModal(false)}>
            <div 
              className="glass-card rounded-3xl p-6 w-full max-w-sm animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-foreground mb-4">Confirm Leader</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Make {members[selectedLeaderId!]?.name} the new group leader?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaderModal(false)}
                  className="flex-1 py-3 rounded-xl bg-muted text-foreground font-bold hover:scale-105 transition-transform min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeader}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-transform min-h-[44px]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start Challenge Modal */}
        {showStartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50" onClick={() => setShowStartModal(false)}>
            <div 
              className="glass-card rounded-3xl p-6 w-full max-w-sm animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-foreground mb-4">Start Challenge</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Start the challenge for {currentGroup?.name}? Duration: {timePreset === "1w" ? "1 Week" : timePreset === "2w" ? "2 Weeks" : "1 Month"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStartModal(false)}
                  className="flex-1 py-3 rounded-xl bg-muted text-foreground font-bold hover:scale-105 transition-transform min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success(`Challenge started for ${currentGroup?.name}!`);
                    setShowStartModal(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-transform min-h-[44px]"
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
    const totalMinutes = usageToday.reduce((sum, app) => sum + app.minutes, 0);
    const progressPercent = currentGoal ? Math.min(100, (totalMinutes / currentGoal.limitMinutes) * 100) : 0;

    const categoryUsageData = usageToday.reduce((acc, app) => {
      const existing = acc.find(c => c.category === app.category);
      if (existing) {
        existing.minutes += app.minutes;
      } else {
        acc.push({ 
          category: app.category, 
          minutes: app.minutes,
          color: app.category === "Social" ? "#FF6B9D" : app.category === "Entertainment" ? "#4ECDC4" : "#95E1D3"
        });
      }
      return acc;
    }, [] as Array<{ category: string; minutes: number; color: string }>);

    const resetGoalForm = () => {
      setGoalName("");
      setGoalPeriod("daily");
      setGoalLimit(90);
      setSelectedApps([]);
      setSelectedCategories([]);
      setEditingGoal(null);
    };

    const createOrUpdateGoal = () => {
      if (!goalName.trim()) {
        toast.error("Please enter a goal name");
        return;
      }
      
      const newGoal = {
        id: editingGoal?.id || Date.now().toString(),
        name: goalName,
        period: goalPeriod,
        limitMinutes: goalLimit,
        apps: selectedApps.length > 0 ? selectedApps : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      };
      
      saveGoal(newGoal);
      toast.success("Goal saved!");
      setShowGoalBuilder(false);
      resetGoalForm();
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
              className="glass-card rounded-xl px-4 py-2 text-sm font-semibold text-primary hover:scale-105 transition-transform min-h-[44px]"
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
                        <p className="text-3xl font-bold text-foreground">{totalMinutes}</p>
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
              {usageToday.map((app) => {
                const percent = totalMinutes > 0 ? ((app.minutes / totalMinutes) * 100).toFixed(0) : 0;
                return (
                  <button
                    key={app.appId}
                    onClick={() => toast.info(`${app.appName}: ${app.minutes} min today`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all min-h-[44px]"
                  >
                    <span className="text-2xl">{app.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">{app.appName}</span>
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
                const percent = catTotal > 0 ? ((cat.minutes / catTotal) * 100).toFixed(0) : 0;
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
                <button onClick={() => { setShowGoalBuilder(false); resetGoalForm(); }} className="min-h-[44px] min-w-[44px]" aria-label="Close">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Goal Name</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g., Daily Social Limit"
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Goal name"
                />
              </div>
              
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Period</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGoalPeriod("daily")}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all min-h-[44px] ${
                      goalPeriod === "daily" ? "bg-primary text-white" : "bg-muted/30 text-foreground"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setGoalPeriod("weekly")}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all min-h-[44px] ${
                      goalPeriod === "weekly" ? "bg-primary text-white" : "bg-muted/30 text-foreground"
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Target ({goalPeriod === "daily" ? "minutes/day" : "hours/week"})
                </label>
                <input
                  type="number"
                  value={goalLimit}
                  onChange={(e) => setGoalLimit(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Goal limit"
                />
              </div>
              
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
                      aria-label={`Toggle ${app.name}`}
                    >
                      {app.icon} {app.name}
                    </button>
                  ))}
                </div>
              </div>
              
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
                      aria-label={`Toggle ${cat} category`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={createOrUpdateGoal}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-transform min-h-[44px]"
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
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1E90FF] to-[#4169E1] flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
            {me.name.substring(0, 2).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{me.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">@{me.name.toLowerCase().replace(" ", "")}</p>

          <div className="w-full max-w-sm space-y-4 mb-8">
            <div className="glass-card rounded-[20px] p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Current Streak</span>
                <span className="text-sm font-semibold text-foreground">{me.streak} days 🔥</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Active Challenges</span>
                <span className="text-sm font-semibold text-foreground">{myGroupIds.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Score Today</span>
                <span className={`text-sm font-semibold ${scoreColor(currentScore).text}`}>{currentScore}</span>
              </div>
            </div>
          </div>
        </div>

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
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
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

            <button
              onClick={() => {
                resetToDemo();
                toast.success("Reset to demo data!");
              }}
              className="w-full glass-card rounded-[20px] p-5 text-primary font-semibold hover:scale-[1.02] transition-transform text-left"
            >
              <p className="font-semibold">Reset to Demo Data</p>
              <p className="text-sm text-muted-foreground mt-1">Restore original demo content</p>
            </button>

            <div className="glass-card rounded-[20px] p-5">
              <p className="font-semibold text-foreground mb-1">Notifications</p>
              <p className="text-sm text-muted-foreground">Push notifications enabled</p>
            </div>

            <div className="glass-card rounded-[20px] p-5">
              <p className="font-semibold text-foreground mb-1">Account</p>
              <p className="text-sm text-muted-foreground">{me.name.toLowerCase()}@email.com</p>
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
      <div className="w-full max-w-md h-[844px] bg-background rounded-[60px] shadow-2xl overflow-hidden relative border-[14px] border-background"
        style={{
          boxShadow: '0 0 0 3px #1a1a1a, 0 20px 60px rgba(0,0,0,0.5)',
        }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-background rounded-b-3xl z-50" />
        
        <div className="h-full flex flex-col bg-background">
          <div className="flex-1 relative">
            <TabContent />
          </div>
          
          {/* Bottom Navigation */}
          <nav 
            className="flex-shrink-0 glass-nav border-t border-border/50"
            style={{ 
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="flex justify-around items-center px-4 py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-h-[44px] min-w-[44px] ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                    aria-label={tab.label}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""}`} />
                    <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default IOSMockup;
