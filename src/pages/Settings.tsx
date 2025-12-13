import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Globe,
  Lock,
  Smartphone,
  Mail,
  Save,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // --- STATE FOR SETTINGS ---
  const [appName, setAppName] = useState("MAnSA");
  const [appDesc, setAppDesc] = useState("A mindfulness and mental wellness companion.");
  const [primaryColor, setPrimaryColor] = useState("#D88FA0");
  const [secondaryColor, setSecondaryColor] = useState("#8FBE9E");
  // NEW: Session Timeout State (Default 30 mins)
  const [sessionTimeout, setSessionTimeout] = useState("30");

  // 1. Fetch Settings on Load
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, "app_config", "general");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAppName(data.appName || "MAnSA");
          setAppDesc(data.appDesc || "");
          setPrimaryColor(data.primaryColor || "#D88FA0");
          setSecondaryColor(data.secondaryColor || "#8FBE9E");
          // Fetch timeout
          if (data.sessionTimeout) setSessionTimeout(data.sessionTimeout);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setFetching(false);
      }
    };
    loadSettings();
  }, []);

  // 2. Save Settings to Firebase
  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "app_config", "general"), {
        appName,
        appDesc,
        primaryColor,
        secondaryColor,
        sessionTimeout, // Save the timeout value
      }, { merge: true });

      toast({
        title: "Settings Saved",
        description: `Dashboard updated. Session timeout set to ${sessionTimeout} minutes.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Configure your dashboard and app preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="app" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile App
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                App Information
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appName">App Name</Label>
                  <Input 
                    id="appName" 
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appVersion">Current Version</Label>
                  <Input id="appVersion" defaultValue="2.4.1" disabled />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="appDescription">App Description</Label>
                  <Textarea
                    id="appDescription"
                    value={appDesc}
                    onChange={(e) => setAppDesc(e.target.value)}
                    rows={3}
                  />
                </div>
                {/* Timezone/Language kept as UI only for now */}
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      <SelectItem value="gmt">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Theme & Branding
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg shadow-soft border" 
                      style={{ backgroundColor: primaryColor }}
                    />
                    <Input 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg shadow-soft border"
                      style={{ backgroundColor: secondaryColor }} 
                    />
                    <Input 
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications & Mobile App Tabs (No Changes Needed) */}
          <TabsContent value="notifications" className="space-y-6">
             <div className="p-4 text-muted-foreground">Notification settings (UI Only)</div>
          </TabsContent>
          
          <TabsContent value="app" className="space-y-6">
             <div className="p-4 text-muted-foreground">Mobile App settings (UI Only)</div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Authentication
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts (Coming Soon)
                    </p>
                  </div>
                  <Switch disabled />
                </div>
                
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">
                      Auto logout after inactivity
                    </p>
                  </div>
                  <Select 
                    value={sessionTimeout} 
                    onValueChange={setSessionTimeout}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute (Test)</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button 
            variant="rose" 
            size="lg" 
            className="gap-2" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;