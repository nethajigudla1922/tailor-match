"use client";
 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ruler, Sparkles, Info, Trash2 } from "lucide-react";
 
export function MeasurementForm({ initialData = [] }: { initialData?: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Sizing Profile selection
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [profileName, setProfileName] = useState("Default Fit");
  const [focusedField, setFocusedField] = useState<string | null>(null);
 
  const [formData, setFormData] = useState({
    neck: "",
    chest: "",
    waist: "",
    hips: "",
    inseam: "",
    sleeve: "",
    shoulder: "",
    armHole: "",
  });
 
  // Load selected profile data into form
  useEffect(() => {
    if (selectedProfileId) {
      const selected = initialData.find((p) => p.id === selectedProfileId);
      if (selected) {
        setProfileName(selected.name || "");
        setFormData({
          neck: selected.neck !== null && selected.neck !== undefined ? selected.neck.toString() : "",
          chest: selected.chest !== null && selected.chest !== undefined ? selected.chest.toString() : "",
          waist: selected.waist !== null && selected.waist !== undefined ? selected.waist.toString() : "",
          hips: selected.hips !== null && selected.hips !== undefined ? selected.hips.toString() : "",
          inseam: selected.inseam !== null && selected.inseam !== undefined ? selected.inseam.toString() : "",
          sleeve: selected.sleeve !== null && selected.sleeve !== undefined ? selected.sleeve.toString() : "",
          shoulder: selected.shoulder !== null && selected.shoulder !== undefined ? selected.shoulder.toString() : "",
          armHole: selected.armHole !== null && selected.armHole !== undefined ? selected.armHole.toString() : "",
        });
      }
    } else {
      setProfileName("New Fit Set");
      setFormData({
        neck: "",
        chest: "",
        waist: "",
        hips: "",
        inseam: "",
        sleeve: "",
        shoulder: "",
        armHole: "",
      });
    }
  }, [selectedProfileId, initialData]);
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
 
  // Autofill size preset standard values
  const handleApplyPreset = (size: string) => {
    const presets: Record<string, typeof formData> = {
      XS: { neck: "13.5", chest: "32", waist: "26", hips: "32", inseam: "28", sleeve: "31.5", shoulder: "16", armHole: "14" },
      S: { neck: "14.5", chest: "36", waist: "30", hips: "36", inseam: "29", sleeve: "32.5", shoulder: "17", armHole: "15.5" },
      M: { neck: "15.5", chest: "40", waist: "34", hips: "40", inseam: "30", sleeve: "33.5", shoulder: "18", armHole: "17" },
      L: { neck: "16.5", chest: "44", waist: "38", hips: "44", inseam: "31", sleeve: "34.5", shoulder: "19", armHole: "18.5" },
      XL: { neck: "17.5", chest: "48", waist: "42", hips: "48", inseam: "32", sleeve: "35.5", shoulder: "20", armHole: "20" },
      XXL: { neck: "18.5", chest: "52", waist: "46", hips: "52", inseam: "33", sleeve: "36.5", shoulder: "21", armHole: "21.5" },
    };
 
    const preset = presets[size];
    if (preset) {
      setFormData(preset);
      setProfileName(`Standard ${size} Size`);
      setSuccess(false);
    }
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
 
    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          ...formData
        })
      });
      
      if (!res.ok) throw new Error("Failed to save measurements");
      
      const newMeasurement = await res.json();
      setSuccess(true);
      
      // Update local drop down selection to show new/updated fit
      setSelectedProfileId(newMeasurement.id);
      
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };
 
  // Anatomically realistic sizing proportion warning math
  const getSizeWarnings = () => {
    const warnings: string[] = [];
    const n = parseFloat(formData.neck);
    const c = parseFloat(formData.chest);
    const w = parseFloat(formData.waist);
    const h = parseFloat(formData.hips);
    const i = parseFloat(formData.inseam);
    const sl = parseFloat(formData.sleeve);
    const sh = parseFloat(formData.shoulder);
    const ah = parseFloat(formData.armHole);
 
    if (formData.neck && (n < 10 || n > 25)) warnings.push("Neck size seems atypical (standard is 10-25 inches).");
    if (formData.chest && (c < 25 || c > 75)) warnings.push("Chest size seems atypical (standard is 25-75 inches).");
    if (formData.waist && (w < 20 || w > 75)) warnings.push("Waist size seems atypical (standard is 20-75 inches).");
    if (formData.hips && (h < 25 || h > 80)) warnings.push("Hips size seems atypical (standard is 25-80 inches).");
    if (formData.inseam && (i < 15 || i > 45)) warnings.push("Inseam size seems atypical (standard is 15-45 inches).");
    if (formData.sleeve && (sl < 15 || sl > 45)) warnings.push("Sleeve size seems atypical (standard is 15-45 inches).");
    if (formData.shoulder && (sh < 10 || sh > 30)) warnings.push("Shoulder width seems atypical (standard is 10-30 inches).");
    if (formData.armHole && (ah < 10 || ah > 30)) warnings.push("Arm hole size seems atypical (standard is 10-30 inches).");
 
    if (formData.chest && formData.waist && Math.abs(c - w) > 25) {
      warnings.push(`Waist (${w}") and Chest (${c}") ratio seems highly atypical for standard designs.`);
    }
    if (formData.waist && formData.hips && h < w - 10) {
      warnings.push(`Hip measurement (${h}") is unusually narrow compared to waist (${w}").`);
    }
 
    return warnings;
  };

  // Delete measurement profile
  const handleDeleteProfile = async () => {
    if (!selectedProfileId) return;
    if (!confirm(`Are you sure you want to permanently delete the sizing profile "${profileName}"?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/measurements?id=${selectedProfileId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete measurement profile");
      }
      
      setSelectedProfileId("");
      setProfileName("New Fit Set");
      setFormData({
        neck: "",
        chest: "",
        waist: "",
        hips: "",
        inseam: "",
        sleeve: "",
        shoulder: "",
        armHole: "",
      });
      setSuccess(false);
      alert("Sizing profile successfully deleted.");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete sizing profile.");
    } finally {
      setLoading(false);
    }
  };
 
  // Get measurement explanation tips
  const getHelperText = () => {
    switch (focusedField) {
      case "neck":
        return "Neck: Measure around the base of your neck where a standard collar sits comfortably.";
      case "chest":
        return "Chest: Measure around the fullest part of your chest, holding the tape firm and level.";
      case "waist":
        return "Waist: Measure around your natural waistline, just above your hip bones.";
      case "hips":
        return "Hips: Measure around the widest part of your hips and glutes.";
      case "inseam":
        return "Inseam: Measure from the lowest crotch point straight down to your ankle.";
      case "sleeve":
        return "Sleeve: Measure from your shoulder seam down to your wrist bone.";
      case "shoulder":
        return "Shoulder: Measure across the back from the edge of one shoulder bone to the other.";
      case "armHole":
        return "Arm Hole: Measure around the shoulder joint, running the tape under the arm and over the top of the shoulder.";
      default:
        return "Tip: Click or focus on any measurement box on the left for a live guide on where to measure.";
    }
  };
 
  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-500/10 text-green-500 p-3 rounded-lg border border-green-500/50 text-sm font-medium text-left">
          Sizing Profile "{profileName}" saved successfully!
        </div>
      )}
 
      {/* Profile Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-background/30 p-4 rounded-2xl border border-border text-left">
        <div>
          <label className="block text-sm font-semibold mb-2 text-primary flex items-center gap-1.5">
            <Ruler className="w-4 h-4" />
            Load Saved Sizing Profile
          </label>
          <div className="flex gap-2">
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Create New Sizing Profile --</option>
              {initialData.map((profile: any) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
            {selectedProfileId && (
              <button
                type="button"
                onClick={handleDeleteProfile}
                className="px-4.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
                title="Delete Sizing Profile"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>
 
        <div>
          <label className="block text-sm font-semibold mb-2 text-primary flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Sizing Profile Name
          </label>
          <input
            type="text"
            required
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="e.g. Dad's Slim Fit, Wedding Tux Size"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary font-medium"
          />
        </div>
      </div>
 
      {/* Premium Standard Size Presets Button bar */}
      <div className="bg-background/25 border border-border p-5 rounded-2xl text-left space-y-3.5 shadow-md">
        <label className="block text-xs font-black text-primary tracking-wider uppercase flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          Autofill Standard Sizes Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handleApplyPreset(size)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-border/80 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all active:scale-[0.96] shadow-sm flex items-center gap-1 cursor-pointer"
            >
              Preset: {size}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground leading-normal">
          💡 Click a size to auto-populate standard chest, waist, hips, and inseam configurations, then customize them below for your perfect tailored fit!
        </p>
      </div>
 
      {/* 2-Column interactive mannequin layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Grid: Input Fields */}
        <form onSubmit={handleSubmit} className="md:col-span-7 space-y-6 text-left">
          {getSizeWarnings().length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 rounded-xl p-3.5 text-xs space-y-1.5 mb-2">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                Proportional Sizing Alert:
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                {getSizeWarnings().map((w, idx) => <li key={idx}>{w}</li>)}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "Neck (inches)", name: "neck" },
              { label: "Chest (inches)", name: "chest" },
              { label: "Waist (inches)", name: "waist" },
              { label: "Hips (inches)", name: "hips" },
              { label: "Inseam (inches)", name: "inseam" },
              { label: "Sleeve (inches)", name: "sleeve" },
              { label: "Shoulder (inches)", name: "shoulder" },
              { label: "Arm Hole (inches)", name: "armHole" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-2">{field.label}</label>
                <input 
                  type="number" 
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField(null)}
                  step="0.1"
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  placeholder="e.g. 15.5"
                />
              </div>
            ))}
          </div>
 
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 disabled:opacity-50">
              {loading ? "Saving Profile..." : `Save "${profileName}" Profile`}
            </button>
          </div>
        </form>
 
        {/* Right Grid: Mannequin Visual Helper */}
        <div className="md:col-span-5 flex flex-col items-center p-6 rounded-3xl bg-background/30 border border-border relative overflow-hidden min-h-[380px] justify-between">
          <div className="absolute inset-0 bg-primary/5 -z-10 rounded-3xl" />
          
          <h4 className="text-sm font-bold text-foreground mb-4">Fitting Visual Guide</h4>
          
          {/* Mannequin SVG Graphics */}
          <div className="relative w-full max-w-[160px] h-[260px] flex items-center justify-center">
            <svg viewBox="0 0 120 300" className="w-full h-full text-muted-foreground/20 fill-current stroke-border/40 stroke-1">
              {/* Head */}
              <circle cx="60" cy="30" r="10" className="fill-muted-foreground/15" />
              {/* Neck */}
              <rect x="56" y="40" width="8" height="10" className="fill-muted-foreground/15" />
              {/* Torso */}
              <path d="M 42,50 L 78,50 L 72,110 L 76,140 L 68,160 L 52,160 L 44,140 L 48,110 Z" className="fill-muted-foreground/15 stroke-border/30 stroke-[1]" />
              
              {/* Left Arm */}
              <path d="M 42,50 L 32,100 L 28,140" className="stroke-muted-foreground/15 stroke-[7] stroke-linecap-round fill-none" />
              {/* Right Arm */}
              <path d="M 78,50 L 88,100 L 92,140" className="stroke-muted-foreground/15 stroke-[7] stroke-linecap-round fill-none" />
 
              {/* Left Leg */}
              <path d="M 52,160 L 48,220 L 46,275" className="stroke-muted-foreground/15 stroke-[9] stroke-linecap-round fill-none" />
              {/* Right Leg */}
              <path d="M 68,160 L 72,220 L 74,275" className="stroke-muted-foreground/15 stroke-[9] stroke-linecap-round fill-none" />
 
              {/* Glow overlays on active focus */}
              {focusedField === "neck" && (
                <ellipse cx="60" cy="45" rx="6.5" ry="2.2" className="stroke-primary stroke-[3] fill-none animate-pulse" />
              )}
              {focusedField === "shoulder" && (
                <line x1="38" y1="52" x2="82" y2="52" className="stroke-primary stroke-[3] stroke-linecap-round animate-pulse" />
              )}
              {focusedField === "chest" && (
                <line x1="45" y1="72" x2="75" y2="72" className="stroke-primary stroke-[3] stroke-linecap-round animate-pulse" />
              )}
              {focusedField === "waist" && (
                <line x1="49" y1="108" x2="71" y2="108" className="stroke-primary stroke-[3] stroke-linecap-round animate-pulse" />
              )}
              {focusedField === "hips" && (
                <line x1="45" y1="140" x2="75" y2="140" className="stroke-primary stroke-[3] stroke-linecap-round animate-pulse" />
              )}
              {focusedField === "sleeve" && (
                <path d="M 78,50 L 88,100 L 92,140" className="stroke-primary stroke-[3.5] stroke-linecap-round fill-none animate-pulse" />
              )}
              {focusedField === "inseam" && (
                <path d="M 60,162 L 48,220 L 46,275" className="stroke-primary stroke-[3.5] stroke-linecap-round fill-none animate-pulse" />
              )}
              {focusedField === "armHole" && (
                <>
                  <ellipse cx="42" cy="55" rx="3" ry="6" className="stroke-primary stroke-[2.5] fill-none animate-pulse" />
                  <ellipse cx="78" cy="55" rx="3" ry="6" className="stroke-primary stroke-[2.5] fill-none animate-pulse" />
                </>
              )}
            </svg>
          </div>
 
          {/* Information helper alert card */}
          <div className="w-full mt-4 bg-primary/10 border border-primary/20 rounded-2xl p-3 flex gap-2 items-start text-xs text-foreground/80 leading-normal">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="font-semibold text-primary/90 text-left transition-all duration-300">
              {getHelperText()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
