import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, BookOpen, Edit, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { collection, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function FAQList() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Query ONLY items where type == 'faq'
    const q = query(collection(db, "app_content"), where("type", "==", "faq"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFaqs(fetched);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if(confirm("Delete this FAQ section permanently?")) {
      await deleteDoc(doc(db, "app_content", id));
      toast({ title: "Deleted", description: "FAQ section removed." });
    }
  };

  const filteredFaqs = faqs.filter(f => 
    (f.en?.title || "Untitled").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">FAQ Management</h1>
            <p className="text-muted-foreground">Manage Frequently Asked Questions topics.</p>
          </div>
          <Button onClick={() => navigate("/faqs/manage")} className="gap-2 bg-rose-500 hover:bg-rose-600">
            <Plus className="h-4 w-4" /> Create New FAQ Topic
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search FAQs..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-10"
          />
        </div>

        {/* List Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="group relative flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-foreground line-clamp-1">
                  {faq.en?.title || "Untitled FAQ"}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {faq.en?.intro || "No description provided."}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">
                    {faq.en?.items?.length || 0} Questions
                  </span>
                  <span>•</span>
                  <span>{new Date(faq.updatedAt?.toDate()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => navigate(`/faqs/manage?id=${faq.id}`)}
                >
                  <Edit className="h-4 w-4" /> Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(faq.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-20 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
            No FAQs found. Create your first one!
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}