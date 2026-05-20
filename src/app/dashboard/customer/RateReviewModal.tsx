"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, X, Check, Camera, Image } from "lucide-react";
 
export function RateReviewModal({ tailorId, tailorName }: { tailorId: string, tailorName: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
 
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
 
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setImage(compressedBase64);
      });
    }
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
 
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tailorId, rating, comment, image }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }
 
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setComment("");
        setImage("");
        router.refresh();
      }, 1500);
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
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all active:scale-[0.98] mt-3"
      >
        <Star className="w-3.5 h-3.5 fill-green-400" />
        Rate & Review Tailor
      </button>
 
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass p-6 md:p-8 rounded-3xl border border-primary/20 max-w-md w-full relative space-y-6">
            <button
              onClick={() => {
                setIsOpen(false);
                setImage("");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
 
            {success ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold">Review Submitted!</h4>
                <p className="text-xs text-muted-foreground">Thank you for sharing your experience!</p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Review {tailorName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Help others choose the best fit by leaving authentic feedback!
                  </p>
                </div>
 
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-xs">
                    {error}
                  </div>
                )}
 
                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
 
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Your Feedback</label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm min-h-[80px] outline-none focus:ring-1 focus:ring-primary"
                      placeholder="How did the fit turn out? Was the delivery on time?"
                    />
                  </div>
 
                  {/* Photo Upload Option */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Showcase Photo (Optional)</label>
                    
                    {image ? (
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-border shadow-md bg-zinc-800">
                        <img 
                          src={image} 
                          alt="Review Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImage("")}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 bg-background/25 active:scale-[0.98]">
                        <Camera className="w-6 h-6 text-muted-foreground opacity-60" />
                        <span className="text-[10px] font-bold text-primary">Upload Custom Fit Photo</span>
                        <p className="text-[8px] text-muted-foreground">JPG, PNG or WEBP. Max size 2MB.</p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
 
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setImage("");
                      }}
                      className="flex-1 border border-border bg-background hover:bg-background/80 text-foreground text-xs font-semibold py-3 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
