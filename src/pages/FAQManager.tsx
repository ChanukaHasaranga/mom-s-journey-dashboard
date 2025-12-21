import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2, Eye, Edit2, ArrowLeft } from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { useNavigate, useSearchParams } from "react-router-dom";

// Interface for a single Question & Answer pair
interface FAQItem {
  question: string;
  answer: string;
}

// Data structure for one language
interface FAQData {
  title: string;
  intro: string;
  questions: FAQItem[];
}

// Initial empty state
const initialLangData: FAQData = {
  title: "",
  intro: "",
  questions: [{ question: "", answer: "" }] // Start with 1 empty question
};

export default function FAQBuilderPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get content ID from URL (e.g., ?id=faq_baby_movements)
  const contentId = searchParams.get("id") || "faq_new";

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("en");
  const [userRole, setUserRole] = useState("viewer");

  // State to hold data for all 3 languages
  const [data, setData] = useState<{ en: FAQData; si: FAQData; ta: FAQData }>({
    en: { ...initialLangData },
    si: { ...initialLangData },
    ta: { ...initialLangData },
  });

  // 1. Check Permissions & Fetch Data
  useEffect(() => {
    const init = async () => {
      if (auth.currentUser) {
        // Check Role
        const userDoc = await getDoc(doc(db, "admin_users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || "viewer");
        }

        // Fetch Content
        if (contentId !== "faq_new") {
          try {
            const docSnap = await getDoc(doc(db, "app_content", contentId));
            if (docSnap.exists()) {
              const fetchedData = docSnap.data();
              // Merge fetched data with structure to ensure arrays exist
              setData({
                en: fetchedData.en || initialLangData,
                si: fetchedData.si || initialLangData,
                ta: fetchedData.ta || initialLangData,
              });
            }
          } catch (e) {
            console.error("Fetch error:", e);
            toast({ title: "Error", description: "Could not load FAQ data", variant: "destructive" });
          }
        }
      }
      setFetching(false);
    };
    init();
  }, [contentId, toast]);

  // --- HANDLERS ---

  // Update simple fields (Title, Intro)
  const handleFieldChange = (lang: "en" | "si" | "ta", field: keyof FAQData, value: string) => {
    setData(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value }
    }));
  };

  // Update a specific Question or Answer
  const handleQuestionChange = (lang: "en" | "si" | "ta", index: number, field: keyof FAQItem, value: string) => {
    const updatedQuestions = [...data[lang].questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    
    setData(prev => ({
      ...prev,
      [lang]: { ...prev[lang], questions: updatedQuestions }
    }));
  };

  // Add a new empty question
  const addQuestion = (lang: "en" | "si" | "ta") => {
    setData(prev => ({
      ...prev,
      [lang]: { 
        ...prev[lang], 
        questions: [...prev[lang].questions, { question: "", answer: "" }] 
      }
    }));
  };

  // Remove a question
  const removeQuestion = (lang: "en" | "si" | "ta", index: number) => {
    const updatedQuestions = data[lang].questions.filter((_, i) => i !== index);
    setData(prev => ({
      ...prev,
      [lang]: { ...prev[lang], questions: updatedQuestions }
    }));
  };

  // Save to Firebase
  const handleSave = async () => {
    if (userRole === "viewer") {
      toast({ title: "Permission Denied", description: "You do not have permission to save.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let adminName = "Unknown";
      if (auth.currentUser) {
        const adDoc = await getDoc(doc(db, "admin_users", auth.currentUser.uid));
        if (adDoc.exists()) adminName = adDoc.data().name;
      }

      await setDoc(doc(db, "app_content", contentId), {
        ...data,
        type: "faq", // Mark as FAQ type
        updatedBy: adminName,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({ title: "Success", description: "FAQ content saved successfully." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save content.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERERS ---

  const renderEditor = (lang: "en" | "si" | "ta") => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header Inputs */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
        <div className="grid gap-2">
          <Label className="text-base font-semibold">Page Title ({lang.toUpperCase()})</Label>
          <Input 
            value={data[lang].title} 
            onChange={(e) => handleFieldChange(lang, "title", e.target.value)}
            placeholder="e.g. Baby Movements"
            className="text-lg font-medium"
          />
        </div>
        <div className="grid gap-2">
          <Label>Introductory Text</Label>
          <Textarea 
            value={data[lang].intro} 
            onChange={(e) => handleFieldChange(lang, "intro", e.target.value)}
            placeholder="Brief introduction..."
            rows={3}
          />
        </div>
      </div>

      {/* Dynamic Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Questions & Answers</h3>
          <Button onClick={() => addQuestion(lang)} variant="outline" size="sm" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>

        {data[lang].questions.map((item, index) => (
          <div key={index} className="group relative bg-card border border-border p-5 rounded-xl shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeQuestion(lang, index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Question {index + 1}</Label>
                <Input 
                  value={item.question} 
                  onChange={(e) => handleQuestionChange(lang, index, "question", e.target.value)}
                  placeholder="Type the question here..."
                  className="font-medium"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Answer</Label>
                <Textarea 
                  value={item.answer} 
                  onChange={(e) => handleQuestionChange(lang, index, "answer", e.target.value)}
                  placeholder="Type the detailed answer here..."
                  rows={4}
                  className="leading-relaxed"
                />
              </div>
            </div>
          </div>
        ))}

        {data[lang].questions.length === 0 && (
          <div className="text-center p-10 border-2 border-dashed border-muted rounded-xl text-muted-foreground">
            No questions added yet. Click "Add Question" to start.
          </div>
        )}
      </div>
    </div>
  );

  const renderPreview = (lang: "en" | "si" | "ta") => (
    <div className="max-w-md mx-auto bg-white border-8 border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl h-[700px] flex flex-col relative">
      {/* Mobile Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-gray-900 rounded-b-2xl z-20"></div>
      
      {/* Mobile Header */}
      <div className="bg-rose-500 text-white p-4 pt-12 text-center z-10 shadow-md">
        <h3 className="font-bold text-lg">{data[lang].title || "Page Title"}</h3>
      </div>

      {/* Mobile Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {data[lang].intro && (
          <div className="bg-white p-4 rounded-lg shadow-sm text-sm text-gray-600">
            {data[lang].intro}
          </div>
        )}

        {data[lang].questions.map((q, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-3 border-b border-gray-50 font-semibold text-rose-600 text-sm flex justify-between items-center">
              {q.question || "New Question"}
              <span className="text-gray-300">▼</span>
            </div>
            <div className="p-3 text-sm text-gray-700 leading-relaxed">
              {q.answer || "Answer text will appear here..."}
            </div>
          </div>
        ))}
      </div>
      
      {/* Mobile Bottom Bar */}
      <div className="bg-white p-3 border-t flex justify-around">
        <div className="h-1 w-1/3 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold">FAQ Builder</h1>
              <p className="text-sm text-muted-foreground">
                {contentId === "faq_new" ? "Creating new FAQ" : "Editing FAQ Content"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button 
              variant={!previewMode ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setPreviewMode(false)}
              className={!previewMode ? "bg-white text-foreground shadow-sm hover:bg-white" : ""}
            >
              <Edit2 className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button 
              variant={previewMode ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setPreviewMode(true)}
              className={previewMode ? "bg-white text-foreground shadow-sm hover:bg-white" : ""}
            >
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
          </div>
        </div>

        {/* Tabs & Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
              <TabsTrigger value="si">🇱🇰 Sinhala</TabsTrigger>
              <TabsTrigger value="ta">🇱🇰 Tamil</TabsTrigger>
            </TabsList>
            
            {/* Save Button */}
            <Button 
              size="lg" 
              onClick={handleSave} 
              disabled={loading || userRole === 'viewer'}
              className="bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>

          <div className="min-h-[500px]">
            <TabsContent value="en">
              {previewMode ? renderPreview("en") : renderEditor("en")}
            </TabsContent>
            <TabsContent value="si">
              {previewMode ? renderPreview("si") : renderEditor("si")}
            </TabsContent>
            <TabsContent value="ta">
              {previewMode ? renderPreview("ta") : renderEditor("ta")}
            </TabsContent>
          </div>
        </Tabs>

      </div>
    </DashboardLayout>
  );
}