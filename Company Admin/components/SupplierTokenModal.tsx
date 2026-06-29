"use client";

import { useEffect, useState } from "react";
import { Key, Loader2, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { backendProxyPath } from "@/app/lib/backendProxy";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SupplierTokenModalProps {
  open: boolean;
  onClose: () => void;
  assignmentId: number;
  supplierName: string;
  currentToken: string | null;
  onSaved: (token: string) => void;
}

export default function SupplierTokenModal({
  open,
  onClose,
  assignmentId,
  supplierName,
  currentToken,
  onSaved,
}: SupplierTokenModalProps) {
  const [token, setToken] = useState(currentToken || "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setToken(currentToken || "");
      setError(null);
      setCopied(false);
    }
  }, [open, currentToken]);

  const saveToken = async (payload: { supplier_token?: string }) => {
    const res = await fetch(
      backendProxyPath(`/api/getdata/suppliers/token/${assignmentId}`),
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to save token");
    }
    return data.supplier_token as string;
  };

  const handleGenerate = async () => {
    setSaving(true);
    setError(null);
    try {
      const saved = await saveToken({});
      setToken(saved);
      onSaved(saved);
    } catch (err: any) {
      setError(err.message || "Failed to generate token");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Enter a token or use Generate to create one");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await saveToken({ supplier_token: trimmed });
      setToken(saved);
      onSaved(saved);
    } catch (err: any) {
      setError(err.message || "Failed to save token");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Key className="w-5 h-5 text-amber-500" />
            Supplier Token
          </DialogTitle>
          <DialogDescription className="font-medium">{supplierName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            A unique 32-character token used to identify this supplier assignment. Regenerating will invalidate the previous token.
          </p>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Token Value
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="No token — click Generate"
                className="h-12 pl-11 pr-24 rounded-xl font-mono text-sm"
              />
              {token && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1"
                >
                  {copied ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerate}
              disabled={saving}
              className={cn(
                "flex-1 h-11 rounded-xl font-bold border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
              )}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {currentToken ? "Regenerate" : "Generate"}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !token.trim()}
              className="flex-1 h-11 rounded-xl font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Token"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}