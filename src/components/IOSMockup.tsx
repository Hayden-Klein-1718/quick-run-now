import { useState } from "react";
import { Home, MessageCircle, BarChart3, User, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const IOSMockup = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("home");

  const TabContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />;
      case "chat":
        return <ChatTab />;
      case "stats":
        return <StatsTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab theme={theme} setTheme={setTheme} />;
      default:
        return <HomeTab />;
    }
  };

  const HomeTab = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#1E90FF] to-[#4169E1] rounded-[20px] flex items-center justify-center shadow-lg">
          <span className="text-5xl">📱</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 text-foreground">LEUTH</h1>
        <p className="text-xl text-muted-foreground font-medium">
          Compete. Reduce. Win.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="glass-card rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Current Challenge</p>
              <p className="text-2xl font-bold text-foreground">The Squad 💪</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <p className="text-3xl font-bold text-[#1E90FF]">#2</p>
            </div>
          </div>
          <div className="glass-card-inner rounded-[15px] p-4 bg-[#1E90FF]/10">
            <p className="text-sm text-foreground">3 days left • $250 pot</p>
          </div>
        </div>

        <div className="glass-card rounded-[20px] p-6">
          <div className="text-left mb-3">
            <p className="text-sm text-muted-foreground">Your Screen Time</p>
            <p className="text-4xl font-bold text-foreground">18.5h</p>
            <p className="text-sm text-green-500 font-semibold mt-1">↓ 24% this week</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatTab = () => (
    <div className="flex-1 flex flex-col px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Messages</h1>
      <div className="flex-1 space-y-4 overflow-hidden">
        <div className="glass-card rounded-[20px] p-4 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E90FF] to-[#4169E1] flex items-center justify-center text-white font-bold">
              TS
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">The Squad</p>
              <p className="text-sm text-muted-foreground truncate">Jake: Let's go! Who's ready...</p>
            </div>
            <span className="text-xs text-muted-foreground">2h</span>
          </div>
        </div>

        <div className="glass-card rounded-[20px] p-4 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              FC
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Family Challenge</p>
              <p className="text-sm text-muted-foreground truncate">Mom: Great progress everyone!</p>
            </div>
            <span className="text-xs text-muted-foreground">1d</span>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsTab = () => (
    <div className="flex-1 flex flex-col px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Your Stats</h1>
      <div className="space-y-4">
        <div className="glass-card rounded-[20px] p-6">
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
                  strokeDasharray={`${2 * Math.PI * 56 * 0.65} ${2 * Math.PI * 56}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">65%</p>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">Weekly Goal: Under 25h</p>
        </div>

        <div className="glass-card rounded-[20px] p-5">
          <p className="text-sm text-muted-foreground mb-3">Top Apps</p>
          <div className="space-y-2">
            {[
              { name: "Instagram", time: "6.2h", icon: "📸", width: "70%" },
              { name: "TikTok", time: "4.8h", icon: "🎵", width: "55%" },
              { name: "Twitter", time: "3.1h", icon: "🐦", width: "35%" },
            ].map((app, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-2xl">{app.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{app.name}</span>
                    <span className="text-sm font-semibold text-foreground">{app.time}</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1E90FF] to-[#4169E1] rounded-full transition-all duration-1000"
                      style={{ width: app.width }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileTab = () => (
    <div className="flex-1 flex flex-col items-center px-6 py-8">
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1E90FF] to-[#4169E1] flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
        JD
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">John Doe</h2>
      <p className="text-sm text-muted-foreground mb-8">@johndoe</p>

      <div className="w-full max-w-sm space-y-4">
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
  );

  const SettingsTab = ({ theme, setTheme }: { theme: string | undefined; setTheme: (theme: string) => void }) => (
    <div className="flex-1 flex flex-col px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Settings</h1>
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
  );

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[430px] h-[932px] bg-background rounded-[60px] shadow-2xl overflow-hidden flex flex-col relative border-[14px] border-gray-800 dark:border-gray-900">
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
