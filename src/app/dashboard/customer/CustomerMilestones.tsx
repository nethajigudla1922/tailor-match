"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Eye, Loader2, Sparkles } from "lucide-react";

export function CustomerMilestones({ bookingId }: { bookingId: string }) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/milestones`);
      if (res.ok) {
        const data = await res.json();
        setMilestones(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
    // Poll milestones status every 15 seconds for live construction status tracking
    const interval = setInterval(fetchMilestones, 15000);
    return () => clearInterval(interval);
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center space-x-1.5 py-3">
        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
        <span className="text-[10px] text-muted-foreground">Checking live workshop progress...</span>
      </div>
    );
  }

  if (milestones.length === 0) return null;

  const completedCount = milestones.filter(m => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-2xl space-y-3.5">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-primary border-b border-primary/10 pb-1.5">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          Workshop Construction Progress
        </span>
        <span>{progressPercent}% Complete</span>
      </div>

      {/* High Fidelity Progress Stepper Timeline */}
      <div className="space-y-3 relative pl-3.5 border-l border-primary/20 ml-1.5">
        {milestones.map((m) => (
          <div key={m.id} className="relative group space-y-1">
            {/* Dot indicator */}
            <div className="absolute -left-[20.5px] top-0.5 bg-background rounded-full p-0.5">
              {m.isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-muted-foreground/45" />
              )}
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className={`text-[11px] font-bold leading-tight ${m.isCompleted ? 'text-foreground font-extrabold' : 'text-muted-foreground/80'}`}>
                {m.title}
              </span>
              {m.isCompleted ? (
                <span className="text-[8px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.25 rounded font-black uppercase tracking-wider shrink-0">
                  Completed
                </span>
              ) : (
                <span className="text-[8px] bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 px-1.5 py-0.25 rounded font-black uppercase tracking-wider shrink-0">
                  Pending
                </span>
              )}
            </div>

            {m.image && (
              <div className="pt-0.5">
                <div 
                  onClick={() => setSelectedPhoto(m.image)}
                  className="relative w-16 h-12 rounded-lg overflow-hidden border border-primary/10 bg-background/50 cursor-zoom-in group/thumb shadow-sm hover:border-primary/40 transition-colors"
                >
                  <img src={m.image} alt="Progress verification" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Photo Overlay Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-xl w-full bg-white/95 backdrop-blur rounded-3xl p-4 border border-white/20 shadow-2xl flex flex-col items-center space-y-3 cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                Construction Photo Proof
              </span>
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close View
              </button>
            </div>
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-inner bg-black flex items-center justify-center">
              <img src={selectedPhoto} alt="Zoomed milestone verification" className="w-full h-full object-contain" />
            </div>
            <p className="text-[10px] text-muted-foreground text-center font-semibold italic">
              Verification photo provided live from the tailor's workshop workbench.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
