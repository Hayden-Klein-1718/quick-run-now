import { useState } from "react";
import { TrendingUp, TrendingDown, X } from "lucide-react";

interface ScoreRingProps {
  score: number;
  delta: number;
  size?: number;
}

export const ScoreRing = ({ score, delta, size = 300 }: ScoreRingProps) => {
  const [showDetail, setShowDetail] = useState(false);
  
  // Color based on score
  const getColor = (score: number) => {
    if (score >= 80) return { stroke: "rgb(34, 197, 94)", bg: "bg-green-500" };
    if (score >= 60) return { stroke: "rgb(234, 179, 8)", bg: "bg-yellow-500" };
    return { stroke: "rgb(239, 68, 68)", bg: "bg-red-500" };
  };

  const color = getColor(score);
  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={() => setShowDetail(true)}
          className="relative flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
          style={{ width: size, height: size }}
        >
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth="20"
              fill="none"
              opacity="0.2"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color.stroke}
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-8xl font-bold text-foreground mb-2">{score}</p>
            <p className="text-xs text-muted-foreground mb-2">Today's Score</p>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${color.bg} bg-opacity-20`}>
              {delta >= 0 ? (
                <TrendingUp className="w-3 h-3" style={{ color: color.stroke }} />
              ) : (
                <TrendingDown className="w-3 h-3" style={{ color: color.stroke }} />
              )}
              <span className="text-xs font-semibold" style={{ color: color.stroke }}>
                {delta >= 0 ? '+' : ''}{delta} vs yesterday
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Score Detail Sheet */}
      {showDetail && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex flex-col p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Score Details</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>

            {/* Score Summary */}
            <div className="glass-card rounded-3xl p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-6xl font-bold text-foreground mb-2">{score}</p>
                <p className="text-muted-foreground">Today's Score</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card-inner rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">85</p>
                  <p className="text-xs text-muted-foreground mt-1">Goal</p>
                </div>
                <div className="glass-card-inner rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{score}</p>
                  <p className="text-xs text-muted-foreground mt-1">Actual</p>
                </div>
              </div>
            </div>

            {/* By Category */}
            <div className="glass-card rounded-3xl p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">By Category</h3>
              <div className="space-y-3">
                {[
                  { name: "Social Media", score: 72, color: "rgb(239, 68, 68)" },
                  { name: "Entertainment", score: 65, color: "rgb(234, 179, 8)" },
                  { name: "Productivity", score: 88, color: "rgb(34, 197, 94)" },
                ].map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-foreground">{cat.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{cat.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By App */}
            <div className="glass-card rounded-3xl p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">By App</h3>
              <div className="space-y-3">
                {[
                  { name: "Instagram", icon: "📸", score: 68, time: "2h 15m" },
                  { name: "TikTok", icon: "🎵", score: 55, time: "3h 45m" },
                  { name: "YouTube", icon: "📺", score: 70, time: "1h 50m" },
                  { name: "Netflix", icon: "🎬", score: 62, time: "2h 30m" },
                ].map((app) => (
                  <div key={app.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{app.icon}</span>
                      <div>
                        <p className="text-foreground font-medium">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.time}</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground">{app.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Trend */}
            <div className="glass-card rounded-3xl p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">7-Day Trend</h3>
              <div className="flex items-end justify-between h-40 gap-2">
                {[82, 78, 85, 79, 83, 81, score].map((dayScore, i) => {
                  const dayColor = getColor(dayScore);
                  const height = (dayScore / 100) * 100;
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full" style={{ height: '120px' }}>
                        <div
                          className="absolute bottom-0 w-full rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${height}%`,
                            backgroundColor: dayColor.stroke,
                            opacity: 0.8,
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground">{dayScore}</p>
                        <p className="text-xs text-muted-foreground">{days[i]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
