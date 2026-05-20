"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddServiceForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "Men",
    occasion: "Office Wear",
    price: "",
    description: "",
    estimatedDays: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to add service");
      
      setIsOpen(false);
      setFormData({
        name: "",
        category: "Men",
        occasion: "Office Wear",
        price: "",
        description: "",
        estimatedDays: ""
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while adding the service.");
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
        + Add New Service
      </button>
    );
  }

  return (
    <div className="mt-6 p-6 border border-border rounded-xl bg-background/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Add New Service</h3>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Service Name</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Custom Men's Suit" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2">
              <option>Men</option>
              <option>Women</option>
              <option>Kids</option>
              <option>Unisex</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Occasion</label>
            <select value={formData.occasion} onChange={e => setFormData({...formData, occasion: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2">
              <option>Office Wear</option>
              <option>Party Wear</option>
              <option>Bridal</option>
              <option>Casual</option>
              <option>Alteration</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Price (₹)</label>
            <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="150.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Est. Days to Complete</label>
            <input type="number" value={formData.estimatedDays} onChange={e => setFormData({...formData, estimatedDays: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="7" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (Optional)</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 min-h-[80px]" placeholder="Specific details about what this service includes..." />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50">
          {loading ? "Adding..." : "Save Service"}
        </button>
      </form>
    </div>
  );
}
