"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, X, Upload } from "lucide-react";

export function EditBookingModal({ booking }: { booking: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Format booking date to yyyy-MM-dd safely
  const initialDate = booking.appointmentDate
    ? new Date(booking.appointmentDate).toISOString().split("T")[0]
    : "";

  const [formData, setFormData] = useState({
    appointmentDate: initialDate,
    appointmentTime: booking.appointmentTime || "10:00 AM",
    deliveryType: booking.deliveryType || "SHOP_VISIT",
    notes: booking.notes || "",
    referenceImage: booking.referenceImage || null,
    neck: booking.neck !== null && booking.neck !== undefined ? booking.neck.toString() : "",
    chest: booking.chest !== null && booking.chest !== undefined ? booking.chest.toString() : "",
    waist: booking.waist !== null && booking.waist !== undefined ? booking.waist.toString() : "",
    hips: booking.hips !== null && booking.hips !== undefined ? booking.hips.toString() : "",
    inseam: booking.inseam !== null && booking.inseam !== undefined ? booking.inseam.toString() : "",
    sleeve: booking.sleeve !== null && booking.sleeve !== undefined ? booking.sleeve.toString() : "",
    shoulder: booking.shoulder !== null && booking.shoulder !== undefined ? booking.shoulder.toString() : "",
  });

function compressImage(file: File, callback: (compressedBase64: string) => void) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new window.Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 800;
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
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
      callback(compressedDataUrl);
    };
  };
}
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setFormData((prev) => ({ ...prev, referenceImage: compressedBase64 }));
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        throw new Error(data.error || "Failed to update booking");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all active:scale-[0.98]"
      >
        <Edit3 className="w-3.5 h-3.5" />
        Edit Request Details
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass p-6 md:p-8 rounded-3xl border border-primary/20 max-w-md w-full relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-foreground">Edit Booking Request</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You can change these details before the tailor accepts the booking.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-left">
              {/* Geolocation/Delivery option */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Delivery Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deliveryType: "SHOP_VISIT" })}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formData.deliveryType === "SHOP_VISIT"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-background/50 text-muted-foreground"
                    }`}
                  >
                    Shop Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deliveryType: "HOME_VISIT" })}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formData.deliveryType === "HOME_VISIT"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-background/50 text-muted-foreground"
                    }`}
                  >
                    Home Visit
                  </button>
                </div>
              </div>

              {/* Date & Time fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Time</label>
                  <select
                    required
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Reference image preview and update option */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Reference Design Photo</label>
                <div className="flex items-center gap-3">
                  {formData.referenceImage && (
                    <img
                      src={formData.referenceImage}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-border"
                    />
                  )}
                  <label className="flex-1 flex items-center justify-center h-12 border border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 bg-background/20 transition-all">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      {formData.referenceImage ? "Replace Photo" : "Upload Photo"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Custom Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm min-h-[60px] outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Notes for tailor..."
                />
              </div>

              {/* Order Specific Measurements */}
              <div className="bg-background/40 p-4 rounded-xl border border-border space-y-3">
                <h4 className="text-xs font-bold text-primary">Custom Sizes for this Specific Order (in/cm)</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Neck</label>
                    <input
                      type="number" step="0.1"
                      value={formData.neck}
                      onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Chest</label>
                    <input
                      type="number" step="0.1"
                      value={formData.chest}
                      onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Waist</label>
                    <input
                      type="number" step="0.1"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Hips</label>
                    <input
                      type="number" step="0.1"
                      value={formData.hips}
                      onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Inseam</label>
                    <input
                      type="number" step="0.1"
                      value={formData.inseam}
                      onChange={(e) => setFormData({ ...formData, inseam: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Sleeve</label>
                    <input
                      type="number" step="0.1"
                      value={formData.sleeve}
                      onChange={(e) => setFormData({ ...formData, sleeve: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Shoulder</label>
                    <input
                      type="number" step="0.1"
                      value={formData.shoulder}
                      onChange={(e) => setFormData({ ...formData, shoulder: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 border border-border bg-background hover:bg-background/80 text-foreground text-xs font-semibold py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
