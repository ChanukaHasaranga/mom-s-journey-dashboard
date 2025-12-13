import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppUser } from "@/pages/AppUsers";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, BookOpen, Globe, Baby, Hash } from "lucide-react";

interface Props {
  user: AppUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppUserDetailsDialog({ user, open, onOpenChange }: Props) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
            <div className="p-2 bg-rose-100 rounded-full text-rose-600">
               <Baby className="h-5 w-5" />
            </div>
            {user.patientid}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">MOH Area</span>
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-rose-500" />
                {user.profile?.mohArea}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Due Date</span>
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-rose-500" />
                {user.profile?.dueDate}
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-4">
             <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" /> Cuddles ID (Internal)
              </span>
              <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{user.profile?.cuddles_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Education
              </span>
              <span className="font-medium">{user.profile?.education}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" /> Preferred Language
              </span>
              <Badge variant="secondary">{user.profile?.language}</Badge>
            </div>
             <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Registered On</span>
              <span className="text-sm">
                 {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}