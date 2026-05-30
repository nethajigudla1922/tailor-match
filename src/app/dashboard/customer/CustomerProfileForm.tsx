"use client";

import { useState } from "react";
import { User, Phone, Mail, MapPin, Upload, Camera } from "lucide-react";

// Image compression utility
function compressImage(file: File, callback: (compressedBase64: string) => void) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 400; // Profile pictures can be smaller
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

export function CustomerProfileForm({ profile }: { profile: any }) {
  const [formData, setFormData] = useState({
    name: profile?.user?.name || "",
    email: profile?.user?.email || "",
    phone: profile?.user?.phone || "",
    address: profile?.address || "",
    profilePicture: profile?.profilePicture || ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (base64) => {
        setFormData(prev => ({ ...prev, profilePicture: base64 }));
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <h3 className="text-xl font-bold border-b border-border/40 pb-3 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Personal Details & Settings
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg text-sm text-center font-bold">
          Profile Settings saved successfully!
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
        {/* Profile Picture Upload */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/20 shadow-md">
            {formData.profilePicture ? (
              <img 
                src={formData.profilePicture} 
                alt="Profile Preview" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User className="w-12 h-12 text-muted-foreground/40" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer shadow-lg hover:scale-105 transition-all">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h4 className="font-extrabold text-foreground">{formData.name || "Customer Account"}</h4>
          <p className="text-xs text-muted-foreground">Upload your profile picture for a personalized portal experience.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2">Full Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 focus:ring-primary text-sm font-medium"
              placeholder="John Doe"
            />
            <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Phone Number</label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 focus:ring-primary text-sm font-medium"
              placeholder="9876543210"
            />
            <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-2">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 focus:ring-primary text-sm font-medium"
              placeholder="you@example.com"
            />
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-2">Saved Delivery Address</label>
          <div className="relative">
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 focus:ring-primary text-sm font-medium min-h-[70px]"
              placeholder="123 Creative Street, Design City"
            />
            <MapPin className="w-4 h-4 text-muted-foreground absolute left-3.5 top-4" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? "Saving Settings..." : "Save Settings"}
      </button>
    </form>
  );
}
