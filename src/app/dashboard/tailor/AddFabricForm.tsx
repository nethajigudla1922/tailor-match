"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddFabricForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    material: "Cotton",
    pricePerMeter: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/fabrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to add fabric");
      
      setIsOpen(false);
      setFormData({
        name: "",
        material: "Cotton",
        pricePerMeter: "",
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while adding the fabric.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 py-4 border border-dashed border-primary/50 rounded-xl text-primary font-medium hover:bg-primary/10 transition-colors"
      >
        + Add New Fabric
      </button>
    );
  }

  return (
    <div className="mt-6 p-6 border border-border rounded-xl bg-background/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Add New Fabric</h3>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fabric Name / Pattern</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Italian Checkered Blue" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Material Type</label>
            <select value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2">
              <option>Cotton</option>
              <option>Silk</option>
              <option>Wool</option>
              <option>Linen</option>
              <option>Polyester Blend</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price Per Meter (₹)</label>
            <input required type="number" step="0.01" value={formData.pricePerMeter} onChange={e => setFormData({...formData, pricePerMeter: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="25.00" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50">
          {loading ? "Adding..." : "Save Fabric"}
        </button>
      </form>
    </div>
  );
}
