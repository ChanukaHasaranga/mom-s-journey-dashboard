import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/firebase";
// Icons
import { 
  Search, Eye, Activity, Smile, HeartPulse, Footprints, Wind, BookOpen, Clock, Wifi, WifiOff, Star, Download, FileDown
} from "lucide-react";
// Charts
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";

// --- 1. DEFINE FEEDBACK MAPPING ---
const FEEDBACK_LABELS: Record<number, string> = {
  1: "Not useful at all 😞",
  2: "Slightly useful 😐",
  3: "Moderately useful 🙂",
  4: "Very useful 😀",
  5: "Extremely useful 🤩",
};

export default function UserActivityPage() {
  // --- STATE ---
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // --- FETCH USERS ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);
        
        const list = await Promise.all(snap.docs.map(async (d) => {
            const rootData = d.data();
            const profileRef = doc(db, `users/${d.id}/userdata/profile`);
            const profileSnap = await getDoc(profileRef);
            const profileData = profileSnap.exists() ? profileSnap.data() : {};

            return { 
                id: d.id, 
                ...rootData,
                ...profileData, 
                username: rootData.username || rootData.displayName || profileData.username || "Unknown"
            };
        }));

        setUsers(list);
        setFilteredUsers(list);
      } catch (e) {
        console.error("Error fetching users:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // --- SEARCH ---
  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = users.filter(u => 
      (u.patientid || "").toLowerCase().includes(lower) // Only search by ID now since Name is removed
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  // --- 1. EXPORT MAIN REGISTRY (ANONYMIZED) ---
  const downloadRegistryCSV = () => {
    // Define Headers (No Name, No Phone)
    const headers = ["Patient ID", "Education", "MOH Area", "Due Date"];
    
    // Convert Data to CSV Rows
    const rows = filteredUsers.map(u => {
        const dueDate = u.duedate && typeof u.duedate.toDate === 'function' 
            ? u.duedate.toDate().toLocaleDateString() 
            : (u.duedate ? new Date(u.duedate.seconds * 1000).toLocaleDateString() : "-");

        return [
            u.patientid || "N/A",
            `"${u.education || "-"}"`,
            `"${u.MOHArea || "-"}"`,
            dueDate,
        ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    triggerDownload(csvContent, `registry_export_${new Date().toISOString().slice(0,10)}.csv`);
  };

  // --- 2. EXPORT INDIVIDUAL ACTIVITY LOG ---
  const downloadActivityCSV = () => {
    if (!selectedUser || userActivities.length === 0) return;

    const headers = ["Date", "Time", "Activity Type", "Details"];
    
    const rows = userActivities.map(act => {
        const dateObj = act.time && typeof act.time.toDate === 'function' ? act.time.toDate() : null;
        const dateStr = dateObj ? dateObj.toLocaleDateString() : "-";
        const timeStr = dateObj ? dateObj.toLocaleTimeString() : "-";
        // Escape quotes in details
        const safeDetails = `"${(act.details || "").replace(/"/g, '""')}"`;

        return [dateStr, timeStr, act.type, safeDetails].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    triggerDownload(csvContent, `${selectedUser.patientid}_activity_log.csv`);
  };

  // Helper to trigger browser download
  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FETCH DETAILS ---
  const handleViewUser = async (user: any) => {
    setSelectedUser(user);
    setFetchingDetails(true); 
    setUserActivities([]);
    
    const uid = user.id;
    const bucket: any[] = [];
    
    const newStats: any = { 
        "Kick": 0, "Contraction": 0, "Breathing": 0, 
        "Mood": 0, "Psychoeducation": 0, "Visualization": 0, 
        "Feedback": 0,
        "OnlineTime": 0, "OfflineTime": 0, "TotalTime": 0 
    };

    try {
      const [kicks, contractions, breathing, moods, chapters, vizSessions, vizLogs, appSessions] = await Promise.all([
          getDocs(collection(db, `users/${uid}/kicks`)),
          getDocs(collection(db, `users/${uid}/contractions`)),
          getDocs(collection(db, `users/${uid}/mindfulexcercie/breathing/breathing_sessions`)),
          getDocs(collection(db, `users/${uid}/moods`)),
          getDocs(collection(db, `users/${uid}/readchapters/psychoeducation/chapters`)),
          getDocs(collection(db, `users/${uid}/mindfulexcercie/visualization/visualization_sessions`)),
          getDocs(query(collection(db, "activity_logs"), where("uid", "==", uid), where("activityType", "==", "Visualization"))),
          getDocs(collection(db, `users/${uid}/app_sessions`))
      ]);

      // Activities
      kicks.forEach(d => bucket.push(normalize(d, "Kick", <Footprints size={16}/>)));
      contractions.forEach(d => bucket.push(normalize(d, "Contraction", <HeartPulse size={16}/>)));
      breathing.forEach(d => bucket.push(normalize(d, "Breathing", <Wind size={16}/>)));
      moods.forEach(d => bucket.push(normalize(d, "Mood", <Smile size={16}/>)));
      
      chapters.forEach(doc => {
        const d = doc.data();
        const title = doc.id.replace("chapter", "Chapter ");
        let details = `Read ${title}`;
        if (d.rating) {
            newStats.Feedback++; 
            const label = FEEDBACK_LABELS[d.rating] || `${d.rating} Stars`; 
            details += ` • Feedback: ${label}`; 
        }
        bucket.push(normalize(doc, "Psychoeducation", <BookOpen size={16}/>, details));
      });
vizSessions.forEach(d => {
          // Pass "Visualization" type so formatDetails handles it correctly
          bucket.push(normalize(d, "Visualization", <Eye size={16}/>));
      });
      vizLogs.forEach(d => {
          bucket.push(normalize(d, "Visualization", <Eye size={16}/>));
      });

      appSessions.forEach(doc => {
          const d = doc.data();
          const seconds = d.durationSeconds || 0;
          const status = d.status || 'online';
          if (status === 'online') newStats.OnlineTime += seconds;
          else newStats.OfflineTime += seconds;
          newStats.TotalTime += seconds;
      });

      bucket.forEach(i => {
        if (newStats[i.type] !== undefined) newStats[i.type]++;
      });

      bucket.sort((a, b) => {
          const tA = a.time?.toMillis ? a.time.toMillis() : 0;
          const tB = b.time?.toMillis ? b.time.toMillis() : 0;
          return tB - tA; 
      });

      setUserActivities(bucket);
      setUserStats(newStats);

    } catch (e) {
      console.error("Error loading details", e);
    } finally {
        setFetchingDetails(false); 
    }
  };

  const normalize = (doc: any, type: string, icon: JSX.Element, customDetail?: string) => {
    const d = doc.data();
    const time = d.startTime || d.createdAt || d.timestamp || d.completedAt || d.date;
    return {
      id: doc.id,
      type, icon, time,
      details: customDetail || formatDetails(type, d)
    };
  };

  const formatDetails = (type: string, d: any) => {
    const fmtTime = (t: any) => {
        if (t && typeof t.toDate === 'function') {
            return t.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        return '';
    };

    if (type === "Kick") return `${d.kickCount || 0} kicks recorded`;
    if (type === "Contraction") return `Duration: ${d.durationSeconds || 0}s`;
    if (type === "Breathing") {
       if (d.durationMs !== undefined && d.durationMs !== null) {
      const mins = Math.floor((d.durationMs)/60000);
      const secs = Math.floor(((d.durationMs) % 60000) / 1000);
      return `Session: ${mins}m ${secs}s`;
 }
 // 2. Fallback for older entries
 return d.details || "Session completed";
    }
if (type === "Visualization") {
        if (d.durationMs !== undefined && d.durationMs !== null) {
             const mins = Math.floor((d.durationMs)/60000);
             const secs = Math.floor(((d.durationMs) % 60000) / 1000);
             return `Session: ${mins}m ${secs}s`;
        }
        return d.details || "Session completed";
    }    if (type === "Mood") return `${d.emoji || ''} ${d.emotion || ''}`;
    return "";
  };

  const formatTimeDuration = (seconds: number) => {
      if (!seconds) return "0m";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">User Activity</h1>
            <p className="text-muted-foreground">Monitor individual user progress and health metrics.</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search Patient ID..." 
                  className="pl-8" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>

             <Button variant="outline" onClick={downloadRegistryCSV} className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
             </Button>
          </div>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader><CardTitle>Registered Mothers ({filteredUsers.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  {/* REMOVED NAME COLUMN */}
                  <TableHead>Education</TableHead>
                  <TableHead>MOH Area</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   [...Array(5)].map((_, i) => (
                     <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                     </TableRow>
                   ))
                ) : filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono font-medium">{u.patientid || "N/A"}</TableCell>
                    {/* REMOVED NAME CELL */}
                    <TableCell className="capitalize">{u.education || "-"}</TableCell>
                    <TableCell>{u.MOHArea || "-"}</TableCell>
                    <TableCell>
                        {u.duedate && typeof u.duedate.toDate === 'function' 
                            ? u.duedate.toDate().toLocaleDateString() 
                            : (u.duedate ? new Date(u.duedate.seconds * 1000).toLocaleDateString() : "-")
                        }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => handleViewUser(u)} className="hover:text-rose-600 hover:bg-rose-50">
                        <Eye className="h-4 w-4 mr-2" /> View Activity
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* DIALOG */}
        <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 border-b bg-slate-50/50 flex flex-row justify-between items-center">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-2xl font-display flex items-center gap-3">
                    <span className="bg-rose-100 text-rose-600 p-3 rounded-full"><Activity size={24}/></span>
                    <div>
                        User Activity Log
                        <div className="flex gap-4 text-muted-foreground text-sm font-normal mt-1">
                            <span>ID: <span className="font-mono text-slate-700">{selectedUser?.patientid}</span></span>
                            <span>•</span>
                            <span>Edu: {selectedUser?.education || "-"}</span>
                        </div>
                    </div>
                </DialogTitle>
              </div>
              
              {/* Added Export Button inside Dialog for specific user timeline */}
              <Button size="sm" variant="secondary" onClick={downloadActivityCSV} disabled={fetchingDetails}>
                 <FileDown className="h-4 w-4 mr-2" /> Export Log
              </Button>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto grid md:grid-cols-12 bg-slate-50/30">
              {fetchingDetails ? (
                 <div className="md:col-span-12 p-6 h-full flex flex-col gap-6">
                    <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl bg-slate-200" />)}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl bg-slate-200" />)}
                    </div>
                    <Skeleton className="h-[200px] w-full rounded-xl bg-slate-200" />
                 </div>
              ) : (
                <>
                  {/* LEFT: STATS */}
                  <div className="md:col-span-7 p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                        <StatBox label="Total Time" value={formatTimeDuration(userStats.TotalTime)} icon={Clock} color="bg-slate-100 text-slate-700" />
                        <StatBox label="Online" value={formatTimeDuration(userStats.OnlineTime)} icon={Wifi} color="bg-green-100 text-green-600" />
                        <StatBox label="Offline" value={formatTimeDuration(userStats.OfflineTime)} icon={WifiOff} color="bg-gray-100 text-gray-500" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <StatBox label="Kicks" value={userStats["Kick"]} icon={Footprints} color="bg-orange-100 text-orange-600" />
                      <StatBox label="Breathing" value={userStats["Breathing"]} icon={Wind} color="bg-blue-100 text-blue-600" />
                      <StatBox label="Moods" value={userStats["Mood"]} icon={Smile} color="bg-yellow-100 text-yellow-600" />
                      <StatBox label="Contractions" value={userStats["Contraction"]} icon={HeartPulse} color="bg-red-100 text-red-600" />
                      <StatBox label="Feedback" value={userStats["Feedback"]} icon={Star} color="bg-indigo-100 text-indigo-600" />
                      <StatBox label="Visualizations" value={userStats["Visualization"]} icon={Eye} color="bg-emerald-100 text-emerald-600" />
                    </div>

                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Usage Distribution</CardTitle></CardHeader>
                      <CardContent className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Kicks', val: userStats['Kick'] || 0, fill: '#f97316' },
                            { name: 'Breath', val: userStats['Breathing'] || 0, fill: '#3b82f6' },
                            { name: 'Mood', val: userStats['Mood'] || 0, fill: '#eab308' },
                            { name: 'Edu', val: userStats['Psychoeducation'] || 0, fill: '#9333ea' },
                            { name: 'Fback', val: userStats['Feedback'] || 0, fill: '#4f46e5' },
                          ]}>
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                              <Cell fill="#f97316" /><Cell fill="#3b82f6" /><Cell fill="#eab308" /><Cell fill="#9333ea" /><Cell fill="#4f46e5" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* RIGHT: TIMELINE */}
                  <div className="md:col-span-5 bg-white border-l border-slate-200 h-full flex flex-col">
                    <div className="p-4 border-b bg-white z-10 sticky top-0">
                        <h3 className="font-semibold text-slate-800">History Timeline</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-0">
                        {userActivities.length === 0 ? (
                          <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-3">
                            <Activity className="h-10 w-10 opacity-20" />
                            <p>No activity recorded yet.</p>
                          </div>
                        ) : (
                          userActivities.map((act, index) => (
                            <div key={act.id || index} className="relative pl-8 pb-8 border-l-2 border-slate-100 last:border-0 last:pb-0">
                              <div className="absolute -left-[11px] top-0 h-6 w-6 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-xs shadow-sm z-10">
                                {act.icon}
                              </div>
                              <div className="flex flex-col gap-1 -mt-1">
                                <div className="flex justify-between items-start">
                                    <span className="font-semibold text-sm text-slate-700">{act.type}</span>
                                    <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                        {act.time && typeof act.time.toDate === 'function' ? act.time.toDate().toLocaleDateString() : "N/A"}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">{act.details}</p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                    {act.time && typeof act.time.toDate === 'function' ? act.time.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}

function StatBox({ label, value, icon: Icon, color }: any) {
  const bgClass = color.split(' ')[0];
  const textClass = color.split(' ')[1];
  return (
    <div className={`p-4 rounded-xl border-2 border-transparent bg-white shadow-sm flex flex-col items-center justify-center text-center hover:border-slate-100 transition-all`}>
      <div className={`p-2 rounded-full ${bgClass} ${textClass} mb-2`}>
        <Icon size={18} />
      </div>
      <span className="text-xl font-bold text-slate-800">{value || 0}</span>
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{label}</span>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 ${className}`} />;
}