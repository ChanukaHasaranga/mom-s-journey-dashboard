import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { collection, doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { getDatabase, ref, get, set } from "firebase/database"; // Realtime DB for ID counter

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAppUserDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");
  const [mohArea, setMohArea] = useState("");
  const [education, setEducation] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [language, setLanguage] = useState("English");

  const handleCreate = async () => {
    if(!patientId || !password || !mohArea || !dueDate) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Get Latest ID from Realtime DB (Matching Flutter Logic)
      // Note: If you don't have Realtime DB set up in your web project config, this part might fail.
      // If so, you can generate a random ID or skip this step.
      // Assuming RTDB is init:
      /* const rtdb = getDatabase();
         const countRef = ref(rtdb, 'cuddles/users/latestid');
         const snap = await get(countRef);
         let newId = (snap.val() || 0) + 1;
         await set(countRef, newId); 
      */
      const dummyId = Math.floor(Math.random() * 10000); // Fallback if RTDB not used

      // 2. Create Auth/User Doc
      const newUserRef = doc(collection(db, "users"));
      const uid = newUserRef.id;

      const now = serverTimestamp();

      // Main Doc
      await setDoc(newUserRef, {
        uid: uid,
        displayName: patientId, // Using patientID as name
        patientid: patientId,
        password: password,
        createdAt: now,
        lastActive: now,
        platform: 'Web Admin Entry',
      });

      // Profile Doc (Sub-collection)
      await setDoc(doc(db, `users/${uid}/userdata/profile`), {
        patientid: patientId,
        language: language,
        duedate: new Date(dueDate), // Firestore Timestamp conversion happens automatically usually, or use Timestamp.fromDate()
        education: education,
        MOHArea: mohArea,
        cuddles_id: dummyId,
        registeredDate: now,
        updatedAt: now,
        password: password
      });

      toast({ title: "Success", description: "Mother account created successfully." });
      onOpenChange(false);
      
      // Reset
      setPatientId(""); setPassword(""); setMohArea(""); setDueDate("");

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Mother</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Patient ID (NIC)</Label>
            <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="e.g. 1995..." />
          </div>
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="App Login Password" />
          </div>
          <div className="grid gap-2">
            <Label>MOH Area</Label>
            <Input value={mohArea} onChange={(e) => setMohArea(e.target.value)} placeholder="e.g. Kandy" />
          </div>
          <div className="grid gap-2">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label>Education</Label>
                <Select onValueChange={setEducation}>
                <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="O/L">O/L</SelectItem>
                    <SelectItem value="A/L">A/L</SelectItem>
                    <SelectItem value="Degree">Degree</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label>Language</Label>
                <Select onValueChange={setLanguage} defaultValue="English">
                <SelectTrigger><SelectValue placeholder="Lang" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Sinhala">Sinhala</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading} className="bg-rose-500 hover:bg-rose-600 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}