"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Circle, Camera, Plus, Loader2, Trash2 } from "lucide-react";

// Image compression helper
function compressImage(file: File, callback: (base64: string) => void) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 600;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", 0.6));
    };
  };
}

export function MilestoneManager({ bookingId }: { bookingId: string }) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Preset Milestones to make addition immediate and easy
  const PRESETS = [
    "Fabric Sourcing & Inspection",
    "Pattern Drafting & Cutting",
    "First Stage Stitching",
    "Fitting Adjustment Complete",
    "Final Detail Sewing",
    "Steam Pressing & Packaging"
  ];

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/milestones`);
      if (res.ok) {
        const data = await res.json();
        setMilestones(data);
      }
    } catch (err) {
      console.error("Error fetching milestones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [bookingId]);

  const handleAddMilestone = async (title: string, desc = "") => {
    if (!title.trim()) return;
    setAddingMilestone(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc })
      });
      if (res.ok) {
        setNewTitle("");
        setNewDesc("");
        fetchMilestones();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleToggleComplete = async (milestone: any) => {
    setUpdatingId(milestone.id);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: milestone.id,
          isCompleted: !milestone.isCompleted
        })
      });
      if (res.ok) {
        fetchMilestones();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>, milestoneId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdatingId(milestoneId);
    compressImage(file, async (compressedBase64) => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/milestones`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            milestoneId,
            image: compressedBase64
          })
        });
        if (res.ok) {
          fetchMilestones();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUpdatingId(null);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
        <span className="text-xs text-muted-foreground">Loading construction progress...</span>
      </div>
    );
  }

  const completedCount = milestones.filter(m => m.isCompleted).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="mt-4 p-4 border border-border bg-background/40 rounded-2xl space-y-4">
      <div className="flex justify-between items-center border-b border-border/40 pb-2">
        <div>
          <span className="text-[11px] font-black text-primary uppercase tracking-wider block">Tailoring Construction Stepper</span>
          <span className="text-xs text-muted-foreground font-semibold">
            {completedCount} of {milestones.length} milestones complete
          </span>
        </div>
        <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg font-black tracking-wide">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      {milestones.length > 0 && (
        <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500 rounded-full" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Timeline List */}
      {milestones.length === 0 ? (
        <p className="text-xs text-muted-foreground italic text-center py-2">No milestones initialized yet. Choose a preset to start tracking.</p>
      ) : (
        <div className="space-y-3.5 relative pl-4 border-l border-border/80 ml-2">
          {milestones.map((m) => (
            <div key={m.id} className="relative group space-y-1.5">
              {/* Dot Icon */}
              <div className="absolute -left-[23px] top-0.5 bg-background rounded-full transition-transform hover:scale-110">
                {updatingId === m.id ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : m.isCompleted ? (
                  <CheckCircle 
                    className="w-4 h-4 text-emerald-500 cursor-pointer" 
                    onClick={() => handleToggleComplete(m)} 
                  />
                ) : (
                  <Circle 
                    className="w-4 h-4 text-muted-foreground/60 hover:text-primary cursor-pointer" 
                    onClick={() => handleToggleComplete(m)} 
                  />
                )}
              </div>

              {/* Title & Toggle */}
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold leading-tight ${m.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {m.title}
                </span>
              </div>

              {/* Photo Verification Section */}
              <div className="flex items-center gap-3">
                {m.image ? (
                  <div className="relative group/thumb w-14 h-14 rounded-lg overflow-hidden border border-border bg-background shadow-sm hover:border-primary/50 transition-colors">
                    <img 
                      src={m.image} 
                      alt="Progress" 
                      className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105" 
                    />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Camera className="w-4 h-4 text-white" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleUploadPhoto(e, m.id)} 
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-background border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-[10px] font-bold text-muted-foreground hover:text-primary rounded-lg cursor-pointer transition-all shadow-sm">
                    <Camera className="w-3.5 h-3.5" />
                    Verify with Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleUploadPhoto(e, m.id)} 
                    />
                  </label>
                )}
                {m.description && (
                  <span className="text-[10px] text-muted-foreground/80 italic">{m.description}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preset Milestone Injectors */}
      <div className="pt-2 border-t border-border/30">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-2">Quick presets checklist:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const exists = milestones.some(m => m.title === p);
            return (
              <button
                key={p}
                type="button"
                disabled={exists || addingMilestone}
                onClick={() => handleAddMilestone(p)}
                className={`px-2 py-1 text-[9px] font-black tracking-wide border rounded-lg transition-all cursor-pointer ${
                  exists
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-background border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                }`}
              >
                {exists ? "✓ " : "+ "}
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Milestone Creator */}
      <div className="flex gap-2 pt-1">
        <input 
          type="text" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          placeholder="Or add custom milestone step..." 
          className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary shadow-inner"
        />
        <button
          type="button"
          disabled={addingMilestone || !newTitle.trim()}
          onClick={() => handleAddMilestone(newTitle)}
          className="px-3 bg-primary text-primary-foreground font-black text-xs rounded-xl shadow hover:bg-primary/90 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}
