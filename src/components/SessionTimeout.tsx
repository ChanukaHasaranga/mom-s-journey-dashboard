import { useEffect, useState, useRef } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function SessionTimeout() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeoutLimit, setTimeoutLimit] = useState<number>(30 * 60 * 1000); // Default 30 mins
  const lastActivity = useRef<number>(Date.now());

  // 1. Fetch Timeout Setting from Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "app_config", "general"), (doc) => {
      if (doc.exists()) {
        const mins = parseInt(doc.data().sessionTimeout || "30");
        setTimeoutLimit(mins * 60 * 1000); // Convert mins to milliseconds
      }
    });
    return () => unsub();
  }, []);

  // 2. Track User Activity
  useEffect(() => {
    const updateActivity = () => {
      lastActivity.current = Date.now();
    };

    // Events that count as "activity"
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("scroll", updateActivity);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, []);

  // 3. Check for Timeout every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only check if user is logged in
      if (!auth.currentUser) return;

      const now = Date.now();
      const inactiveTime = now - lastActivity.current;

      if (inactiveTime > timeoutLimit) {
        handleLogout();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [timeoutLimit]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });
  };

  return null; // This component doesn't render anything visibly
}