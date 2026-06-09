"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, ShieldCheck, Link as LinkIcon, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] bg-primary/5 w-fit px-3 py-1 rounded-full border border-primary/10">
          <Settings className="w-3 h-3" />
          Configuration
        </div>
        <h1 className="text-4xl font-black text-foreground tracking-tight">System Settings</h1>
        <p className="text-muted-foreground font-medium text-sm md:text-base">Manage global app behavior, paywalls, and integrations.</p>
      </div>

      <div className="grid gap-6">
        {/* Subscription Control */}
        <Card className="rounded-[2rem] border-primary/5 shadow-xl bg-white overflow-hidden">
          <CardHeader className="p-6 md:p-8 border-b border-primary/5 bg-primary/[0.01]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-foreground">Subscription Paywall</CardTitle>
                <p className="text-xs text-muted-foreground font-medium">Enforce a limit on free daily sets.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between p-6 bg-primary/5 rounded-3xl border border-primary/10">
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground uppercase tracking-tight">Enable Paywall</p>
                <p className="text-xs text-muted-foreground font-medium">Block access after the free set limit is reached.</p>
              </div>
              <button 
                onClick={() => setSettings({ ...settings, isSubscriptionEnabled: !settings.isSubscriptionEnabled })}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${settings.isSubscriptionEnabled ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.isSubscriptionEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-primary" /> Free Sets Limit
                </label>
                <input 
                  type="number"
                  value={settings.freeSetsLimit}
                  onChange={(e) => setSettings({ ...settings, freeSetsLimit: parseInt(e.target.value) || 0 })}
                  className="w-full h-12 bg-primary/5 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="e.g. 10"
                />
                <p className="text-[10px] text-muted-foreground font-medium px-1">Users can access this many sets for free before being blocked.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                  <LinkIcon className="w-3 h-3 text-primary" /> Payment (UPI) Link
                </label>
                <input 
                  type="text"
                  value={settings.upiLink}
                  onChange={(e) => setSettings({ ...settings, upiLink: e.target.value })}
                  className="w-full h-12 bg-primary/5 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="upi://pay?pa=your-id@bank..."
                />
                <p className="text-[10px] text-muted-foreground font-medium px-1">This link will open when a user clicks &quot;Subscribe&quot;.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="h-14 px-10 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 gap-3 min-w-[200px]"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving Changes..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 flex gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-black text-amber-900">Important Note</p>
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            Since payments are handled via personal UPI links, the system cannot verify payments automatically. 
            Once a user pays, you must manually go to the <strong>Users</strong> section, find their profile, 
            and click <strong>&quot;Mark as Subscribed&quot;</strong> to unlock their account.
          </p>
        </div>
      </div>
    </div>
  );
}
