import { NavLink, useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  Baby,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { signOut } from "firebase/auth"; // Import signOut

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Content", path: "/content" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: Baby, label: "App Mothers", path: "/app-users" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [appName, setAppName] = useState("MAnSA");
  const [primaryColor, setPrimaryColor] = useState("#D88FA0");
  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState("viewer");

  useEffect(() => {
    // 1. Listen for App Settings (Name/Color)
    const unsubConfig = onSnapshot(doc(db, "app_config", "general"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.appName) setAppName(data.appName);
        if (data.primaryColor) setPrimaryColor(data.primaryColor);
      }
    });

    // 2. Fetch Logged-in Admin Details
    const fetchAdminDetails = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "admin_users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || "Admin User");
            setUserRole(userData.role || "viewer");
          }
        } catch (error) {
          console.error("Error fetching admin details:", error);
        }
      }
    };

    fetchAdminDetails();

    return () => unsubConfig();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          <img
            src="/newlogo.png"
            alt="App Logo"
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="font-display text-xl font-bold text-sidebar-foreground">
              {appName}
            </h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                // Apply Dynamic Color
                style={isActive ? {
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor
                } : {}}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                )}
              >
                <item.icon
                  className="h-5 w-5"
                  style={{ color: isActive ? primaryColor : "currentColor" }}
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section (NOW DYNAMIC) */}
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="text-sm font-semibold text-white">
                {/* Show first two initials of the name */}
                {userName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {userName} {/* Real Name */}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {userRole} {/* Real Role */}
              </p>
            </div>
          </div>

          {/* Working Logout Button */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}