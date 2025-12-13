import { useState, useEffect } from "react";
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
import { Plus, Search, Users as UsersIcon, UserCheck, Shield, Clock, Loader2, Lock } from "lucide-react"; // Added Lock icon
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { InviteUserDialog } from "@/components/dashboard/InviteUserDialog";
import { EditUserDialog } from "@/components/dashboard/EditUserDialog";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
const [currentUserRole, setCurrentUserRole] = useState<string>("viewer");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const checkRole = async () => {
      if (auth.currentUser) {
        const docSnap = await getDoc(doc(db, "admin_users", auth.currentUser.uid));
        if (docSnap.exists()) {
          setCurrentUserRole(docSnap.data().role || "viewer");
        }
      }
    };
    checkRole();

    const unsub = onSnapshot(collection(db, "admin_users"), (snapshot) => {
      const fetchedUsers: User[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unknown",
          email: data.email || "",
          role: data.role || "viewer",
          status: data.status || "active",
          lastActive: data.lastActive ? new Date(data.lastActive.toDate()).toLocaleString() : "Never",
        };
      });
      setUsers(fetchedUsers);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // UPDATED: Count Admins AND Super Admins together
  const userStats = [
    { title: "Total Team Members", value: users.length.toString(), icon: UsersIcon, variant: "rose" as const },
    { title: "Active Now", value: users.filter(u => u.status === 'active').length.toString(), icon: UserCheck, variant: "sage" as const },
    { title: "Admins", value: users.filter(u => u.role === 'admin' || u.role === 'superadmin').length.toString(), icon: Shield, variant: "lavender" as const },
    { title: "Editors", value: users.filter(u => u.role === 'editor').length.toString(), icon: Clock, variant: "default" as const },
  ];

  const handleEditUser = (user: User) => {
    if (currentUserRole !== 'superadmin' && currentUserRole !== 'admin') {
      toast({ title: "Permission Denied", description: "You cannot edit users.", variant: "destructive" });
      return;
    }
    
    // Only Super Admin can edit other Admins/Super Admins
    if ((user.role === 'admin' || user.role === 'superadmin') && currentUserRole !== 'superadmin') {
        toast({ title: "Permission Denied", description: "Only Super Admin can edit other Admins.", variant: "destructive" });
        return;
    }

    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleDeleteUser = async (id: string, targetRole: string) => {
    if (currentUserRole !== 'admin' && currentUserRole !== 'superadmin') {
      toast({ title: "Permission Denied", description: "Only admins can remove users.", variant: "destructive" });
      return;
    }

    // UPDATED: Check targetRole to protect Super Admins
    if ((targetRole === 'admin' || targetRole === 'superadmin') && currentUserRole !== 'superadmin') {
      toast({ title: "Permission Denied", description: "Only Super Admin can remove other Admins.", variant: "destructive" });
      return;
    }

    if (auth.currentUser && auth.currentUser.uid === id) {
      toast({ title: "Action Not Allowed", description: "You cannot delete your own account.", variant: "destructive" });
      return;
    }

    if (confirm("Are you sure? This will revoke their access immediately.")) {
      try {
        await updateDoc(doc(db, "admin_users", id), {
          status: "inactive",
          role: "viewer"
        });
        toast({
          title: "User Deactivated",
          description: "Access revoked.",
          variant: "destructive",
        });
      } catch (e) {
        console.error(e);
        toast({ title: "Error", description: "Could not deactivate user.", variant: "destructive" });
      }
    }
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Team Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage access levels ({currentUserRole})
            </p>
          </div>

          {(currentUserRole === 'admin' || currentUserRole === 'superadmin') && (
            <Button variant="rose" className="gap-2" onClick={() => setIsInviteOpen(true)}>
              <Plus className="h-4 w-4" />
              Invite User
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {userStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

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
              <SelectItem value="superadmin">Super Admin</SelectItem> {/* Added option */}
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* UPDATED: Pass targetRole to handleDeleteUser */}
        <UserTable
          users={filteredUsers}
          onEditUser={handleEditUser}
          onDeleteUser={(id) => {
             const targetUser = users.find(u => u.id === id);
             if (targetUser) handleDeleteUser(id, targetUser.role);
          }}
        />

        {/* Added Role Legend for Super Admin */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
           <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Super Admin</h3>
            <p className="mt-2 text-sm text-muted-foreground">Manage Config & Admins.</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-light">
              <Shield className="h-5 w-5 text-rose-dark" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Admin</h3>
            <p className="mt-2 text-sm text-muted-foreground">Manage Editors & App Users.</p>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender-light">
              <UsersIcon className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Editor</h3>
            <p className="mt-2 text-sm text-muted-foreground">Can edit content only.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-light">
              <UserCheck className="h-5 w-5 text-sage-dark" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Viewer</h3>
            <p className="mt-2 text-sm text-muted-foreground">Read-only access.</p>
          </div>
        </div>

        <InviteUserDialog
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          currentRole={currentUserRole}
        />

        <EditUserDialog
          user={selectedUser}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          currentRole={currentUserRole}
        />

      </div>
    </DashboardLayout>
  );
};

export default UsersPage;