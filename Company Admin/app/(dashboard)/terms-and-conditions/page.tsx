"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Save, ShieldCheck, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/RichTextEditor";
import { toast } from "react-hot-toast";
import { backendProxyPath } from "@/app/lib/backendProxy";

export default function TermsAndConditionsPage() {
    const [terms, setTerms] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        try {
            setLoading(true);
            const res = await fetch(backendProxyPath('/api/company/settings/terms'), {
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                setTerms(data.terms || "");
            }
        } catch (err) {
            console.error("Failed to fetch terms:", err);
            toast.error("Failed to load terms and conditions");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Strip HTML tags to get plain text count for validation
        const plainText = terms.replace(/<[^>]*>/g, "");
        if (plainText.length > 2700) {
            toast.error("Terms cannot exceed 2700 characters");
            return;
        }

        try {
            setSaving(true);
            const res = await fetch(backendProxyPath('/api/company/settings/terms'), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ terms }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Terms and conditions updated successfully");
            } else {
                toast.error(data.message || "Failed to update terms");
            }
        } catch (err) {
            console.error("Failed to save terms:", err);
            toast.error("An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="w-full min-h-screen px-2 sm:px-4 pt-2 mt-2 pb-8 sm:py-8 space-y-6">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                            <ShieldCheck className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Terms & Conditions</h1>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Manage your company's legal terms and service agreements</p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleSave} 
                        disabled={saving || loading}
                        className="glass-primary h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {saving ? "Saving..." : "Save Terms"}
                    </Button>
                </div>

                {/* CONTENT AREA */}
                <div className="glass rounded-[2.5rem] border border-border/50 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Editor</h2>
                        </div>

                        {loading ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
                            </div>
                        ) : (
                            <div className="min-h-[400px] rounded-3xl overflow-hidden border border-border/30 focus-within:border-primary/30 transition-all">
                                <RichTextEditor 
                                    value={terms} 
                                    onChange={setTerms} 
                                    limit={2700}
                                />
                            </div>
                        )}

                        <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-primary">Guidelines</h4>
                                <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                                    Use the editor above to format your terms. You can add bold text, italics, and lists to make your terms more readable for customers. These terms will be displayed on your booking page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </ProtectedRoute>
    );
}
