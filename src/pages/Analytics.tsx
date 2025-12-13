import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import {
  Users,
  Activity,
  Clock,
  TrendingUp,
  Smartphone,
  Globe,
  Heart,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);

  const [totalUsers, setTotalUsers] = useState("0");
  const [activeUsers, setActiveUsers] = useState("0");
  const [chartData, setChartData] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [growthRate, setGrowthRate] = useState({ val: "0%", isPos: true });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs.map((doc) => doc.data());

        setTotalUsers(users.length.toLocaleString());

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const activeCount = users.filter((user) => {
          if (!user.lastActive) return false;
          const lastActiveDate = user.lastActive instanceof Timestamp 
            ? user.lastActive.toDate() 
            : new Date(user.lastActive);
            
          return lastActiveDate >= yesterday;
        }).length;
        setActiveUsers(activeCount.toLocaleString());

        let androidCount = 0;
        let iosCount = 0;
        users.forEach((user) => {
          const p = (user.platform || "").toLowerCase();
          if (p === "android") androidCount++;
          else if (p === "ios") iosCount++;
        });

        const totalPlatforms = androidCount + iosCount || 1;
        setPlatformData([
          {
            platform: "iOS",
            users: iosCount,
            percentage: Math.round((iosCount / totalPlatforms) * 100),
          },
          {
            platform: "Android",
            users: androidCount,
            percentage: Math.round((androidCount / totalPlatforms) * 100),
          },
        ]);

        const today = new Date();
        let newChartData = [];

        if (timeRange === "week") {
          const daysMap = new Map<string, number>();
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            daysMap.set(d.toLocaleDateString("en-US", { weekday: "short" }), 0);
          }

          users.forEach((user) => {
            if (user.createdAt) {
              const date = user.createdAt instanceof Timestamp 
                ? user.createdAt.toDate() 
                : new Date(user.createdAt);
                
              const dayName = date.toLocaleDateString("en-US", {
                weekday: "short",
              });
              const diffTime = Math.abs(today.getTime() - date.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays <= 7 && daysMap.has(dayName)) {
                daysMap.set(dayName, (daysMap.get(dayName) || 0) + 1);
              }
            }
          });

          newChartData = Array.from(daysMap).map(([name, count]) => ({
            name,
            users: count,
            sessions: count * 4 + 10, 
          }));
        } else {
          const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
          const weekCounts = [0, 0, 0, 0];

          users.forEach((user) => {
            if (user.createdAt) {
              const date = user.createdAt instanceof Timestamp 
                ? user.createdAt.toDate() 
                : new Date(user.createdAt);
                
              const diffTime = Math.abs(today.getTime() - date.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays <= 7) weekCounts[3]++;
              else if (diffDays <= 14) weekCounts[2]++;
              else if (diffDays <= 21) weekCounts[1]++;
              else if (diffDays <= 28) weekCounts[0]++;
            }
          });

          newChartData = weeks.map((name, i) => ({
            name,
            users: weekCounts[i],
            sessions: weekCounts[i] * 6 + 15,
          }));
        }
        setChartData(newChartData);



        const startOfMonth = new Date();
        startOfMonth.setDate(today.getDate() - 30);

        const newUsersLast30Days = users.filter((u) => {
          if (!u.createdAt) return false;
          const d = u.createdAt instanceof Timestamp 
            ? u.createdAt.toDate() 
            : new Date(u.createdAt);
          return d >= startOfMonth;
        }).length;

        const prevTotal = users.length - newUsersLast30Days;
        
        let growth = 0;
        
        if (prevTotal > 0) {
          growth = (newUsersLast30Days / prevTotal) * 100;
        } else if (newUsersLast30Days > 0) {
          growth = 100;
        }

        setGrowthRate({
          val: `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`,
          isPos: growth >= 0,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 animate-fade-in">
          <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
          <p className="text-muted-foreground animate-pulse">
            Gathering analytics...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Total App Users",
      value: totalUsers,
      change: `${growthRate.val} from last month`,
      changeType: (growthRate.isPos ? "positive" : "negative") as
        | "positive"
        | "negative",
      icon: Users,
      variant: "rose" as const,
    },
    {
      title: "Daily Active Users",
      value: activeUsers,
      change: "Active in last 24h",
      changeType: "positive" as const,
      icon: Activity,
      variant: "sage" as const,
    },
    {
      title: "Avg. Session Duration",
      value: "5m 12s", 
      change: "+2m from last week",
      changeType: "positive" as const,
      icon: Clock,
      variant: "lavender" as const,
    },
    {
      title: "Retention Rate",
      value: "85%", 
      change: "+3% from last month",
      changeType: "positive" as const,
      icon: TrendingUp,
      variant: "default" as const,
    },
  ];

  const topFeatures = [
    { name: "Daily Mood Tracker", usage: 89 },
    { name: "Meditation Sessions", usage: 76 },
    { name: "Pregnancy Journal", usage: 68 },
    { name: "Community Forum", usage: 54 },
    { name: "Educational Articles", usage: 47 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              App Analytics
            </h1>
            <p className="mt-1 text-muted-foreground">
              Monitor user engagement and app performance
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <AnalyticsChart
          data={chartData}
          title={`User Growth - ${
            timeRange === "month" ? "Monthly" : "Weekly"
          } Overview`}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">
              Platform Distribution
            </h3>
            <div className="space-y-6">
              {platformData.length > 0 ? (
                platformData.map((platform) => (
                  <div key={platform.platform} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-light">
                          <Smartphone className="h-5 w-5 text-rose-dark" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {platform.platform}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {platform.users.toLocaleString()} users
                          </p>
                        </div>
                      </div>
                      <span className="font-display text-2xl font-bold text-foreground">
                        {platform.percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full gradient-rose transition-all duration-500"
                        style={{ width: `${platform.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No platform data available yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">
              Most Used Features
            </h3>
            <div className="space-y-4">
              {topFeatures.map((feature, index) => (
                <div key={feature.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-light text-xs font-semibold text-sage-dark">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {feature.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {feature.usage}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full gradient-sage transition-all duration-500"
                      style={{ width: `${feature.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-light">
                <Heart className="h-5 w-5 text-rose-dark" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  94%
                </p>
                <p className="text-sm text-muted-foreground">
                  User Satisfaction
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-light">
                <MessageSquare className="h-5 w-5 text-sage-dark" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  2,341
                </p>
                <p className="text-sm text-muted-foreground">Forum Posts</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender-light">
                <Globe className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  45
                </p>
                <p className="text-sm text-muted-foreground">Countries</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  +28%
                </p>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}