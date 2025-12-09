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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const stats = [
  {
    title: "Total App Users",
    value: "12,847",
    change: "+12% from last month",
    changeType: "positive" as const,
    icon: Users,
    variant: "rose" as const,
  },
  {
    title: "Daily Active Users",
    value: "3,241",
    change: "+8% from yesterday",
    changeType: "positive" as const,
    icon: Activity,
    variant: "sage" as const,
  },
  {
    title: "Avg. Session Duration",
    value: "12m 34s",
    change: "+2m from last week",
    changeType: "positive" as const,
    icon: Clock,
    variant: "lavender" as const,
  },
  {
    title: "Retention Rate",
    value: "78%",
    change: "+3% from last month",
    changeType: "positive" as const,
    icon: TrendingUp,
    variant: "default" as const,
  },
];

const weeklyData = [
  { name: "Mon", users: 2400, sessions: 4000 },
  { name: "Tue", users: 1398, sessions: 3000 },
  { name: "Wed", users: 9800, sessions: 2000 },
  { name: "Thu", users: 3908, sessions: 2780 },
  { name: "Fri", users: 4800, sessions: 1890 },
  { name: "Sat", users: 3800, sessions: 2390 },
  { name: "Sun", users: 4300, sessions: 3490 },
];

const monthlyData = [
  { name: "Week 1", users: 15000, sessions: 28000 },
  { name: "Week 2", users: 18000, sessions: 32000 },
  { name: "Week 3", users: 22000, sessions: 38000 },
  { name: "Week 4", users: 25000, sessions: 42000 },
];

const platformStats = [
  { platform: "iOS", users: 7234, percentage: 56 },
  { platform: "Android", users: 5613, percentage: 44 },
];

const topFeatures = [
  { name: "Daily Mood Tracker", usage: 89 },
  { name: "Meditation Sessions", usage: 76 },
  { name: "Pregnancy Journal", usage: 68 },
  { name: "Community Forum", usage: 54 },
  { name: "Educational Articles", usage: 47 },
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("week");

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
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
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Chart */}
        <AnalyticsChart
          data={timeRange === "month" ? monthlyData : weeklyData}
          title={`User Activity - ${timeRange === "month" ? "Monthly" : "Weekly"} Overview`}
        />

        {/* Platform & Features */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Platform Distribution */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">
              Platform Distribution
            </h3>
            <div className="space-y-6">
              {platformStats.map((platform) => (
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
              ))}
            </div>
          </div>

          {/* Top Features */}
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

        {/* Engagement Metrics */}
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
                <p className="text-sm text-muted-foreground">User Satisfaction</p>
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
};

export default Analytics;
