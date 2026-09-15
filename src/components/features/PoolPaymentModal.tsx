"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, ExternalLink, Loader2, CheckCircle2, ShieldCheck, Copy } from "lucide-react";

interface PoolPaymentModalProps {
  open: boolean;
  onClose: () => void;
  poolId: string;
  poolTitle: string;
  entryFee: number;
  onSuccess: () => void;
}

export default function PoolPaymentModal({
  open,
  onClose,
  poolId,
  poolTitle,
  entryFee,
  onSuccess,
}: PoolPaymentModalProps) {
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminUpiId, setAdminUpiId] = useState("");
  const [paymentQrUrl, setPaymentQrUrl] = useState("");
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPublicSettings();
    }
  }, [open]);

  const fetchPublicSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/settings/public");
      const data = await res.json();
      if (data.adminUpiId) setAdminUpiId(data.adminUpiId);
      if (data.paymentQrUrl) setPaymentQrUrl(data.paymentQrUrl);
    } catch {
      console.warn("Failed to fetch public settings");
    } finally {
      setLoadingSettings(false);
    }
  };

  const copyUpiId = () => {
    if (!adminUpiId) return;
    navigator.clipboard.writeText(adminUpiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(
    adminUpiId || "quizstreak@upi"
  )}&pn=QuizStreak&am=${entryFee}&cu=INR&tn=${encodeURIComponent(
    `Pool_${poolId.slice(-6)}`
  )}`;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || utr.trim().length < 6) {
      toast.error("Please enter a valid UPI Reference / UTR Number (minimum 6 digits).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/pools/${poolId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentUtr: utr.trim(),
        }),
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.message || "Successfully enrolled in pool!");
        onSuccess();
        onClose();
      }
    } catch {
      toast.error("Failed to join pool. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !submitting && !val && onClose()}>
      <DialogContent className="sm:max-w-md p-6 rounded-[2rem] border-primary/10 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-tight text-foreground">
                Join Pool Challenge
              </DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate max-w-[260px]">
                {poolTitle}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Amount Callout */}
          <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-700 block">
                Entry Fee
              </span>
              <span className="text-2xl font-black text-purple-950">₹{entryFee}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block">
                Instant UPI Pay
              </span>
              <span className="text-xs font-black text-purple-800">100% Secure</span>
            </div>
          </div>

          {/* QR Code & UPI Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-primary/5 text-center space-y-3">
            {loadingSettings ? (
              <div className="h-36 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : paymentQrUrl ? (
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 bg-white p-2 rounded-2xl shadow-sm border border-primary/10">
                  <img
                    src={paymentQrUrl}
                    alt="Scan UPI QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
                  Scan with GPay / PhonePe / Paytm / BHIM
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2">
                <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-2">
                  <QrCode className="w-10 h-10 text-primary/60" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  Pay ₹{entryFee} using the UPI ID below
                </span>
              </div>
            )}

            {/* UPI ID Copy Bar */}
            {adminUpiId && (
              <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-primary/10 text-xs">
                <span className="font-mono font-bold text-foreground truncate px-1">
                  {adminUpiId}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyUpiId}
                  className="h-7 px-2 text-[10px] font-black uppercase text-primary gap-1"
                >
                  {copied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            )}

            {/* Direct Mobile UPI Intent Button */}
            <a href={upiIntentUri} className="block w-full sm:hidden">
              <Button
                type="button"
                className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest gap-1.5"
              >
                Pay with Installed UPI App <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleJoin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground">
                Enter 12-Digit UPI Ref / UTR Number
              </label>
              <input
                type="text"
                required
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. 423456789012"
                className="w-full h-11 bg-slate-50 border border-primary/15 rounded-xl px-3 text-sm font-mono font-bold focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all"
              />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                Found in payment receipt / transaction details
              </span>
            </div>

            <Button
              type="submit"
              disabled={submitting || !utr}
              className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 active:scale-[0.98] transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Confirm Payment & Join Pool</>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
