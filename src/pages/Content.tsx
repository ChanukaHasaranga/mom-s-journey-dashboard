import { useState } from "react";
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
import { Plus, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const allContent = [
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
  {
    id: "4",
    title: "First Trimester Anxiety Management",
    category: "Wellness",
    status: "published" as const,
    lastUpdated: "5 days ago",
  },
  {
    id: "5",
    title: "Partner Support During Pregnancy",
    category: "Relationships",
    status: "published" as const,
    lastUpdated: "1 week ago",
  },
  {
    id: "6",
    title: "Sleep Hygiene for Expecting Mothers",
    category: "Health",
    status: "draft" as const,
    lastUpdated: "1 week ago",
  },
  {
    id: "7",
    title: "Postpartum Mental Health Preparation",
    category: "Education",
    status: "scheduled" as const,
    lastUpdated: "2 weeks ago",
  },
  {
    id: "8",
    title: "Gentle Yoga Sequences",
    category: "Wellness",
    status: "published" as const,
    lastUpdated: "2 weeks ago",
  },
];

const Content = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  const filteredContent = allContent.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleEdit = (id: string) => {
    toast({
      title: "Edit Content",
      description: `Opening editor for content ID: ${id}`,
    });
  };

  const handleDelete = (id: string) => {
    toast({
      title: "Content Deleted",
      description: "The content has been removed successfully.",
      variant: "destructive",
    });
  };

  const handlePreview = (id: string) => {
    toast({
      title: "Preview",
      description: `Opening preview for content ID: ${id}`,
    });
  };

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
              Create and manage content for the BloomMind app
            </p>
          </div>
          <Button variant="rose" className="gap-2">
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

        {filteredContent.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
            <Filter className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              No content found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Content;
