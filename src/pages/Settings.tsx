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
  Palette,
  Smartphone,
  Mail,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

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
                  <Input id="appName" defaultValue="BloomMind" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appVersion">Current Version</Label>
                  <Input id="appVersion" defaultValue="2.4.1" disabled />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="appDescription">App Description</Label>
                  <Textarea
                    id="appDescription"
                    defaultValue="A mindfulness and mental wellness companion for expecting mothers."
                    rows={3}
                  />
                </div>
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
                    <div className="h-10 w-10 rounded-lg gradient-rose shadow-soft" />
                    <Input defaultValue="#D88FA0" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg gradient-sage shadow-soft" />
                    <Input defaultValue="#8FBE9E" className="flex-1" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Email Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">New User Signups</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new users join
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Weekly Reports</p>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly analytics summary
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">User Feedback</p>
                      <p className="text-sm text-muted-foreground">
                        Get alerts for new user feedback
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Mobile App */}
          <TabsContent value="app" className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Push Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">Daily Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Send daily wellness check-in reminders
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">
                      Milestone Celebrations
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Celebrate pregnancy milestones with users
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">New Content Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Notify users about new articles and guides
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                App Store Links
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="iosLink">iOS App Store URL</Label>
                  <Input
                    id="iosLink"
                    placeholder="https://apps.apple.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="androidLink">Google Play URL</Label>
                  <Input
                    id="androidLink"
                    placeholder="https://play.google.com/..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security */}
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
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">
                      Auto logout after inactivity
                    </p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="rose" size="lg" className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
