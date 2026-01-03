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
import { 
  Search, Eye, Activity, Smile, HeartPulse, Footprints, Wind, BookOpen 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";

export default function UserActivityPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // --- 1. FETCH ALL USERS ---
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

  // --- 2. SEARCH FILTER ---
  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = users.filter(u => 
      (u.username || "").toLowerCase().includes(lower) || 
      (u.patientid || "").toLowerCase().includes(lower)
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  // --- 3. FETCH DETAILED ACTIVITY ---
  const handleViewUser = async (user: any) => {
    setSelectedUser(user);
    setFetchingDetails(true);
    setUserActivities([]);
    
    const uid = user.id;
    const bucket: any[] = [];

    try {
      // Fetch from all relevant collections
      // Note: We added the specific path for visualization sessions here
      const [kicks, contractions, breathing, moods, chapters, vizSessions, vizLogs] = await Promise.all([
          getDocs(collection(db, `users/${uid}/kicks`)),
          getDocs(collection(db, `users/${uid}/contractions`)),
          getDocs(collection(db, `users/${uid}/mindfulexcercie/breathing/breathing_sessions`)), // Note spelling 'mindfulexcercie' matches Flutter
          getDocs(collection(db, `users/${uid}/moods`)),
          getDocs(collection(db, `users/${uid}/readchapters/psychoeducation/chapters`)),
          // NEW: Fetch from the user's specific visualization sub-collection
          getDocs(collection(db, `users/${uid}/mindfulexcercie/visualization/visualization_sessions`)),
          // Keep this for backward compatibility if you used global logs
          getDocs(query(collection(db, "activity_logs"), where("uid", "==", uid), where("activityType", "==", "Visualization")))
      ]);

      kicks.forEach(d => bucket.push(normalize(d, "Kick", <Footprints size={16}/>)));
      contractions.forEach(d => bucket.push(normalize(d, "Contraction", <HeartPulse size={16}/>)));
      breathing.forEach(d => bucket.push(normalize(d, "Breathing", <Wind size={16}/>)));
      moods.forEach(d => bucket.push(normalize(d, "Mood", <Smile size={16}/>)));
      chapters.forEach(d => {
        const title = d.id.replace("chapter", "Chapter ");
        bucket.push(normalize(d, "Psychoeducation", <BookOpen size={16}/>, `Read ${title}`));
      });
      
      // Process Visualization Sessions (The Timer Data)
      vizSessions.forEach(d => bucket.push(normalize(d, "Visualization", <Eye size={16}/>)));
      
      // Process Global Logs (The Checkbox Data) - optional, might duplicate if you log both
      vizLogs.forEach(d => bucket.push(normalize(d, "Visualization", <Eye size={16}/>)));

      // Sort by Date (Newest first)
      bucket.sort((a, b) => {
          const tA = a.time?.toMillis ? a.time.toMillis() : 0;
          const tB = b.time?.toMillis ? b.time.toMillis() : 0;
          return tB - tA; 
      });

      setUserActivities(bucket);
      calculateUserStats(bucket);

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

  // --- FORMATTER ---
  const formatDetails = (type: string, d: any) => {
    // Format Time Helper
    const fmtTime = (t: any) => {
        if (t && typeof t.toDate === 'function') {
            return t.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        return '';
    };

    if (type === "Kick") {
        const range = d.startTime && d.endTime ? ` (${fmtTime(d.startTime)} - ${fmtTime(d.endTime)})` : '';
        return `${d.kickCount || 0} kicks recorded${range}`;
    }

    if (type === "Contraction") {
        const range = d.startTime && d.endTime ? ` (${fmtTime(d.startTime)} - ${fmtTime(d.endTime)})` : '';
        return `Duration: ${d.durationSeconds || 0}s${range}`;
    }

    if (type === "Breathing") {
       const mins = Math.floor((d.durationMs||0)/60000);
       const secs = Math.floor(((d.durationMs||0) % 60000) / 1000);
       const range = d.startTime && d.endTime ? ` • ${fmtTime(d.startTime)} - ${fmtTime(d.endTime)}` : '';
       return `Session: ${mins}m ${secs}s${range}`;
    }

    // UPDATED: Handle Visualization Timer Data
    if (type === "Visualization") {
        if (d.durationMs !== undefined) {
             const mins = Math.floor((d.durationMs||0)/60000);
             const secs = Math.floor(((d.durationMs||0) % 60000) / 1000);
             const range = d.startTime && d.endTime ? ` • ${fmtTime(d.startTime)} - ${fmtTime(d.endTime)}` : '';
             return `Session: ${mins}m ${secs}s${range}`;
        }
        return d.details || "Session completed";
    }

    if (type === "Mood") return `${d.emoji || ''} ${d.emotion || ''}`;
    
    return "";
  };

  const calculateUserStats = (data: any[]) => {
    const counts: any = { 
        "Kick": 0, "Contraction": 0, "Breathing": 0, 
        "Mood": 0, "Psychoeducation": 0, "Visualization": 0 
    };
    data.forEach(i => {
      if (counts[i.type] !== undefined) counts[i.type]++;
    });
    setUserStats(counts);
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
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Name or ID..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                  <TableHead>MOH Area</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   [...Array(5)].map((_, i) => (
                     <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                     </TableRow>
                   ))
                ) : filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.patientid || "N/A"}</TableCell>
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

        {/* DETAILS POPUP */}
        <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 border-b bg-slate-50/50">
              <DialogTitle className="text-2xl font-display flex items-center gap-3">
                <span className="bg-rose-100 text-rose-600 p-3 rounded-full"><Activity size={24}/></span>
                <div>
                    {selectedUser?.username}'s Activity Log
                    <div className="flex gap-4 text-muted-foreground text-sm font-normal mt-1">
                        <span>ID: <span className="font-mono text-slate-700">{selectedUser?.patientid}</span></span>
                        <span>•</span>
                        <span>Phone: {selectedUser?.phonenumber || "N/A"}</span>
                    </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto grid md:grid-cols-12 bg-slate-50/30">
              {fetchingDetails ? (
                 <div className="md:col-span-12 p-6 h-full flex flex-col gap-6">
                    <div className="grid grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl bg-slate-200" />)}
                    </div>
                    <Skeleton className="h-[250px] w-full rounded-xl bg-slate-200" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-200" />)}
                    </div>
                 </div>
              ) : (
                <>
                  {/* Stats & Charts */}
                  <div className="md:col-span-7 p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                      <StatBox label="Kicks" value={userStats["Kick"]} icon={Footprints} color="bg-orange-100 text-orange-600" />
                      <StatBox label="Breathing" value={userStats["Breathing"]} icon={Wind} color="bg-blue-100 text-blue-600" />
                      <StatBox label="Moods" value={userStats["Mood"]} icon={Smile} color="bg-yellow-100 text-yellow-600" />
                      <StatBox label="Contractions" value={userStats["Contraction"]} icon={HeartPulse} color="bg-red-100 text-red-600" />
                      <StatBox label="Chapters" value={userStats["Psychoeducation"]} icon={BookOpen} color="bg-purple-100 text-purple-600" />
                      <StatBox label="Visualizations" value={userStats["Visualization"]} icon={Eye} color="bg-emerald-100 text-emerald-600" />
                    </div>

                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Usage Distribution</CardTitle></CardHeader>
                      <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Kicks', val: userStats['Kick'] || 0, fill: '#f97316' },
                            { name: 'Breath', val: userStats['Breathing'] || 0, fill: '#3b82f6' },
                            { name: 'Mood', val: userStats['Mood'] || 0, fill: '#eab308' },
                            { name: 'Edu', val: userStats['Psychoeducation'] || 0, fill: '#9333ea' },
                            { name: 'Viz', val: userStats['Visualization'] || 0, fill: '#10b981' },
                          ]}>
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                              <Cell fill="#f97316" /><Cell fill="#3b82f6" /><Cell fill="#eab308" /><Cell fill="#9333ea" /><Cell fill="#10b981" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* History Timeline */}
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

// Components
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