"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ruler, X, Sparkles, ShieldAlert } from "lucide-react";
 
interface RecordMeasurementsModalProps {
  booking: any;
}
 
export function RecordMeasurementsModal({ booking }: RecordMeasurementsModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
 
  const [formData, setFormData] = useState({
    neck: booking.neck !== null && booking.neck !== undefined ? booking.neck.toString() : "",
    chest: booking.chest !== null && booking.chest !== undefined ? booking.chest.toString() : "",
    waist: booking.waist !== null && booking.waist !== undefined ? booking.waist.toString() : "",
    hips: booking.hips !== null && booking.hips !== undefined ? booking.hips.toString() : "",
    inseam: booking.inseam !== null && booking.inseam !== undefined ? booking.inseam.toString() : "",
    sleeve: booking.sleeve !== null && booking.sleeve !== undefined ? booking.sleeve.toString() : "",
    shoulder: booking.shoulder !== null && booking.shoulder !== undefined ? booking.shoulder.toString() : "",
    armHole: booking.armHole !== null && booking.armHole !== undefined ? booking.armHole.toString() : "",
  });
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
 
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
 
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          ...formData,
        }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        throw new Error(data.error || "Failed to save measurements");
      }
 
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
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
 
    return warnings;
  };
 
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-black text-white bg-primary hover:bg-primary/90 border border-primary/20 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/10 cursor-pointer"
      >
        <Ruler className="w-4 h-4" />
        Record Sizing Parameters
      </button>
 
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass p-6 md:p-8 rounded-3xl border border-primary/20 max-w-md w-full relative space-y-6 max-h-[90vh] overflow-y-auto text-left">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
 
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-2 rounded-xl text-primary">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Record Garment Sizing</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Log customer sizing details for: <strong className="text-foreground">"{booking.customer.user.name || "Customer"}"</strong>
                </p>
              </div>
            </div>

            <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/10 text-[10.5px] text-muted-foreground leading-relaxed text-left">
              <span>💡 <strong>Optional Tracking:</strong> Digital sizing is completely optional. You can log dimensions here for automated fit verification, or record them directly offline in your shop diary/physical register.</span>
            </div>
 
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-xs">
                {error}
              </div>
            )}
 
            {success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-xl text-xs font-semibold">
                Sizing parameters recorded successfully!
              </div>
            )}
 
            <form onSubmit={handleSave} className="space-y-4">
              {getSizeWarnings().length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 rounded-xl p-3.5 text-[11px] space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />
                    Fitting Proportional Warning:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {getSizeWarnings().map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
 
              <div className="bg-background/40 p-4 rounded-xl border border-border space-y-3 shadow-inner">
                <h4 className="text-xs font-black text-primary uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Recorded Dimensions (inches)
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { label: "Neck", name: "neck" },
                    { label: "Chest", name: "chest" },
                    { label: "Waist", name: "waist" },
                    { label: "Hips", name: "hips" },
                    { label: "Inseam", name: "inseam" },
                    { label: "Sleeve", name: "sleeve" },
                    { label: "Shoulder", name: "shoulder" },
                    { label: "Arm Hole", name: "armHole" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-[10px] text-muted-foreground mb-1 font-semibold">{field.label}</label>
                      <input
                        type="number"
                        name={field.name}
                        step="0.1"
                        value={(formData as any)[field.name]}
                        onChange={handleChange}
                        placeholder="e.g. 16.0"
                        className="w-full bg-background border border-border rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
 
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 border border-border bg-background hover:bg-background/80 text-foreground text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Recording..." : "Save Parameters"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
