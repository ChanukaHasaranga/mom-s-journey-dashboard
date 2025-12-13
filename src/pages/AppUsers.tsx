import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, User, Eye, Trash2, Loader2, Baby } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, deleteDoc, doc, query, orderBy, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { AppUserDetailsDialog } from "@/components/dashboard/AppUserDetailsDialog";
import { AddAppUserDialog } from "@/components/dashboard/AddAppUserDialog";

// Interface matching your Flutter data structure
export interface AppUser {
  uid: string;
  patientid: string; 
  displayName?: string;
  createdAt?: any;
  profile?: {
    mohArea?: string;
    dueDate?: string;
    education?: string;
    language?: string;
    cuddles_id?: number;
  };
}

const AppUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Dialog States
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { toast } = useToast();

  // Check Admin Role
  useEffect(() => {
    const checkRole = async () => {
      if (auth.currentUser) {
        const docSnap = await getDoc(doc(db, "admin_users", auth.currentUser.uid));
        if (docSnap.exists() && (docSnap.data().role === 'admin' ||docSnap.data().role === 'superadmin' )) {
          setIsAdmin(true);
        }
      }
    };
    checkRole();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 1. Get all users
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc")); 
      const snapshot = await getDocs(q);

      const userList: AppUser[] = [];

      // 2. Fetch profile sub-collection for each user
      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data();
        const uid = userDoc.id;

        // Flutter path: users/{uid}/userdata/profile
        const profileSnap = await getDoc(doc(db, `users/${uid}/userdata/profile`));
        const profileData = profileSnap.exists() ? profileSnap.data() : {};

        userList.push({
          uid: uid,
          patientid: userData.patientid || "Unknown",
          displayName: userData.displayName || "Calm Mama User",
          createdAt: userData.createdAt,
          profile: {
            mohArea: profileData.MOHArea || "N/A",
            dueDate: profileData.duedate ? new Date(profileData.duedate.seconds * 1000).toLocaleDateString() : "N/A",
            education: profileData.education || "N/A",
            language: profileData.language || "English",
            cuddles_id: profileData.cuddles_id,
          }
        });
      }

      setUsers(userList);
    } catch (error) {
      console.error("Error fetching app users:", error);
      toast({ title: "Error", description: "Failed to load mothers list.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!isAdmin) {
        toast({ title: "Permission Denied", description: "Only admins can delete users.", variant: "destructive" });
        return;
    }
    if (confirm("Are you sure? This will delete the mother's account data permanently.")) {
      try {
        await deleteDoc(doc(db, "users", uid));
        setUsers(users.filter(u => u.uid !== uid));
        toast({ title: "User Deleted", description: "User removed successfully." });
      } catch (error) {
        toast({ title: "Error", description: "Could not delete user.", variant: "destructive" });
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.patientid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.profile?.mohArea?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">App Users</h1>
            <p className="mt-1 text-muted-foreground">Manage registered mothers (Calm Mama App)</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsAddOpen(true)} className="bg-rose-500 hover:bg-rose-600 gap-2 text-white">
                <Plus className="h-4 w-4" /> Add Mother
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by Patient ID or MOH Area..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>MOH Area</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Lang</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" /> Loading data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.uid} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                          <Baby className="h-4 w-4" />
                        </div>
                        {user.patientid}
                      </div>
                    </TableCell>
                    <TableCell>{user.profile?.mohArea}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal border-rose-200 text-rose-700 bg-rose-50">
                        {user.profile?.dueDate}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{user.profile?.language}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setSelectedUser(user); setIsViewOpen(true); }}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        {isAdmin && (
                            <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(user.uid)}
                            className="hover:text-red-600 hover:bg-red-50"
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialogs */}
        <AppUserDetailsDialog 
          user={selectedUser} 
          open={isViewOpen} 
          onOpenChange={setIsViewOpen} 
        />
        
        <AddAppUserDialog 
          open={isAddOpen} 
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) fetchUsers(); // Refresh list
          }} 
        />
      </div>
    </DashboardLayout>
  );
};

export default AppUsers;