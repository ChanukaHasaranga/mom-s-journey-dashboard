import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserTable, User } from "@/components/dashboard/UserTable";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Users as UsersIcon, UserCheck, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const usersData: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "admin",
    status: "active",
    lastActive: "Just now",
  },
  {
    id: "2",
    name: "Emily Chen",
    email: "emily.c@example.com",
    role: "editor",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: "3",
    name: "Maria Garcia",
    email: "maria.g@example.com",
    role: "editor",
    status: "active",
    lastActive: "5 hours ago",
  },
  {
    id: "4",
    name: "Lisa Thompson",
    email: "lisa.t@example.com",
    role: "viewer",
    status: "inactive",
    lastActive: "3 days ago",
  },
  {
    id: "5",
    name: "Jennifer Wilson",
    email: "jennifer.w@example.com",
    role: "viewer",
    status: "active",
    lastActive: "1 day ago",
  },
];

const userStats = [
  {
    title: "Total Team Members",
    value: "5",
    icon: UsersIcon,
    variant: "rose" as const,
  },
  {
    title: "Active Now",
    value: "3",
    icon: UserCheck,
    variant: "sage" as const,
  },
  {
    title: "Administrators",
    value: "1",
    icon: Shield,
    variant: "lavender" as const,
  },
  {
    title: "Pending Invites",
    value: "2",
    icon: Clock,
    variant: "default" as const,
  },
];

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user: User) => {
    toast({
      title: "Edit User",
      description: `Opening editor for ${user.name}`,
    });
  };

  const handleDeleteUser = (id: string) => {
    toast({
      title: "User Removed",
      description: "The user has been removed from the team.",
      variant: "destructive",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Team Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage admin and editor access for the dashboard
            </p>
          </div>
          <Button variant="rose" className="gap-2">
            <Plus className="h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {userStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <UserTable
          users={filteredUsers}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />

        {/* Role Description */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-light">
              <Shield className="h-5 w-5 text-rose-dark" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              Admin
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Full access to all features including user management, content, and settings.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender-light">
              <UsersIcon className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              Editor
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Can create, edit, and publish content. Cannot manage users or settings.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-light">
              <UserCheck className="h-5 w-5 text-sage-dark" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              Viewer
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Read-only access to view content and analytics. Cannot make changes.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Users;
