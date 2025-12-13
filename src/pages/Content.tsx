import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ContentCard } from "@/components/dashboard/ContentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { EditContentDialog } from "@/components/dashboard/EditContentDialog";

function timeAgo(timestamp: any) {
  if (!timestamp) return "Unknown";
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let timeString = "Just now";
  if (seconds > 31536000) timeString = Math.floor(seconds / 31536000) + " years ago";
  else if (seconds > 2592000) timeString = Math.floor(seconds / 2592000) + " months ago";
  else if (seconds > 86400) timeString = Math.floor(seconds / 86400) + " days ago";
  else if (seconds > 3600) timeString = Math.floor(seconds / 3600) + " hours ago";
  else if (seconds > 60) timeString = Math.floor(seconds / 60) + " minutes ago";

  return timeString;
}

const Content = () => {
  const [contentList, setContentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "app_content"), (snapshot) => {
      const fetchedData = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        const updaterName = data.updatedBy || "System";
        const timeString = timeAgo(data.updatedAt || data.createdAt);
        const displayDate = `${updaterName} • ${timeString}`;

        return {
          id: doc.id,
          title: data.en?.title || data.title || "Untitled Content", 
          category: data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : "General",
          status: data.status || "published",
          lastUpdated: displayDate, 
        };
      });
      setContentList(fetchedData);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredContent = contentList.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleEdit = (id: string) => {
    setSelectedContentId(id);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will delete the content from the mobile app.")) {
      try {
        await deleteDoc(doc(db, "app_content", id));
        toast({
          title: "Content Deleted",
          description: "The content has been removed successfully.",
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
    toast({
      title: "Preview Mode",
      description: "Mobile preview feature coming soon.",
    });
  };

  const handleCreate = () => {
    toast({
      title: "Create Content",
      description: "Please use the manual upload script for new modules.",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Content Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Create and manage content for the MAnSA app
            </p>
          </div>
          <Button variant="rose" className="gap-2" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Create Content
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Wellness">Wellness</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Relationships">Relationships</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredContent.map((content) => (
            <ContentCard
              key={content.id}
              {...content}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredContent.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
            <Filter className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              No content found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters, or check if Firebase has data.
            </p>
          </div>
        )}

        {/* Edit Dialog Component */}
        <EditContentDialog 
          contentId={selectedContentId} 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
        />

      </div>
    </DashboardLayout>
  );
};

export default Content;