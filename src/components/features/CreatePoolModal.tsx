"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Trophy, Users, HelpCircle, Loader2, IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "JavaScript",
  "Python",
  "SQL",
  "AWS",
  "Data Science",
  "Aptitude",
  "Full-Stack",
];

const MEMBER_OPTIONS = [2, 5, 10, 20, 50];
const QUESTION_OPTIONS = [10, 20, 30];
const FEE_OPTIONS = [20, 50, 100, 200, 500];

interface CreatePoolModalProps {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export default function CreatePoolModal({
  open,
  onClose,
  isAdmin = false,
}: CreatePoolModalProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"custom_duel" | "weekend_tournament">("custom_duel");
  const [category, setCategory] = useState("JavaScript");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Mixed">("Medium");
  const [questionCount, setQuestionCount] = useState(isAdmin ? 30 : 10);
  const [maxMembers, setMaxMembers] = useState(5);
  const [entryFee, setEntryFee] = useState(50);

  const rawTotal = entryFee * maxMembers;
  const platformFee = Math.round(rawTotal * 0.1);
  const prizePool = rawTotal - platformFee;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a pool challenge title.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type: isAdmin ? type : "custom_duel",
          category,
          difficulty,
          questionCount,
          maxMembers,
          entryFee,
        }),
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Challenge Pool created successfully!");
        onClose();
        router.push(`/pools/${data.poolId}`);
      }
    } catch {
      toast.error("Failed to create pool. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !submitting && !val && onClose()}>
      <DialogContent className="sm:max-w-lg p-6 rounded-[2rem] border-primary/10 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black uppercase tracking-tight text-foreground">
                Create Quiz Pool
              </DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Compete with friends or launch a weekend contest
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          {/* Tournament Type Toggle (Admin only) */}
          {isAdmin && (
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setType("custom_duel");
                  setQuestionCount(10);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  type === "custom_duel" ? "bg-white text-primary shadow-xs" : "text-muted-foreground"
                }`}
              >
                Custom Duel
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("weekend_tournament");
                  setQuestionCount(30);
                  setMaxMembers(50);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  type === "weekend_tournament" ? "bg-white text-primary shadow-xs" : "text-muted-foreground"
                }`}
              >
                Official Weekend Arena
              </button>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-foreground">
              Pool Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., JavaScript Weekend Knockout or Python 1v1 Battle"
              className="w-full h-11 bg-slate-50 border border-primary/10 rounded-xl px-3 text-xs font-bold focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-foreground">
              Technology / Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center truncate ${
                    category === cat
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-slate-50 text-foreground border-primary/5 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Questions Count & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-primary" /> Questions
              </label>
              <div className="flex gap-1">
                {QUESTION_OPTIONS.map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                      questionCount === num
                        ? "bg-primary text-white"
                        : "bg-slate-50 text-foreground hover:bg-slate-100"
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full h-9 bg-slate-50 border border-primary/10 rounded-xl px-2 text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          {/* Members & Entry Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground flex items-center gap-1">
                <Users className="w-3 h-3 text-primary" /> Max Players
              </label>
              <div className="flex gap-1">
                {MEMBER_OPTIONS.map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setMaxMembers(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                      maxMembers === num
                        ? "bg-primary text-white"
                        : "bg-slate-50 text-foreground hover:bg-slate-100"
                    }`}
                  >
                    {num === 2 ? "1v1" : num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-primary" /> Entry Fee (₹)
              </label>
              <select
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                className="w-full h-9 bg-slate-50 border border-primary/10 rounded-xl px-2 text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
              >
                {FEE_OPTIONS.map((fee) => (
                  <option key={fee} value={fee}>
                    ₹{fee} per player
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Prize Pool Summary Card */}
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-600" />
                Total Winner Prize Pool
              </div>
              <div className="text-xl font-black text-amber-950">₹{prizePool}</div>
            </div>
            <div className="text-[10px] text-amber-900/80 font-medium flex justify-between border-t border-amber-200/50 pt-1.5">
              <span>Collection: {maxMembers} players × ₹{entryFee} = ₹{rawTotal}</span>
              <span>Platform Fee: 10% (₹{platformFee})</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || !title.trim()}
            className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 active:scale-[0.98] transition-all"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Create & Generate Invite Code</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
