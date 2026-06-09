"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, ShieldCheck, Link as LinkIcon, AlertCircle, Save, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    isSubscriptionEnabled: false,
    upiLink: "",
    freeSetsLimit: 10
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else setSettings(data);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else {
        toast.success("Settings updated successfully");
        setSettings(data);
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-4 md:space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-0.5 -ml-2 text-muted-foreground hover:text-primary h-7 text-[9px] md:text-xs">
              <ArrowLeft className="w-3 h-3 mr-1.5" /> Back
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">System Settings</h1>
          <p className="text-xs md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Global Configuration</p>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6">
        {/* Subscription Control */}
        <Card className="rounded-xl md:rounded-2xl border-primary/5 shadow-md bg-white overflow-hidden">
          <CardHeader className="p-4 md:p-6 border-b border-primary/5 bg-primary/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg font-black text-foreground uppercase">Subscription Paywall</CardTitle>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Access control limits</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-foreground uppercase tracking-tight">Enable Paywall</p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">Block access after free limit.</p>
              </div>
              <button 
                onClick={() => setSettings({ ...settings, isSubscriptionEnabled: !settings.isSubscriptionEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none ${settings.isSubscriptionEnabled ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isSubscriptionEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">Free Sets Limit</label>
                <input 
                  type="number"
                  value={settings.freeSetsLimit}
                  onChange={(e) => setSettings({ ...settings, freeSetsLimit: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 bg-primary/5 border-none rounded-xl px-3 text-xs font-bold focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">Payment (UPI) Link</label>
                <input 
                  type="text"
                  value={settings.upiLink}
                  onChange={(e) => setSettings({ ...settings, upiLink: e.target.value })}
                  className="w-full h-10 bg-primary/5 border-none rounded-xl px-3 text-xs font-bold focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  placeholder="upi://pay?pa=..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="h-11 px-8 rounded-xl text-sm font-black shadow-lg shadow-primary/10 gap-2 uppercase tracking-widest min-w-[160px]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-black text-amber-900 uppercase">Manual Verification Required</p>
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            Since payments are via personal UPI, you must manually mark users as subscribed in the Users section after verification.
          </p>
        </div>
      </div>
    </div>
  );
}
