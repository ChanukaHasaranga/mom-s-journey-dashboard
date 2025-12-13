import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db, secondaryAuth } from "@/firebase"; // Assuming secondaryAuth is set up for admin creation

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Change this line:
  currentRole: string; 
}

export function InviteUserDialog({ open, onOpenChange, currentRole }: InviteUserDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");

  const handleInvite = async () => {
    // 1. Validation
    if (!email || !name || !password) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    // 2. Permission Check (Super Admin Logic)
    if (role === 'admin' && currentRole !== 'superadmin') {
      toast({
        title: "Permission Denied",
        description: "Only Super Admins can create new Admins.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // 3. Create User in Firebase Auth
      // Note: Using secondaryAuth instance so we don't log out the current admin
      // If you don't have secondaryAuth, this will log you out. 
      // See note below code block.
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth || auth, email, password);
      const uid = userCredential.user.uid;

      // 4. Create User Document in Firestore
      await setDoc(doc(db, "admin_users", uid), {
        uid: uid,
        email: email,
        name: name,
        role: role, // admin, editor, viewer
        status: "active",
        createdAt: serverTimestamp(),
        lastActive: null,
      });

      toast({
        title: "User Created",
        description: `${name} has been added as a ${role}.`,
      });

      // Reset Form
      setEmail("");
      setName("");
      setPassword("");
      setRole("viewer");
      onOpenChange(false);

    } catch (error: any) {
      console.error(error);
      let msg = "Could not create user.";
      if (error.code === 'auth/email-already-in-use') msg = "Email is already registered.";
      if (error.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";

      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New Team Member</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Temporary Password</Label>
            <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                <SelectItem value="editor">Editor (Can edit content)</SelectItem>

                {/* Only Show Admin options if current user is Super Admin */}
                {currentRole === 'superadmin' && (
                  <>
                    <SelectItem value="admin">Admin (Manage Users)</SelectItem>
                    <SelectItem value="superadmin">Super Admin (Full Access)</SelectItem> {/* NEW OPTION */}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="rose" onClick={handleInvite} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}