import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ContentCard } from "@/components/dashboard/ContentCard";
import {
  Users,
  Activity,
  Heart,
  TrendingUp,
  Brain,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
// 1. Added deleteDoc and doc
import { collection, getDocs, Timestamp, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { useNavigate } from "react-router-dom";
// 2. Import Edit Dialog and Toast
import { EditContentDialog } from "@/components/dashboard/EditContentDialog";
import { useToast } from "@/hooks/use-toast";

// Helper function
function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast(); // Hook for notifications
  const [loading, setLoading] = useState(true);
  
  // --- STATE ---
  const [totalUsers, setTotalUsers] = useState("0");
  const [activeUsers, setActiveUsers] = useState("0");
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentContent, setRecentContent] = useState<any[]>([]); 

  // --- DIALOG STATE (New) ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState("");

  // --- HANDLERS (New) ---
  const handleEdit = (id: string) => {
    setSelectedContentId(id);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will delete the content from the mobile app.")) {
      try {
        await deleteDoc(doc(db, "app_content", id));
        
        // Update local state to remove the deleted item immediately
        setRecentContent(prev => prev.filter(item => item.id !== id));
        
        toast({
          title: "Content Deleted",
          description: "Removed successfully.",
          variant: "destructive",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not delete content.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePreview = (id: string) => {
    toast({ title: "Preview Mode", description: "Mobile preview feature coming soon." });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // --- 1. FETCH USERS & ACTIVITY ---
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map((doc) => doc.data());

        setTotalUsers(users.length.toLocaleString());

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const activeCount = users.filter((user) => {
          if (!user.lastActive) return false;
          const lastActive = user.lastActive instanceof Timestamp ? user.lastActive.toDate() : new Date(user.lastActive);
          return lastActive >= yesterday;
        }).length;
        setActiveUsers(activeCount.toLocaleString());

        // --- 2. CHART DATA ---
        const today = new Date();
        const daysMap = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          daysMap.set(d.toLocaleDateString("en-US", { weekday: "short" }), 0);
        }

        const sortedUsers = [...users].sort((a, b) => {
           const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(0);
           const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(0);
           return dateB.getTime() - dateA.getTime();
        });

        users.forEach((user) => {
          if (user.createdAt) {
            const date = user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date(user.createdAt);
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            const diffTime = Math.abs(today.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 7 && daysMap.has(dayName)) {
              daysMap.set(dayName, (daysMap.get(dayName) || 0) + 1);
            }
          }
        });

        const newChartData = Array.from(daysMap).map(([name, count]) => ({
          name,
          users: count,
          sessions: count * 4 + 10, 
        }));
        setChartData(newChartData);

        // --- 3. RECENT ACTIVITY ---
        const newActivities = sortedUsers.slice(0, 5).map((user) => {
            const date = user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date();
            const name = user.patientid || user.email || "New User"; 
            
            return {
                id: user.uid || Math.random().toString(),
                type: "user_joined",
                message: `${name} joined MAnSA`,
                timestamp: timeAgo(date),
            };
        });
        setRecentActivities(newActivities);

        // --- 4. FETCH RECENT CONTENT ---
        const contentQuery = query(
          collection(db, "app_content"),
          orderBy("updatedAt", "desc"), 
          limit(3)
        );
        const contentSnapshot = await getDocs(contentQuery);
        
        const fetchedContent = contentSnapshot.docs.map((doc) => {
          const data = doc.data();
          const updaterName = data.updatedBy || "System";
          
          const dateObj = data.updatedAt instanceof Timestamp 
            ? data.updatedAt.toDate() 
            : (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date());
            
          const timeString = timeAgo(dateObj);

          return {
            id: doc.id,
            title: data.en?.title || data.title || "Untitled Content",
            category: data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : "General",
            status: data.status || "published",
            lastUpdated: `${updaterName} • ${timeString}`, // Correct format
          };
        });
        setRecentContent(fetchedContent);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 animate-fade-in">
          <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
          <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { title: "Total Users", value: totalUsers, change: "Real-time count", changeType: "neutral" as const, icon: Users, variant: "rose" as const },
    { title: "Active Sessions", value: activeUsers, change: "Users active in last 24h", changeType: "positive" as const, icon: Activity, variant: "sage" as const },
    { title: "Wellness Score", value: "8.4", change: "Average across all users", changeType: "neutral" as const, icon: Heart, variant: "lavender" as const },
    { title: "Engagement Rate", value: "67%", change: "+5% from last week", changeType: "positive" as const, icon: TrendingUp, variant: "default" as const },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Welcome back</h1>
            <p className="mt-1 text-muted-foreground">Here's what's happening with MAnSA today</p>
          </div>
          <Button variant="rose" className="gap-2" onClick={() => navigate("/content")}>
            <Plus className="h-4 w-4" /> Manage Content
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
            <AnalyticsChart data={chartData} title="New User Signups (Last 7 Days)" />
          </div>
          <RecentActivity activities={recentActivities} />
        </div>

        {/* Recent Content */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-foreground">Recently Updated Content</h2>
            <Button variant="ghost" className="text-primary" onClick={() => navigate("/content")}>
              View All
            </Button>
          </div>
          
          {/* CONTENT GRID */}
          {recentContent.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentContent.map((content) => (
                <ContentCard 
                  key={content.id} 
                  {...content} 
                  // --- CRITICAL FIX: Pass the handlers here ---
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                  // -------------------------------------------
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              No content found. Go to the Content page to create some.
            </div>
          )}
        </div>


        {/* --- EDIT DIALOG (must be rendered to work) --- */}
        <EditContentDialog 
          contentId={selectedContentId} 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
        />

      </div>
    </DashboardLayout>
  );
};

export default Index;