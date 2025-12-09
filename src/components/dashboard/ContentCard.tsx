import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentCardProps {
  id: string;
  title: string;
  category: string;
  status: "published" | "draft" | "scheduled";
  lastUpdated: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPreview?: (id: string) => void;
}

const statusStyles = {
  published: "bg-sage-light text-sage-dark",
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-lavender-light text-accent-foreground",
};

export function ContentCard({
  id,
  title,
  category,
  status,
  lastUpdated,
  onEdit,
  onDelete,
  onPreview,
}: ContentCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusStyles[status]
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className="text-xs text-muted-foreground">{category}</span>
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPreview?.(id)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hover accent */}
      <div className="absolute bottom-0 left-0 h-1 w-0 gradient-rose transition-all duration-300 group-hover:w-full" />
    </div>
  );
}
