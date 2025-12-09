import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ContentCard } from "@/components/dashboard/ContentCard";
import { Users, Activity, Heart, TrendingUp, FileText, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "12,847",
    change: "+12% from last month",
    changeType: "positive" as const,
    icon: Users,
    variant: "rose" as const,
  },
  {
    title: "Active Sessions",
    value: "3,241",
    change: "+8% from yesterday",
    changeType: "positive" as const,
    icon: Activity,
    variant: "sage" as const,
  },
  {
    title: "Wellness Score",
    value: "8.4",
    change: "Average across all users",
    changeType: "neutral" as const,
    icon: Heart,
    variant: "lavender" as const,
  },
  {
    title: "Engagement Rate",
    value: "67%",
    change: "+5% from last week",
    changeType: "positive" as const,
    icon: TrendingUp,
    variant: "default" as const,
  },
];

const chartData = [
  { name: "Mon", users: 2400, sessions: 4000 },
  { name: "Tue", users: 1398, sessions: 3000 },
  { name: "Wed", users: 9800, sessions: 2000 },
  { name: "Thu", users: 3908, sessions: 2780 },
  { name: "Fri", users: 4800, sessions: 1890 },
  { name: "Sat", users: 3800, sessions: 2390 },
  { name: "Sun", users: 4300, sessions: 3490 },
];

const recentActivities = [
  {
    id: "1",
    type: "user_joined" as const,
    message: "Sarah Johnson joined BloomMind",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    type: "content_updated" as const,
    message: "Week 12 meditation guide was updated",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    type: "milestone" as const,
    message: "1,000 users completed their first trimester",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    type: "feedback" as const,
    message: "New feedback received on breathing exercises",
    timestamp: "2 hours ago",
  },
];

const recentContent = [
  {
    id: "1",
    title: "Mindful Breathing for the Third Trimester",
    category: "Wellness",
    status: "published" as const,
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    title: "Nutrition Guide: Week 20-24",
    category: "Health",
    status: "draft" as const,
    lastUpdated: "1 day ago",
  },
  {
    id: "3",
    title: "Preparing for Labor: Mental Wellness",
    category: "Education",
    status: "scheduled" as const,
    lastUpdated: "3 days ago",
  },
];

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Welcome back
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here's what's happening with BloomMind today
            </p>
          </div>
          <Button variant="rose" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Content
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnalyticsChart data={chartData} title="User Activity Overview" />
          </div>
          <RecentActivity activities={recentActivities} />
        </div>

        {/* Recent Content */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Recent Content
            </h2>
            <Button variant="ghost" className="text-primary">
              View All
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentContent.map((content) => (
              <ContentCard key={content.id} {...content} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-rose-light via-lavender-light to-sage-light p-6 shadow-card">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-rose shadow-soft">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-semibold text-foreground">
                AI Content Suggestions
              </h3>
              <p className="mt-1 text-muted-foreground">
                Get personalized content recommendations based on user engagement patterns
              </p>
            </div>
            <Button variant="rose" size="lg">
              Generate Ideas
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
