"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";

// Image compression helper
function compressImage(file: File, callback: (base64: string) => void) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 800; // Premium portfolio looks stunning at 800px width
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
      callback(canvas.toDataURL("image/jpeg", 0.7)); // High fidelity 70% JPEG
    };
  };
}

export function PortfolioManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Unisex");
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchPortfolio = async () => {
    try {
      const res = await fetch("/api/tailor/portfolio");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setImage(compressedBase64);
        setError("");
      });
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError("Please select a portfolio image.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/tailor/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          title,
          description: desc,
          serviceCategory: category
        })
      });

      if (res.ok) {
        setTitle("");
        setDesc("");
        setImage(null);
        setCategory("Unisex");
        fetchPortfolio();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to add portfolio design");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this design from your public portfolio?")) return;
    try {
      const res = await fetch(`/api/tailor/portfolio?id=${itemId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchPortfolio();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Loading portfolio designs...</span>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-3xl border border-primary/20 space-y-8">
      <div className="flex items-center space-x-3 mb-2">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Sparkles className="text-primary w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Your Portfolio</h2>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Showcase your signature designs on your profile</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3.5 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Grid of Current Portfolio Items */}
      {items.length === 0 ? (
        <div className="text-center py-8 bg-background/25 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center space-y-2">
          <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground italic">You haven't uploaded any designs yet. Upload your first masterpiece below!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-border bg-background shadow-sm hover:shadow-md transition-all">
              <img src={item.image} alt={item.title} className="w-full aspect-[4/3] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 space-y-0.5">
                <span className="text-white text-[11px] font-black tracking-wide truncate">{item.title}</span>
                {item.serviceCategory && (
                  <span className="text-sky-300 text-[9px] font-black uppercase tracking-wider">{item.serviceCategory}</span>
                )}
                {item.description && (
                  <span className="text-zinc-300 text-[9px] line-clamp-1 italic">{item.description}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 text-white hover:text-white p-2 rounded-xl transition-all cursor-pointer shadow opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Design Upload Form */}
      <form onSubmit={handleAddPortfolio} className="space-y-4 pt-4 border-t border-border/40">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-primary" />
          Add Portfolio Masterpiece
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Form Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Design Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Premium Silk Sherwani"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Service Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Description (Optional)</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Detail the materials, patterns, fabric drape weight, stitch pattern, etc."
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs min-h-[60px] outline-none focus:ring-1 focus:ring-primary shadow-inner"
              />
            </div>
          </div>

          {/* Photo Uploader Box */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Design Photo</label>
            <label className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 bg-background/15 transition-all overflow-hidden relative shadow-sm">
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Replace Photo</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center p-4 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground/60 mb-2" />
                  <span className="text-xs text-foreground font-bold">Click to select model photo</span>
                  <span className="text-[10px] text-muted-foreground mt-1">High fidelity smart compression active</span>
                </div>
              )}
              <input type="file" accept="image/*" required className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !image}
          className="w-full bg-primary text-primary-foreground font-extrabold text-xs py-3.5 rounded-xl hover:bg-primary/95 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-md cursor-pointer flex items-center justify-center gap-1.5"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Publishing design...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Publish Design to Public Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}
