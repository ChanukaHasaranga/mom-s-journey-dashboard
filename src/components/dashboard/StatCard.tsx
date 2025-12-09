import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "rose" | "sage" | "lavender" | "default";
}

const variantStyles = {
  rose: "bg-rose-light border-rose/20",
  sage: "bg-sage-light border-sage/20",
  lavender: "bg-lavender-light border-lavender/20",
  default: "bg-card border-border",
};

const iconVariantStyles = {
  rose: "bg-rose/10 text-rose-dark",
  sage: "bg-sage/10 text-sage-dark",
  lavender: "bg-lavender/10 text-accent-foreground",
  default: "bg-muted text-muted-foreground",
};

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 shadow-card transition-all duration-300 hover:shadow-hover animate-slide-up",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "text-sm font-medium",
                changeType === "positive" && "text-sage-dark",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            iconVariantStyles[variant]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
    </div>
  );
}
