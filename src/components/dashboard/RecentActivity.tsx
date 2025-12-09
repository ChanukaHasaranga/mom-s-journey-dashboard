import { cn } from "@/lib/utils";
import { UserPlus, FileEdit, Trash, MessageCircle, Heart } from "lucide-react";

interface Activity {
  id: string;
  type: "user_joined" | "content_updated" | "content_deleted" | "feedback" | "milestone";
  message: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityIcons = {
  user_joined: UserPlus,
  content_updated: FileEdit,
  content_deleted: Trash,
  feedback: MessageCircle,
  milestone: Heart,
};

const activityStyles = {
  user_joined: "bg-sage-light text-sage-dark",
  content_updated: "bg-lavender-light text-accent-foreground",
  content_deleted: "bg-destructive/10 text-destructive",
  feedback: "bg-rose-light text-rose-dark",
  milestone: "bg-rose-light text-rose-dark",
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-xl font-semibold text-foreground mb-6">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  activityStyles[activity.type]
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
