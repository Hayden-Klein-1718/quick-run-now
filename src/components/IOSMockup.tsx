import { useState } from "react";
import { MessageCircle, Users, Target, Home, BarChart3, User, ChevronRight, Zap, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const IOSMockup = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [showFriendDetail, setShowFriendDetail] = useState(null);
  const [selectedPool, setSelectedPool] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  
  // Each pool has its own tracked apps
  const [poolTrackedApps, setPoolTrackedApps] = useState({
    0: ["Instagram", "TikTok", "Twitter", "YouTube", "Reddit"], // The Squad
    1: ["Facebook", "Instagram", "YouTube"] // Family Challenge
  });

  // Get current pool's tracked apps
  const trackedApps = poolTrackedApps[selectedPool] || [];

  const toggleApp = (appName) => {
    const currentApps = poolTrackedApps[selectedPool] || [];
    if (currentApps.includes(appName)) {
      setPoolTrackedApps({
        ...poolTrackedApps,
        [selectedPool]: currentApps.filter(a => a !== appName)
      });
    } else {
      setPoolTrackedApps({
        ...poolTrackedApps,
        [selectedPool]: [...currentApps, appName]
      });
    }
  };

  const allAvailableApps = [
    { name: "Instagram", icon: "📸", category: "Social" },
    { name: "TikTok", icon: "🎵", category: "Social" },
    { name: "Twitter", icon: "🐦", category: "Social" },
    { name: "YouTube", icon: "▶️", category: "Entertainment" },
    { name: "Reddit", icon: "🤖", category: "Social" },
    { name: "Snapchat", icon: "👻", category: "Social" },
    { name: "Facebook", icon: "👍", category: "Social" },
    { name: "Netflix", icon: "🎬", category: "Entertainment" }
  ];

  const pools = [
    {
      id: 0,
      name: "The Squad 💪",
      buyIn: 50,
      totalPot: 250,
      participants: 5,
      daysLeft: 3,
      yourRank: 2,
      yourTime: 18.5,
      leaderboard: [
        { 
          id: 1, name: "Jake H.", time: 15.2, rank: 1, isWinning: true, improvement: -30, streak: 5,
          sharingApps: true,
          apps: [
            { name: "Twitter", time: 5.1, icon: "🐦" },
            { name: "YouTube", time: 4.2, icon: "▶️" },
            { name: "Instagram", time: 3.8, icon: "📸" },
            { name: "Reddit", time: 2.1, icon: "🤖" }
          ]
        },
        { 
          id: 2, name: "Andrew B.", time: 22.7, rank: 3, improvement: 17, streak: 0,
          sharingApps: true,
          apps: [
            { name: "TikTok", time: 9.2, icon: "🎵" },
            { name: "Instagram", time: 7.1, icon: "📸" },
            { name: "YouTube", time: 4.3, icon: "▶️" },
            { name: "Twitter", time: 2.1, icon: "🐦" }
          ]
        },
        { id: 3, name: "Ethan S.", time: 28.3, rank: 4, improvement: -6, streak: 1, sharingApps: false },
        { 
          id: 4, name: "Ben E.", time: 31.5, rank: 5, improvement: 9, streak: 0,
          sharingApps: true,
          apps: [
            { name: "Instagram", time: 12.1, icon: "📸" },
            { name: "TikTok", time: 8.4, icon: "🎵" },
            { name: "YouTube", time: 6.2, icon: "▶️" }
          ]
        }
      ]
    },
    {
      id: 1,
      name: "Family Challenge 👨‍👩‍👧‍👦",
      buyIn: 0,
      totalPot: 0,
      participants: 4,
      daysLeft: 3,
      yourRank: 1,
      yourTime: 18.5,
      leaderboard: [
        { id: 1, name: "Mom", time: 22.3, rank: 2, improvement: -12, streak: 2, sharingApps: false },
        { id: 2, name: "Dad", time: 25.8, rank: 3, improvement: 5, streak: 0, sharingApps: false },
        { id: 3, name: "Sarah", time: 31.2, rank: 4, improvement: -8, streak: 1, sharingApps: false }
      ]
    }
  ];

  const currentPool = pools[selectedPool];

  const mockUserData = {
    totalScreenTime: 18.5,
    apps: [
      { name: "Instagram", time: 6.2, icon: "📸" },
      { name: "TikTok", time: 4.8, icon: "🎵" },
      { name: "Twitter", time: 3.1, icon: "🐦" },
      { name: "YouTube", time: 2.4, icon: "▶️" },
      { name: "Reddit", time: 2.0, icon: "🤖" }
    ]
  };

  const SplashScreen = () => {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="relative z-10 text-center px-6">
          <div className="mb-12">
            <div className="w-40 h-40 mx-auto bg-white/10 backdrop-blur-sm rounded-[50px] flex items-center justify-center shadow-2xl">
              <span className="text-8xl">📱</span>
            </div>
          </div>

          <h1 className="text-8xl font-black text-white mb-6 tracking-tight">
            LEUTH
          </h1>
          
          <p className="text-xl text-white/80 font-medium mb-16 max-w-xs mx-auto">
            Compete. Reduce. Win.
          </p>

          <button
            onClick={() => setShowSplash(false)}
            className="bg-white text-purple-600 px-16 py-6 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-transform"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  };

  const HomeScreen = () => {
    const winner = currentPool.leaderboard.find(f => f.isWinning);
    const timeBehind = winner ? (currentPool.yourTime - winner.time).toFixed(1) : 0;
    
    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="flex justify-between items-center px-6 pt-3 pb-2 text-xs">
          <span className="font-semibold">9:41</span>
          <span>📶 🔋</span>
        </div>

        <div className="px-6 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Your Pools</h1>
              <p className="text-gray-500 text-sm mt-1">{pools.length} active</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {pools.map((pool, idx) => (
              <button
                key={pool.id}
                onClick={() => setSelectedPool(idx)}
                className={`min-w-[280px] rounded-3xl p-4 shadow-md transition-all ${
                  selectedPool === idx
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white scale-105'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <div className="text-left mb-3">
                  <p className="font-bold text-lg">{pool.name}</p>
                  <p className={`text-sm ${selectedPool === idx ? 'text-white/80' : 'text-gray-500'}`}>
                    {pool.participants} players • {pool.daysLeft} days left
                  </p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className={`text-xs ${selectedPool === idx ? 'text-white/70' : 'text-gray-400'}`}>
                      {pool.buyIn > 0 ? 'Total Pot' : 'For Fun'}
                    </p>
                    <p className="text-2xl font-bold">
                      {pool.buyIn > 0 ? `$${pool.totalPot}` : '🏆'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${selectedPool === idx ? 'text-white/70' : 'text-gray-400'}`}>
                      Your Rank
                    </p>
                    <p className="text-2xl font-bold">#{pool.yourRank}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-4">
          <h2 className="text-xl font-bold mb-3">{currentPool.name}</h2>

          {currentPool.buyIn > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <p className="text-sm font-semibold text-green-900">
                ${currentPool.buyIn} buy-in • Win ${currentPool.totalPot}!
              </p>
            </div>
          )}

          {currentPool.buyIn === 0 && (
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-4">
              <p className="text-sm font-semibold text-pink-900">
                Friendly competition • No money!
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => setShowDetailedStats(true)}
              className="w-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                    {currentPool.yourRank}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xl text-white">You</p>
                    <p className="text-sm text-white/80">
                      {currentPool.yourRank === 1 ? '🎉 Winning!' : `${timeBehind}h behind`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{currentPool.yourTime}h</p>
                  <p className="text-sm text-green-300 font-semibold">↓ 24%</p>
                </div>
              </div>
              <div className="flex gap-2">
                {mockUserData.apps.slice(0, 3).map((app, idx) => (
                  <div key={idx} className="flex-1 bg-white/10 rounded-xl p-2 text-center">
                    <p className="text-xl mb-0.5">{app.icon}</p>
                    <p className="text-[10px] text-white/70 truncate">{app.name}</p>
                    <p className="text-xs font-bold text-white">{app.time}h</p>
                  </div>
                ))}
              </div>
            </button>

            {currentPool.leaderboard.map((friend) => (
              <button
                key={friend.id}
                onClick={() => setShowFriendDetail(friend)}
                className={`w-full rounded-3xl p-5 shadow-lg ${
                  friend.isWinning
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : 'bg-white border-2 border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
                      friend.isWinning ? 'bg-white/20 text-white text-3xl' : 'bg-gray-100'
                    }`}>
                      {friend.isWinning ? '👑' : friend.rank}
                    </div>
                    <div className="text-left">
                      <p className={`font-bold text-lg ${friend.isWinning ? 'text-white' : ''}`}>
                        {friend.name}
                        {friend.streak >= 3 && <span className="text-xs ml-2">🔥{friend.streak}</span>}
                      </p>
                      <p className={`text-sm ${friend.isWinning ? 'text-white/90' : 'text-gray-500'}`}>
                        {friend.isWinning 
                          ? (currentPool.buyIn > 0 ? `Winning $${currentPool.totalPot}!` : '#1!')
                          : `Rank #${friend.rank}`}
                      </p>
                      {friend.sharingApps && friend.apps && (
                        <div className="flex gap-1 mt-1">
                          {friend.apps.slice(0, 3).map((app, idx) => (
                            <span key={idx} className={`text-xs ${friend.isWinning ? 'opacity-80' : 'opacity-60'}`}>
                              {app.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${friend.isWinning ? 'text-white' : ''}`}>
                        {friend.time}h
                      </p>
                      <p className={`text-sm font-semibold ${
                        friend.isWinning ? 'text-green-200' : 
                        friend.improvement < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {friend.improvement < 0 ? '↓' : '↑'} {Math.abs(friend.improvement)}%
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${friend.isWinning ? 'text-white/60' : 'text-gray-400'}`} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-purple-600 text-white rounded-xl py-6">
              <Zap className="w-4 h-4 mr-2" />
              Update Time
            </Button>
            <Button variant="outline" className="rounded-xl py-6" onClick={() => setActiveTab("chat")}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ChatScreen = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-xs">
        <span className="font-semibold">9:41</span>
        <span>📶 🔋</span>
      </div>
      
      <div className="px-6 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{currentPool.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Group Chat</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">J</div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Jake H. • 2h ago</p>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4">
              <p className="text-sm">Lets go! Whos ready to lock in this week? 💪</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-row-reverse">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">Y</div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1 text-right">You • 1h ago</p>
            <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm p-4 ml-auto max-w-[80%]">
              <p className="text-sm">Im coming for that #1 spot Jake 👀</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">E</div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Ethan S. • 45m ago</p>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4">
              <p className="text-sm">Andrew slipping already lol</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">A</div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Andrew B. • 30m ago</p>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4">
              <p className="text-sm">Its only Wednesday, just wait 😤</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">J</div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Jake H. • 20m ago</p>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4">
              <p className="text-sm">Andrew on TikTok for 9 hours 😂 Bro needs help</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 pb-24">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Message..."
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm outline-none"
          />
          <button className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            ↑
          </button>
        </div>
      </div>
    </div>
  );

  const StatsScreen = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-xs">
        <span className="font-semibold">9:41</span>
        <span>📶 🔋</span>
      </div>
      
      <div className="px-6 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage pool settings</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-4">
          {/* Pool Selector for Settings */}
          <div className="bg-white rounded-3xl p-4 shadow-md">
            <p className="text-sm text-gray-500 mb-3">Currently Managing</p>
            <div className="space-y-2">
              {pools.map((pool, idx) => (
                <button
                  key={pool.id}
                  onClick={() => setSelectedPool(idx)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    selectedPool === idx
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pool.name.split(' ')[pool.name.split(' ').length - 1]}</span>
                    <div className="text-left">
                      <p className={`font-bold ${selectedPool === idx ? 'text-white' : 'text-gray-900'}`}>
                        {pool.name}
                      </p>
                      <p className={`text-xs ${selectedPool === idx ? 'text-white/80' : 'text-gray-500'}`}>
                        {poolTrackedApps[idx]?.length || 0} apps • {pool.participants} players
                      </p>
                    </div>
                  </div>
                  {selectedPool === idx && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Group Tracked Apps */}
          <button 
            onClick={() => setShowAppSettings(true)}
            className="w-full flex items-center justify-between p-5 bg-blue-50 rounded-3xl border-2 border-blue-200 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Group Tracked Apps</p>
                <p className="text-sm text-gray-500">{trackedApps.length} apps for {currentPool.name}</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </button>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Apps Everyone Tracks</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                Group Setting
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              All {currentPool.participants} players in {currentPool.name} track these apps for fair competition
            </p>
            <div className="flex flex-wrap gap-2">
              {trackedApps.map((appName) => {
                const app = allAvailableApps.find(a => a.name === appName);
                return (
                  <div key={appName} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                    <span className="text-xl">{app?.icon}</span>
                    <span className="text-sm font-medium">{appName}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-800">
                ⚠️ Changing tracked apps affects all players in this pool
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-lg mb-4">Privacy</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👀</span>
                <div>
                  <p className="font-semibold">Share App Usage</p>
                  <p className="text-sm text-gray-500">Let friends see your apps</p>
                </div>
              </div>
              <div className="w-12 h-7 bg-purple-600 rounded-full flex items-center justify-end px-1">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-lg mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pool Updates</span>
                <div className="w-12 h-7 bg-purple-600 rounded-full flex items-center justify-end px-1">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Friend Messages</span>
                <div className="w-12 h-7 bg-purple-600 rounded-full flex items-center justify-end px-1">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Reminders</span>
                <div className="w-12 h-7 bg-gray-300 rounded-full flex items-center px-1">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileScreen = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-xs">
        <span className="font-semibold">9:41</span>
        <span>📶 🔋</span>
      </div>
      
      <div className="px-6 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-gray-500 text-sm mt-1">Track your progress</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-4">
          <button
            onClick={() => setShowDetailedStats(true)}
            className="w-full bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-3xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-left">
                <p className="text-white/80 text-sm mb-1">This Week</p>
                <p className="text-5xl font-bold">18.5h</p>
                <p className="text-white/90 text-sm mt-2">↓ 24% from last week</p>
              </div>
              <ChevronRight className="w-8 h-8 text-white/60" />
            </div>
            <div className="flex gap-2">
              {mockUserData.apps.slice(0, 3).map((app, idx) => (
                <div key={idx} className="flex-1 bg-white/10 rounded-xl p-2 text-center">
                  <p className="text-xl mb-0.5">{app.icon}</p>
                  <p className="text-[10px] text-white/70 truncate">{app.name}</p>
                  <p className="text-xs font-bold text-white">{app.time}h</p>
                </div>
              ))}
            </div>
          </button>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-lg mb-4">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{pools.length}</p>
                <p className="text-sm text-gray-600 mt-1">Active Pools</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600">3</p>
                <p className="text-sm text-gray-600 mt-1">Weeks Won</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">$150</p>
                <p className="text-sm text-gray-600 mt-1">Total Won</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">-28%</p>
                <p className="text-sm text-gray-600 mt-1">Avg Reduction</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-lg mb-4">Achievements 🏆</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-2xl border border-yellow-200">
                <span className="text-3xl">🔥</span>
                <div className="flex-1">
                  <p className="font-semibold">3 Week Streak</p>
                  <p className="text-xs text-gray-600">Consistent improvement</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl border border-purple-200">
                <span className="text-3xl">👑</span>
                <div className="flex-1">
                  <p className="font-semibold">First Place Finish</p>
                  <p className="text-xs text-gray-600">Won a competition</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-200">
                <span className="text-3xl">📉</span>
                <div className="flex-1">
                  <p className="font-semibold">50% Reduction</p>
                  <p className="text-xs text-gray-600">Major improvement in one week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-lg mb-4">Account</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="font-medium">Edit Profile</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="font-medium">Payment Methods</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="font-medium text-red-600">Sign Out</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AppSettingsModal = () => (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-[40px] max-h-[80%] overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex justify-between mb-2">
            <h2 className="text-2xl font-bold">Group Tracked Apps</h2>
            <button onClick={() => setShowAppSettings(false)} className="w-8 h-8 rounded-full bg-gray-100">✕</button>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {trackedApps.length} apps selected for {currentPool.name}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs text-blue-800">
              <strong>👥 Group Setting:</strong> All {currentPool.participants} players track these apps for fair competition
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {["Social", "Entertainment"].map((cat) => (
            <div key={cat} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{cat}</h3>
              {allAvailableApps.filter(a => a.category === cat).map((app) => (
                <button
                  key={app.name}
                  onClick={() => toggleApp(app.name)}
                  className={`w-full flex justify-between p-4 rounded-2xl mb-2 ${
                    trackedApps.includes(app.name) ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-3xl">{app.icon}</span>
                    <span className="font-semibold">{app.name}</span>
                  </div>
                  {trackedApps.includes(app.name) && <span className="text-blue-600 font-bold">✓</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="p-6 border-t pb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-yellow-800">
              ⚠️ Changes apply to all players in this pool immediately
            </p>
          </div>
          <Button onClick={() => setShowAppSettings(false)} className="w-full bg-blue-600 text-white py-4">
            Save for {currentPool.name}
          </Button>
        </div>
      </div>
    </div>
  );

  const DetailedStatsModal = () => (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-[40px] max-h-[85%] overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex justify-between mb-2">
            <h2 className="text-2xl font-bold">Your Stats</h2>
            <button onClick={() => setShowDetailedStats(false)} className="w-8 h-8 rounded-full bg-gray-100">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-6 mb-6 text-white">
            <p className="text-5xl font-bold mb-2">{mockUserData.totalScreenTime}h</p>
            <p className="text-white/80">Total Screen Time</p>
          </div>
          {mockUserData.apps.map((app, idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl p-4 mb-3">
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <span className="text-3xl">{app.icon}</span>
                  <span className="font-semibold">{app.name}</span>
                </div>
                <p className="text-2xl font-bold">{app.time}h</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const FriendDetailModal = () => {
    if (!showFriendDetail) return null;
    const friend = showFriendDetail;
    
    return (
      <div className="absolute inset-0 bg-black/50 z-50 flex items-end">
        <div className="w-full bg-white rounded-t-[40px] max-h-[85%] overflow-hidden flex flex-col">
          <div className="px-6 pt-6 pb-4 border-b">
            <div className="flex justify-between mb-2">
              <h2 className="text-2xl font-bold">{friend.name}</h2>
              <button onClick={() => setShowFriendDetail(null)} className="w-8 h-8 rounded-full bg-gray-100">✕</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl p-6 mb-6 text-white">
              <p className="text-5xl font-bold mb-2">{friend.time}h</p>
              <p className="text-white/80">Rank #{friend.rank}</p>
            </div>
            {friend.sharingApps && friend.apps ? (
              <div>
                <h3 className="font-bold text-lg mb-3">App Breakdown 👀</h3>
                {friend.apps.map((app, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-4 mb-3">
                    <div className="flex justify-between">
                      <div className="flex gap-3">
                        <span className="text-3xl">{app.icon}</span>
                        <span className="font-semibold">{app.name}</span>
                      </div>
                      <p className="text-2xl font-bold">{app.time}h</p>
                    </div>
                  </div>
                ))}
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <p className="font-semibold mb-2 text-orange-900">💬 Roast Fuel</p>
                  <p className="text-sm text-orange-800">
                    {friend.name} spent {friend.apps[0]?.time}h on {friend.apps[0]?.name} 😬
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-3">🔒</p>
                <p className="font-semibold text-lg">Private Stats</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowFriendDetail(null); setActiveTab("chat"); }}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Call Out
              </Button>
              <Button variant="outline" onClick={() => setShowFriendDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="w-[390px] h-[844px] bg-black rounded-[60px] p-3 shadow-2xl">
        <div className="w-full h-full bg-white rounded-[48px] overflow-hidden flex flex-col relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-50"></div>

          {showSplash ? (
            <SplashScreen />
          ) : (
            <>
              {activeTab === "home" && <HomeScreen />}
              {activeTab === "chat" && <ChatScreen />}
              {activeTab === "stats" && <StatsScreen />}
              {activeTab === "profile" && <ProfileScreen />}

              {showAppSettings && <AppSettingsModal />}
              {showDetailedStats && <DetailedStatsModal />}
              {showFriendDetail && <FriendDetailModal />}

              <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t">
                <div className="flex justify-around px-6 py-3 pb-6">
                  <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center gap-1 ${activeTab === "home" ? "text-purple-600" : "text-gray-400"}`}>
                    <Home className="w-6 h-6" />
                    <span className="text-xs">Home</span>
                  </button>
                  <button onClick={() => setActiveTab("stats")} className={`flex flex-col items-center gap-1 ${activeTab === "stats" ? "text-purple-600" : "text-gray-400"}`}>
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-xs">Stats</span>
                  </button>
                  <button onClick={() => setActiveTab("chat")} className={`flex flex-col items-center gap-1 relative ${activeTab === "chat" ? "text-purple-600" : "text-gray-400"}`}>
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-xs">Chat</span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">3</div>
                  </button>
                  <button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center gap-1 ${activeTab === "profile" ? "text-purple-600" : "text-gray-400"}`}>
                    <User className="w-6 h-6" />
                    <span className="text-xs">Profile</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm font-semibold text-gray-700">iPhone 15 Pro</p>
        <p className="text-xs text-gray-500 mt-1">LEUTH - Compete. Reduce. Win.</p>
      </div>
    </div>
  );
};

export default IOSMockup;