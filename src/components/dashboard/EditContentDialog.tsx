import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase";

interface EditContentDialogProps {
  contentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialData = {
  en: {}, si: {}, ta: {},
  type: "wellness"
};

export function EditContentDialog({ contentId, open, onOpenChange }: EditContentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(initialData);

  useEffect(() => {
    if (open && contentId) {
      const fetchData = async () => {
        const docRef = doc(db, "app_content", contentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          setData(initialData);
        }
      };
      fetchData();
    }
  }, [open, contentId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      let adminName = "Admin";
      if (auth.currentUser) {
        const adminDoc = await getDoc(doc(db, "admin_users", auth.currentUser.uid));
        if (adminDoc.exists()) {
          adminName = adminDoc.data().name || "Admin";
        }
      }

      await setDoc(doc(db, "app_content", contentId), {
        ...data,
        updatedBy: adminName,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({ title: "Content Updated", description: "Changes saved successfully." });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error", description: "Could not save content.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (lang: string, field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value }
    }));
  };

  const renderLanguageFields = (langCode: string) => {

    // =========================================================
    // 5. PE: MANAGING STRESS (Module 5) <--- NEWLY ADDED
    // =========================================================
    if (contentId === 'pe_managing_stress') {
      return (
        <div className="space-y-6 py-4 h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-4 border-b border-yellow-100 pb-6 bg-yellow-50/50 p-4 rounded-lg">
            <h4 className="font-bold text-yellow-700">Intro</h4>
            <div className="grid gap-2"><Label>Title</Label><Input value={data[langCode]?.title || ""} onChange={(e) => handleChange(langCode, "title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Hello</Label><Input value={data[langCode]?.hi || ""} onChange={(e) => handleChange(langCode, "hi", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Intro Body</Label><Textarea rows={4} value={data[langCode]?.intro || ""} onChange={(e) => handleChange(langCode, "intro", e.target.value)} /></div>
            <div className="grid gap-2 mt-2"><Label>Why Title</Label><Input value={data[langCode]?.why_title || ""} onChange={(e) => handleChange(langCode, "why_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Why Body</Label><Textarea rows={3} value={data[langCode]?.why_body || ""} onChange={(e) => handleChange(langCode, "why_body", e.target.value)} /></div>
          </div>

          <div className="space-y-4 border-b pb-4 p-4">
            <h4 className="font-bold text-yellow-600">Techniques</h4>
            <Input className="font-bold" value={data[langCode]?.tech_title || ""} onChange={(e) => handleChange(langCode, "tech_title", e.target.value)} />

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div><Label>Deep Breathing</Label><Input value={data[langCode]?.breath_title || ""} onChange={(e) => handleChange(langCode, "breath_title", e.target.value)} /></div>
              <div><Label>Body</Label><Textarea rows={3} value={data[langCode]?.breath_body || ""} onChange={(e) => handleChange(langCode, "breath_body", e.target.value)} /></div>

              <div><Label>Meditation</Label><Input value={data[langCode]?.med_title || ""} onChange={(e) => handleChange(langCode, "med_title", e.target.value)} /></div>
              <div><Label>Body</Label><Textarea rows={3} value={data[langCode]?.med_body || ""} onChange={(e) => handleChange(langCode, "med_body", e.target.value)} /></div>

              <div><Label>Yoga</Label><Input value={data[langCode]?.yoga_title || ""} onChange={(e) => handleChange(langCode, "yoga_title", e.target.value)} /></div>
              <div><Label>Body</Label><Textarea rows={3} value={data[langCode]?.yoga_body || ""} onChange={(e) => handleChange(langCode, "yoga_body", e.target.value)} /></div>

              <div><Label>Muscle Relax</Label><Input value={data[langCode]?.pmr_title || ""} onChange={(e) => handleChange(langCode, "pmr_title", e.target.value)} /></div>
              <div><Label>Body</Label><Textarea rows={3} value={data[langCode]?.pmr_body || ""} onChange={(e) => handleChange(langCode, "pmr_body", e.target.value)} /></div>
            </div>
          </div>

          <div className="space-y-4 border-b pb-4 p-4">
            <h4 className="font-bold text-yellow-600">Lifestyle</h4>
            <Input className="font-bold" value={data[langCode]?.life_title || ""} onChange={(e) => handleChange(langCode, "life_title", e.target.value)} />

            <div className="space-y-2 mt-2">
              <Label>Sleep</Label><Input value={data[langCode]?.sleep_title || ""} onChange={(e) => handleChange(langCode, "sleep_title", e.target.value)} />
              <Textarea rows={2} value={data[langCode]?.sleep_body || ""} onChange={(e) => handleChange(langCode, "sleep_body", e.target.value)} />

              <Label>Eat</Label><Input value={data[langCode]?.eat_title || ""} onChange={(e) => handleChange(langCode, "eat_title", e.target.value)} />
              <Textarea rows={2} value={data[langCode]?.eat_body || ""} onChange={(e) => handleChange(langCode, "eat_body", e.target.value)} />

              <Label>Exercise</Label><Input value={data[langCode]?.move_title || ""} onChange={(e) => handleChange(langCode, "move_title", e.target.value)} />
              <Textarea rows={2} value={data[langCode]?.move_body || ""} onChange={(e) => handleChange(langCode, "move_body", e.target.value)} />

              <Label>Limits</Label><Input value={data[langCode]?.limit_title || ""} onChange={(e) => handleChange(langCode, "limit_title", e.target.value)} />
              <Textarea rows={2} value={data[langCode]?.limit_body || ""} onChange={(e) => handleChange(langCode, "limit_body", e.target.value)} />
            </div>
          </div>

          <div className="space-y-4 pb-4 p-4">
            <h4 className="font-bold text-yellow-600">Support & Prep</h4>
            <div className="grid gap-2"><Label>Support Title</Label><Input value={data[langCode]?.support_title || ""} onChange={(e) => handleChange(langCode, "support_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Talk</Label><Textarea rows={2} value={data[langCode]?.talk_body || ""} onChange={(e) => handleChange(langCode, "talk_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Group</Label><Textarea rows={2} value={data[langCode]?.group_body || ""} onChange={(e) => handleChange(langCode, "group_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Therapy</Label><Textarea rows={2} value={data[langCode]?.therapy_body || ""} onChange={(e) => handleChange(langCode, "therapy_body", e.target.value)} /></div>

            <div className="grid gap-2 mt-4"><Label>Prep Title</Label><Input value={data[langCode]?.prep_title || ""} onChange={(e) => handleChange(langCode, "prep_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Classes</Label><Textarea rows={2} value={data[langCode]?.classes_body || ""} onChange={(e) => handleChange(langCode, "classes_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Space</Label><Textarea rows={2} value={data[langCode]?.space_body || ""} onChange={(e) => handleChange(langCode, "space_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Partner</Label><Textarea rows={3} value={data[langCode]?.partner_body || ""} onChange={(e) => handleChange(langCode, "partner_body", e.target.value)} /></div>

            <div className="grid gap-2 mt-4"><Label>Closing</Label><Textarea rows={2} value={data[langCode]?.final_body || ""} onChange={(e) => handleChange(langCode, "final_body", e.target.value)} /></div>
          </div>
        </div>
      );
    }

    // ... (Keep ALL your existing logic for other modules below here exactly as it was) ...

    // 1. WHAT TO EXPECT (Module 3)
    if (contentId === 'pe_what_to_expect') {
      return (
        <div className="space-y-6 py-4 h-[60vh] overflow-y-auto pr-4">
          {/* ... previous code for Module 3 ... */}
          <div className="space-y-4 border-b border-purple-100 pb-6 bg-purple-50/50 p-4 rounded-lg">
            <h4 className="font-bold text-purple-700">Introduction</h4>
            <div className="grid gap-2"><Label>Main Title</Label><Input value={data[langCode]?.title || ""} onChange={(e) => handleChange(langCode, "title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Greeting</Label><Input value={data[langCode]?.hi || ""} onChange={(e) => handleChange(langCode, "hi", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Body</Label><Textarea rows={4} value={data[langCode]?.intro || ""} onChange={(e) => handleChange(langCode, "intro", e.target.value)} /></div>
          </div>
          {/* Trimester 1 */}
          <div className="space-y-4 border-b pb-4 p-4 border-l-4 border-l-orange-200 bg-orange-50/30">
            <h4 className="font-bold text-orange-800">Trimester 1</h4>
            <div className="grid gap-2"><Label>Title</Label><Input value={data[langCode]?.t1_title || ""} onChange={(e) => handleChange(langCode, "t1_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>
                                                                                    <Input className="font-bold" value={data[langCode]?.t1_phys_head|| ""} onChange={(e) => handleChange(langCode, "t1_phys_head", e.target.value)} />

              </Label><Textarea rows={3} value={data[langCode]?.t1_phys_body || ""} onChange={(e) => handleChange(langCode, "t1_phys_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>
                                                                      <Input className="font-bold" value={data[langCode]?.t1_emot_head|| ""} onChange={(e) => handleChange(langCode, "t1_emot_head", e.target.value)} />

              </Label><Textarea rows={3} value={data[langCode]?.t1_emot_body || ""} onChange={(e) => handleChange(langCode, "t1_emot_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>
                                                        <Input className="font-bold" value={data[langCode]?.t1_do_head|| ""} onChange={(e) => handleChange(langCode, "t1_do_head", e.target.value)} />

              </Label><Textarea rows={3} value={data[langCode]?.t1_do_body || ""} onChange={(e) => handleChange(langCode, "t1_do_body", e.target.value)} /></div>
            <Input className="mt-2" placeholder="Image URL" value={data[langCode]?.img_t1 || ""} onChange={(e) => handleChange(langCode, "img_t1", e.target.value)} />
          </div>
          {/* Trimester 2 */}
          <div className="space-y-4 border-b pb-4 p-4 border-l-4 border-l-blue-200 bg-blue-50/30">
            <h4 className="font-bold text-blue-800">Trimester 2</h4>
            <div className="grid gap-2"><Label>Title</Label><Input value={data[langCode]?.t2_title || ""} onChange={(e) => handleChange(langCode, "t2_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>
                                                                      <Input className="font-bold" value={data[langCode]?.t2_phys_head|| ""} onChange={(e) => handleChange(langCode, "t2_phys_head", e.target.value)} />

              </Label><Textarea rows={3} value={data[langCode]?.t2_phys_body || ""} onChange={(e) => handleChange(langCode, "t2_phys_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>
                                                        <Input className="font-bold" value={data[langCode]?.t2_emot_head|| ""} onChange={(e) => handleChange(langCode, "t2_emot_head", e.target.value)} />

              </Label><Textarea rows={3} value={data[langCode]?.t2_emot_body || ""} onChange={(e) => handleChange(langCode, "t2_emot_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>
              
                                          <Input className="font-bold" value={data[langCode]?.t2_do_head|| ""} onChange={(e) => handleChange(langCode, "t2_do_head", e.target.value)} />

              </Label><Textarea rows={3} value={data[langCode]?.t2_do_body || ""} onChange={(e) => handleChange(langCode, "t2_do_body", e.target.value)} /></div>
            <Input className="mt-2" placeholder="Image URL" value={data[langCode]?.img_t2 || ""} onChange={(e) => handleChange(langCode, "img_t2", e.target.value)} />
          </div>
          {/* Trimester 3 */}
          <div className="space-y-4 border-b pb-4 p-4 border-l-4 border-l-purple-200 bg-purple-50/30">
            <h4 className="font-bold text-purple-800">Trimester 3</h4>
            <div className="grid gap-2"><Label>Title</Label><Input value={data[langCode]?.t3_title || ""} onChange={(e) => handleChange(langCode, "t3_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>

              <Input className="font-bold" value={data[langCode]?.t3_phys_head || ""} onChange={(e) => handleChange(langCode, "t3_phys_head", e.target.value)} />

            </Label><Textarea rows={3} value={data[langCode]?.t3_phys_body || ""} onChange={(e) => handleChange(langCode, "t3_phys_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>
              <Input className="font-bold" value={data[langCode]?.t3_emot_head || ""} onChange={(e) => handleChange(langCode, "t3_emot_head", e.target.value)} />

            </Label><Textarea rows={3} value={data[langCode]?.t3_emot_body || ""} onChange={(e) => handleChange(langCode, "t3_emot_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>

              <Input className="font-bold" value={data[langCode]?.t3_do_head || ""} onChange={(e) => handleChange(langCode, "t3_do_head", e.target.value)} />
            </Label><Textarea rows={3} value={data[langCode]?.t3_do_body || ""} onChange={(e) => handleChange(langCode, "t3_do_body", e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Input placeholder="Img 1" value={data[langCode]?.img_t3_1 || ""} onChange={(e) => handleChange(langCode, "img_t3_1", e.target.value)} />
              <Input placeholder="Img 2" value={data[langCode]?.img_t3_2 || ""} onChange={(e) => handleChange(langCode, "img_t3_2", e.target.value)} />
              <Input placeholder="Img 3" value={data[langCode]?.img_t3_3 || ""} onChange={(e) => handleChange(langCode, "img_t3_3", e.target.value)} />
            </div>
          </div>
          { }
          <div className="space-y-4 pb-4">
            <h4 className="font-bold text-gray-700">Tips</h4>
            <div className="grid gap-2"><Label><Input className="font-bold" value={data[langCode]?.all_title || ""} onChange={(e) => handleChange(langCode, "all_title", e.target.value)} /></Label>
              <Textarea rows={3} value={data[langCode]?.all_comm || ""} onChange={(e) => handleChange(langCode, "all_comm", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.all_self || ""} onChange={(e) => handleChange(langCode, "all_self", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.all_mood || ""} onChange={(e) => handleChange(langCode, "all_mood", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.all_help || ""} onChange={(e) => handleChange(langCode, "all_help", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.all_mind || ""} onChange={(e) => handleChange(langCode, "all_mind", e.target.value)} />



            </div>
          </div>




          {/* Closing */}
          <div className="space-y-4 pb-4">
            <h4 className="font-bold text-gray-700">Closing</h4>
            <div className="grid gap-2"><Label>Title</Label><Input value={data[langCode]?.final_title || ""} onChange={(e) => handleChange(langCode, "final_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Body</Label><Textarea rows={3} value={data[langCode]?.final_body || ""} onChange={(e) => handleChange(langCode, "final_body", e.target.value)} /></div>
          </div>
        </div>
      );
    }

    // 2. PREPARING FOR BIRTH (Module 4)
    if (contentId === 'pe_preparing_for_birth') {
      return (
        <div className="space-y-6 py-4 h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-4 border-b border-teal-100 pb-6 bg-teal-50/50 p-4 rounded-lg">
            <h4 className="font-bold text-teal-700">Intro</h4>
            <div className="grid gap-2"><Label>Page Title</Label><Input value={data[langCode]?.title || ""} onChange={(e) => handleChange(langCode, "title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Intro Body</Label><Textarea rows={4} value={data[langCode]?.intro || ""} onChange={(e) => handleChange(langCode, "intro", e.target.value)} /></div>
          </div>
          <div className="space-y-4 border-b pb-4 p-4">
            <h4 className="font-bold text-teal-600">Labor & Delivery</h4>
            <Input className="font-bold" value={data[langCode]?.labor_title || ""} onChange={(e) => handleChange(langCode, "labor_title", e.target.value)} />
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <Label>Physical Prep</Label><Input value={data[langCode]?.physical_prep_title || ""} onChange={(e) => handleChange(langCode, "physical_prep_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.physical_prep_body || ""} onChange={(e) => handleChange(langCode, "physical_prep_body", e.target.value)} />
              <Input placeholder="Image URL (Physical)" value={data[langCode]?.img_physical || ""} onChange={(e) => handleChange(langCode, "img_physical", e.target.value)} />
            </div>
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <Label>Hospital Bag</Label><Input value={data[langCode]?.bag_title || ""} onChange={(e) => handleChange(langCode, "bag_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.bag_body || ""} onChange={(e) => handleChange(langCode, "bag_body", e.target.value)} />
              <Input placeholder="Image URL (Bag)" value={data[langCode]?.img_bag || ""} onChange={(e) => handleChange(langCode, "img_bag", e.target.value)} />
            </div>
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <Label>Birth Plan</Label><Input value={data[langCode]?.plan_title || ""} onChange={(e) => handleChange(langCode, "plan_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.plan_body || ""} onChange={(e) => handleChange(langCode, "plan_body", e.target.value)} />
              <Input placeholder="Image URL (Plan)" value={data[langCode]?.img_plan || ""} onChange={(e) => handleChange(langCode, "img_plan", e.target.value)} />
            </div>
          </div>
          <div className="space-y-4 border-b pb-4 p-4">
            <h4 className="font-bold text-teal-600">Postpartum</h4>
            <Input className="font-bold" value={data[langCode]?.pp_title || ""} onChange={(e) => handleChange(langCode, "pp_title", e.target.value)} />
            <div className="grid gap-2"><Label>Plan Title</Label><Input value={data[langCode]?.pp_plan_title || ""} onChange={(e) => handleChange(langCode, "pp_plan_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Plan Body</Label><Textarea rows={3} value={data[langCode]?.pp_plan_body || ""} onChange={(e) => handleChange(langCode, "pp_plan_body", e.target.value)} /></div>

            <div className="grid gap-2 mt-2"><Label>Supplies Title</Label><Input value={data[langCode]?.pp_supplies_title || ""} onChange={(e) => handleChange(langCode, "pp_supplies_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Supplies Body</Label><Textarea rows={3} value={data[langCode]?.pp_supplies_body || ""} onChange={(e) => handleChange(langCode, "pp_supplies_body", e.target.value)} /></div>
            <Input placeholder="Image URL (Supplies)" value={data[langCode]?.img_supplies || ""} onChange={(e) => handleChange(langCode, "img_supplies", e.target.value)} />
          </div>
          <div className="space-y-4 border-b pb-4 p-4">
            <h4 className="font-bold text-teal-600">Recovery & Feeding</h4>
            <div className="space-y-2">
              <Label>Rule Title</Label><Input value={data[langCode]?.rule_title || ""} onChange={(e) => handleChange(langCode, "rule_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.rule_body || ""} onChange={(e) => handleChange(langCode, "rule_body", e.target.value)} />
              <Input placeholder="Image URL (Rule)" value={data[langCode]?.img_rule || ""} onChange={(e) => handleChange(langCode, "img_rule", e.target.value)} />
            </div>
            <div className="space-y-2 mt-4">
              <Label>Emotional Title</Label><Input value={data[langCode]?.emo_title || ""} onChange={(e) => handleChange(langCode, "emo_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.emo_body || ""} onChange={(e) => handleChange(langCode, "emo_body", e.target.value)} />
              <Input placeholder="Image URL (Emotional)" value={data[langCode]?.img_emo || ""} onChange={(e) => handleChange(langCode, "img_emo", e.target.value)} />
            </div>
            <div className="space-y-2 mt-4">
              <Label>Feeding Title</Label><Input value={data[langCode]?.feed_title || ""} onChange={(e) => handleChange(langCode, "feed_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.feed_body || ""} onChange={(e) => handleChange(langCode, "feed_body", e.target.value)} />
              <Input placeholder="Image URL (Feeding)" value={data[langCode]?.img_feed || ""} onChange={(e) => handleChange(langCode, "img_feed", e.target.value)} />
            </div>
            <div className="space-y-2 mt-4">
              <Label>Intro Baby Title</Label><Input value={data[langCode]?.intro_baby_title || ""} onChange={(e) => handleChange(langCode, "intro_baby_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.intro_baby_body || ""} onChange={(e) => handleChange(langCode, "intro_baby_body", e.target.value)} />
              <Input placeholder="Image URL (Intro Baby)" value={data[langCode]?.img_intro || ""} onChange={(e) => handleChange(langCode, "img_intro", e.target.value)} />
            </div>
          </div>
          <div className="space-y-4 pb-4">
            <h4 className="font-bold text-teal-600">Key Considerations</h4>
            <div className="grid gap-2"><Label>Title</Label><Input value={data[langCode]?.key_title || ""} onChange={(e) => handleChange(langCode, "key_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Nutrition Head</Label><Input value={data[langCode]?.key_nutri_head || ""} onChange={(e) => handleChange(langCode, "key_nutri_head", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Nutrition Body</Label><Textarea rows={2} value={data[langCode]?.key_nutri_body || ""} onChange={(e) => handleChange(langCode, "key_nutri_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Comm Head</Label><Input value={data[langCode]?.key_comm_head || ""} onChange={(e) => handleChange(langCode, "key_comm_head", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Comm Body</Label><Textarea rows={2} value={data[langCode]?.key_comm_body || ""} onChange={(e) => handleChange(langCode, "key_comm_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Flex Head</Label><Input value={data[langCode]?.key_flex_head || ""} onChange={(e) => handleChange(langCode, "key_flex_head", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Flex Body</Label><Textarea rows={2} value={data[langCode]?.key_flex_body || ""} onChange={(e) => handleChange(langCode, "key_flex_body", e.target.value)} /></div>

            <div className="border-t pt-4 mt-4">
              <Label>Final Title</Label><Input value={data[langCode]?.final_title || ""} onChange={(e) => handleChange(langCode, "final_title", e.target.value)} />
              <div className="grid gap-2"><Label>Final Body</Label><Textarea rows={3} value={data[langCode]?.final_body || ""} onChange={(e) => handleChange(langCode, "final_body", e.target.value)} /></div>
            </div>
          </div>
        </div>
      );
    }

    // 3. COMMON ANXIETIES (Module 2)
    if (contentId === 'pe_common_anxieties') {
      return (
        <div className="space-y-6 py-4 h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-4 border-b border-pink-100 pb-6 bg-pink-50/50 p-4 rounded-lg">
            <h4 className="font-bold text-pink-700">Intro</h4>
            <div className="grid gap-2"><Label>Page Title</Label><Input value={data[langCode]?.title || ""} onChange={(e) => handleChange(langCode, "title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Hello Message</Label><Input value={data[langCode]?.hello || ""} onChange={(e) => handleChange(langCode, "hello", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Intro Body</Label><Textarea rows={4} value={data[langCode]?.intro || ""} onChange={(e) => handleChange(langCode, "intro", e.target.value)} /></div>
          </div>
          <div className="space-y-4 border-b pb-4 p-4">
            <h4 className="font-bold text-pink-600">1. Concerns About Baby</h4>
            <Input className="font-bold" value={data[langCode]?.s1_title || ""} onChange={(e) => handleChange(langCode, "s1_title", e.target.value)} />
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <Label>Health & Development</Label><Input value={data[langCode]?.s1_h_title || ""} onChange={(e) => handleChange(langCode, "s1_h_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.s1_h_body || ""} onChange={(e) => handleChange(langCode, "s1_h_body", e.target.value)} />
              <Input placeholder="Image URL (Health)" value={data[langCode]?.img_health || ""} onChange={(e) => handleChange(langCode, "img_health", e.target.value)} />
            </div>
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <Label>Birth & Delivery</Label><Input value={data[langCode]?.s1_b_title || ""} onChange={(e) => handleChange(langCode, "s1_b_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.s1_b_body || ""} onChange={(e) => handleChange(langCode, "s1_b_body", e.target.value)} />
              <Input placeholder="Image URL (Birth)" value={data[langCode]?.img_birth || ""} onChange={(e) => handleChange(langCode, "img_birth", e.target.value)} />
            </div>
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <Label>Newborn Care</Label><Input value={data[langCode]?.s1_n_title || ""} onChange={(e) => handleChange(langCode, "s1_n_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.s1_n_body || ""} onChange={(e) => handleChange(langCode, "s1_n_body", e.target.value)} />
              <Input placeholder="Image URL (Newborn)" value={data[langCode]?.img_newborn || ""} onChange={(e) => handleChange(langCode, "img_newborn", e.target.value)} />
            </div>
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <Label>Miscarriage</Label><Input value={data[langCode]?.s1_m_title || ""} onChange={(e) => handleChange(langCode, "s1_m_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.s1_m_body || ""} onChange={(e) => handleChange(langCode, "s1_m_body", e.target.value)} />
              <Input placeholder="Image URL (Miscarriage)" value={data[langCode]?.img_miscarriage || ""} onChange={(e) => handleChange(langCode, "img_miscarriage", e.target.value)} />
            </div>
          </div>
          <div className="space-y-4 border-b pb-4 p-4">
            <h4 className="font-bold text-pink-600">2. You & Relationships</h4>
            <Input className="font-bold" value={data[langCode]?.s2_title || ""} onChange={(e) => handleChange(langCode, "s2_title", e.target.value)} />
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <Label>Body Image</Label><Input value={data[langCode]?.s2_bi_title || ""} onChange={(e) => handleChange(langCode, "s2_bi_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.s2_bi_body || ""} onChange={(e) => handleChange(langCode, "s2_bi_body", e.target.value)} />
              <div className="grid grid-cols-2 gap-2"><Input placeholder="Img 1" value={data[langCode]?.img_body_1 || ""} onChange={(e) => handleChange(langCode, "img_body_1", e.target.value)} /><Input placeholder="Img 2" value={data[langCode]?.img_body_2 || ""} onChange={(e) => handleChange(langCode, "img_body_2", e.target.value)} /></div>
            </div>
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <Label>Partner</Label><Input value={data[langCode]?.s2_p_title || ""} onChange={(e) => handleChange(langCode, "s2_p_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.s2_p_body || ""} onChange={(e) => handleChange(langCode, "s2_p_body", e.target.value)} />
              <Input placeholder="Image URL (Partner)" value={data[langCode]?.img_partner || ""} onChange={(e) => handleChange(langCode, "img_partner", e.target.value)} />
            </div>
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <Label>Parenting</Label><Input value={data[langCode]?.s2_par_title || ""} onChange={(e) => handleChange(langCode, "s2_par_title", e.target.value)} />
              <Textarea rows={3} value={data[langCode]?.s2_par_body || ""} onChange={(e) => handleChange(langCode, "s2_par_body", e.target.value)} />
              <Input placeholder="Image URL (Parenting)" value={data[langCode]?.img_parenting || ""} onChange={(e) => handleChange(langCode, "img_parenting", e.target.value)} />
            </div>
          </div>
          <div className="space-y-4 pb-4 p-4">
            <Input className="font-bold text-pink-600" value={data[langCode]?.s3_title || ""} onChange={(e) => handleChange(langCode, "s3_title", e.target.value)} />

            <div className="grid gap-2"><Label><Input className="font-bold" value={data[langCode]?.s3_fin_title || ""} onChange={(e) => handleChange(langCode, "s3_fin_title", e.target.value)} />
            </Label><Textarea rows={2} value={data[langCode]?.s3_fin_body || ""} onChange={(e) => handleChange(langCode, "s3_fin_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>            <Input className="font-bold" value={data[langCode]?.s3_sleep_title || ""} onChange={(e) => handleChange(langCode, "s3_sleep_title", e.target.value)} />
            </Label><Textarea rows={2} value={data[langCode]?.s3_sleep_body || ""} onChange={(e) => handleChange(langCode, "s3_sleep_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>            <Input className="font-bold" value={data[langCode]?.s3_intr_title || ""} onChange={(e) => handleChange(langCode, "s3_intr_title", e.target.value)} />
            </Label><Textarea rows={2} value={data[langCode]?.s3_intr_body || ""} onChange={(e) => handleChange(langCode, "s3_intr_body", e.target.value)} /></div>

            <div className="grid gap-2"><Label>            <Input className="font-bold" value={data[langCode]?.s3_unk_title || ""} onChange={(e) => handleChange(langCode, "s3_unk_title", e.target.value)} />
            </Label><Textarea rows={2} value={data[langCode]?.s3_unk_body || ""} onChange={(e) => handleChange(langCode, "s3_unk_body", e.target.value)} /></div> <div className="grid gap-2"><Label>            <Input className="font-bold" value={data[langCode]?.s3_hosp_title || ""} onChange={(e) => handleChange(langCode, "s3_hosp_title", e.target.value)} />
            </Label><Textarea rows={2} value={data[langCode]?.s3_hosp_body || ""} onChange={(e) => handleChange(langCode, "s3_hosp_body", e.target.value)} /></div>

            <div className="grid gap-2"><Label>            <Input className="font-bold" value={data[langCode]?.closing_title || ""} onChange={(e) => handleChange(langCode, "closing_title", e.target.value)} />
            </Label><Textarea rows={3} value={data[langCode]?.closing_body || ""} onChange={(e) => handleChange(langCode, "closing_body", e.target.value)} /></div>
          </div>
        </div>
      );
    }

    // 4. ANXIETY MODULE 1
    if (contentId === 'pe_anxiety') {
      return (
        <div className="space-y-6 py-4 h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-4 border-b border-orange-100 pb-6 bg-orange-50/50 p-4 rounded-lg">
            <h4 className="font-bold text-orange-700">Introduction</h4>
            <div className="grid gap-2"><Label>Main Title</Label><Input value={data[langCode]?.title || ""} onChange={(e) => handleChange(langCode, "title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Intro Part 1</Label><Textarea rows={4} value={data[langCode]?.intro_part_1 || ""} onChange={(e) => handleChange(langCode, "intro_part_1", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Intro Part 2</Label><Textarea rows={4} value={data[langCode]?.intro_part_2 || ""} onChange={(e) => handleChange(langCode, "intro_part_2", e.target.value)} /></div>
          </div>
          <div className="space-y-4 border-b pb-4">
            <h4 className="font-semibold text-orange-600">Signs & Support</h4>
            <div className="grid gap-2"><Label>Signs Title</Label><Input value={data[langCode]?.signs_title || ""} onChange={(e) => handleChange(langCode, "signs_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Signs List</Label><Textarea rows={5} value={data[langCode]?.signs || ""} onChange={(e) => handleChange(langCode, "signs", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Support Title</Label><Input value={data[langCode]?.support_title || ""} onChange={(e) => handleChange(langCode, "support_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Support Body</Label><Textarea rows={4} value={data[langCode]?.support || ""} onChange={(e) => handleChange(langCode, "support", e.target.value)} /></div>
          </div>
          <div className="space-y-4 border-b pb-4">
            <h4 className="font-semibold text-orange-600">Helplines</h4>
            <div className="grid gap-2"><Label>Details</Label><Textarea rows={2} value={data[langCode]?.helplines || ""} onChange={(e) => handleChange(langCode, "helplines", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Image URL</Label><Input value={data[langCode]?.helpline_image || ""} onChange={(e) => handleChange(langCode, "helpline_image", e.target.value)} /></div>
          </div>
          <div className="space-y-4 pb-4">
            <h4 className="font-semibold text-orange-600">Closing</h4>
            <div className="grid gap-2"><Label>App Title</Label><Input value={data[langCode]?.app_title || ""} onChange={(e) => handleChange(langCode, "app_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>App Body</Label><Textarea rows={3} value={data[langCode]?.app_body || ""} onChange={(e) => handleChange(langCode, "app_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Closing Message</Label><Textarea rows={3} value={data[langCode]?.closing || ""} onChange={(e) => handleChange(langCode, "closing", e.target.value)} /></div>
          </div>
        </div>
      );
    }

    // 5. VISUALIZATION (Unified)
    if (contentId === 'visualization') {
      return (
        <div className="space-y-6 py-4 h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-4 border-b border-indigo-100 pb-6 bg-indigo-50/50 p-4 rounded-lg">
            <h4 className="font-bold text-indigo-700">Intro Page</h4>
            <div className="grid gap-2"><Label>Main Title</Label><Input value={data[langCode]?.intro_main_title || ""} onChange={(e) => handleChange(langCode, "intro_main_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>What is Title</Label><Input value={data[langCode]?.what_title || ""} onChange={(e) => handleChange(langCode, "what_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>What is Body</Label><Textarea rows={3} value={data[langCode]?.what_body || ""} onChange={(e) => handleChange(langCode, "what_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Benefits</Label><Textarea rows={3} value={data[langCode]?.benefits_points || ""} onChange={(e) => handleChange(langCode, "benefits_points", e.target.value)} /></div>
          </div>
          <div className="space-y-4 pb-4 p-4 rounded-lg border border-emerald-100 bg-emerald-50/50">
            <h4 className="font-bold text-emerald-700">Exercise Page</h4>
            <div className="grid gap-2"><Label>Exercise Title</Label><Input value={data[langCode]?.exercise_title || ""} onChange={(e) => handleChange(langCode, "exercise_title", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Audio URL</Label><Input value={data[langCode]?.audio || ""} onChange={(e) => handleChange(langCode, "audio", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Guide Steps</Label><Textarea rows={10} value={data[langCode]?.w2_body || ""} onChange={(e) => handleChange(langCode, "w2_body", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Final Words</Label><Textarea rows={3} value={data[langCode]?.final_body || ""} onChange={(e) => handleChange(langCode, "final_body", e.target.value)} /></div>
          </div>
        </div>
      );
    }

    // 6. DEFAULT (Mindful Breathing)
    return (
      <div className="space-y-6 py-4 h-[60vh] overflow-y-auto pr-4">
        <div className="space-y-4 border-b pb-4">
          <h4 className="font-semibold text-blue-600">Intro Section</h4>
          <div className="grid gap-2"><Label>Main Title</Label><Input value={data[langCode]?.title || ""} onChange={(e) => handleChange(langCode, "title", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Audio URL</Label><Input value={data[langCode]?.audio || ""} onChange={(e) => handleChange(langCode, "audio", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Intro Title</Label><Input value={data[langCode]?.intro_title || ""} onChange={(e) => handleChange(langCode, "intro_title", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Intro Body</Label><Textarea rows={3} value={data[langCode]?.intro_body || ""} onChange={(e) => handleChange(langCode, "intro_body", e.target.value)} /></div>
        </div>

        <div className="space-y-4 border-b pb-4">
          <h4 className="font-semibold text-blue-600">Practice</h4>
          <div className="grid gap-2"><Label>Breathing Title</Label><Input value={data[langCode]?.breathing_title || ""} onChange={(e) => handleChange(langCode, "breathing_title", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Breathing Body</Label><Textarea rows={6} value={data[langCode]?.breathing_body || ""} onChange={(e) => handleChange(langCode, "breathing_body", e.target.value)} /></div>
        </div>

        <div className="space-y-4 pb-4">
          <h4 className="font-semibold text-blue-600">Extra Details</h4>
          <div className="grid gap-2"><Label>Why Title</Label><Input value={data[langCode]?.why_title || ""} onChange={(e) => handleChange(langCode, "why_title", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Why Body</Label><Textarea rows={3} value={data[langCode]?.why_body || ""} onChange={(e) => handleChange(langCode, "why_body", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Other Title</Label><Input value={data[langCode]?.other_title || ""} onChange={(e) => handleChange(langCode, "other_title", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Other Body</Label><Textarea rows={3} value={data[langCode]?.other_body || ""} onChange={(e) => handleChange(langCode, "other_body", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Final Title</Label><Input value={data[langCode]?.final_title || ""} onChange={(e) => handleChange(langCode, "final_title", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Final Body</Label><Textarea rows={2} value={data[langCode]?.final_body || ""} onChange={(e) => handleChange(langCode, "final_body", e.target.value)} /></div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Content: {data['en']?.title || data['en']?.intro_main_title || contentId}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="en" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="si">Sinhala</TabsTrigger>
            <TabsTrigger value="ta">Tamil</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-hidden">
            <TabsContent value="en" className="h-full">{renderLanguageFields("en")}</TabsContent>
            <TabsContent value="si" className="h-full">{renderLanguageFields("si")}</TabsContent>
            <TabsContent value="ta" className="h-full">{renderLanguageFields("ta")}</TabsContent>
          </div>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="rose" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}