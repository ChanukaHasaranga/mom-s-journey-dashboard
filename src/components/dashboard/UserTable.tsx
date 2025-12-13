import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical, Shield, Edit, Trash2, Lock, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "editor" | "viewer" | string;
  status: "active" | "inactive";
  lastActive: string;
}

interface UserTableProps {
  users: User[];
  onEditUser?: (user: User) => void;
  onDeleteUser?: (id: string) => void;
  onChangeRole?: (id: string, role: User["role"]) => void;
}

// 1. Updated Role Colors: Super Admin gets Purple to match the stats card
const roleStyles: Record<string, string> = {
  superadmin: "bg-purple-100 text-purple-700 border-purple-200", 
  admin: "bg-rose-100 text-rose-700 border-rose-200",
  editor: "bg-indigo-100 text-indigo-700 border-indigo-200",
  viewer: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusStyles = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
};

export function UserTable({
  users,
  onEditUser,
  onDeleteUser,
}: UserTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-semibold text-foreground">User</TableHead>
            <TableHead className="font-semibold text-foreground">Role</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Last Active</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className="border-border transition-colors hover:bg-muted/50"
              >
                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-medium border border-rose-200">
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                        : "UN"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Role Badge */}
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
                      roleStyles[user.role] || "bg-gray-100 text-gray-700"
                    )}
                  >
                    {/* Icon Logic */}
                    {user.role === "superadmin" && <Lock className="h-3 w-3" />}
                    {user.role === "admin" && <Shield className="h-3 w-3" />}
                    {user.role === "editor" && <Edit className="h-3 w-3" />}
                    {user.role === "viewer" && <Eye className="h-3 w-3" />}

                    {/* Text Logic: Add space for Super Admin */}
                    {user.role === "superadmin"
                      ? "Super Admin"
                      : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                      statusStyles[user.status]
                    )}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </TableCell>

                {/* Last Active */}
                <TableCell className="text-muted-foreground text-sm">
                  {user.lastActive}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditUser?.(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteUser?.(user.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}