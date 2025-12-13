import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { User } from "./UserTable";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRole: string; // Passed from parent
}

export function EditUserDialog({ user, open, onOpenChange, currentRole }: EditUserDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setRole(user.role);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // SECURITY CHECK:
    // If the new role is 'superadmin' but the current user IS NOT 'superadmin', block it.
    if (role === 'superadmin' && currentRole !== 'superadmin') {
        toast({ 
            title: "Permission Denied", 
            description: "Only a Super Admin can create another Super Admin.", 
            variant: "destructive" 
        });
        return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "admin_users", user.id), {
        name: name,
        role: role,
      });
      toast({ title: "User Updated", description: "Changes saved successfully." });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={user.email} disabled className="bg-slate-100 text-slate-500" />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                
                {/* CRITICAL FIX: 
                   Only render this option if the logged-in user is a Super Admin.
                   This prevents regular Admins from seeing/selecting it.
                */}
                {currentRole === 'superadmin' && (
                  <SelectItem value="superadmin" className="text-purple-600 font-medium">
                    Super Admin
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-rose-500 hover:bg-rose-600">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}