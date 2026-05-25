"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Eye, X, Clock, Tag, Sparkles, Check } from "lucide-react";

interface Service {
  id: string;
  name: string;
  category: string;
  occasion: string | null;
  price: number;
  description: string | null;
  estimatedDays: number | null;
}

interface ServiceManagerProps {
  initialServices: Service[];
}

export function ServiceManager({ initialServices }: ServiceManagerProps) {
  const router = useRouter();
  
  // Modals state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Form states for Editing
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    category: "Men",
    occasion: "Office Wear",
    price: "",
    description: "",
    estimatedDays: ""
  });
  
  const [loading, setLoading] = useState(false);

  // Trigger detailed View Modal
  const handleView = (service: Service) => {
    setSelectedService(service);
    setViewModalOpen(true);
  };

  // Trigger Edit Modal and prefill form
  const handleEditInit = (service: Service) => {
    setSelectedService(service);
    setEditForm({
      id: service.id,
      name: service.name,
      category: service.category,
      occasion: service.occasion || "Office Wear",
      price: service.price.toString(),
      description: service.description || "",
      estimatedDays: service.estimatedDays?.toString() || ""
    });
    setEditModalOpen(true);
  };

  // Trigger Delete confirmation
  const handleDeleteInit = (service: Service) => {
    setSelectedService(service);
    setDeleteModalOpen(true);
  };

  // Submit Edit Form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/services/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          occasion: editForm.occasion,
          price: editForm.price,
          description: editForm.description,
          estimatedDays: editForm.estimatedDays
        })
      });

      if (!res.ok) throw new Error("Failed to update service");

      setEditModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error saving service changes.");
    } finally {
      setLoading(false);
    }
  };

  // Execute Delete
  const handleDeleteConfirm = async () => {
    if (!selectedService) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/services/${selectedService.id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete service");

      setDeleteModalOpen(false);
      setSelectedService(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error deleting the service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {initialServices.map((svc) => (
          <div 
            key={svc.id} 
            className="p-5 rounded-2xl border border-border/80 bg-background/50 hover:border-primary/45 hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                  {svc.category}
                </span>
                <span className="font-bold text-base text-primary">
                  ₹{svc.price.toFixed(2)}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-lg mb-1 leading-snug group-hover:text-primary transition-colors">
                {svc.name}
              </h3>
              <p className="text-xs text-muted-foreground font-semibold mb-3 flex items-center gap-1">
                <Tag className="w-3 h-3 text-muted-foreground/60" />
                {svc.occasion || "Casual"}
              </p>
              {svc.description && (
                <p className="text-xs text-muted-foreground/80 line-clamp-2 italic mb-4">
                  "{svc.description}"
                </p>
              )}
            </div>

            {/* Premium Action Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-border/40 mt-auto">
              <button
                type="button"
                onClick={() => handleView(svc)}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border border-border bg-background hover:bg-background/80 text-foreground font-semibold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                title="View Full Details"
              >
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                <span>View</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleEditInit(svc)}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                title="Edit Details"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteInit(svc)}
                className="flex-none p-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-500 rounded-xl transition-all shadow-sm cursor-pointer"
                title="Delete Service"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MODAL (Glassmorphic) */}
      {viewModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-md" onClick={() => setViewModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-border/80 rounded-3xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setViewModalOpen(false)} 
              className="absolute right-4 top-4 p-1.5 rounded-full border border-border hover:bg-background/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Service Details</h3>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                <h4 className="font-extrabold text-foreground text-lg">{selectedService.name}</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">{selectedService.category} • {selectedService.occasion || "Casual"}</span>
                  <span className="font-black text-primary text-base">₹{selectedService.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3.5 text-sm">
                {selectedService.description && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Description</span>
                    <p className="p-3 bg-background border border-border/60 rounded-xl italic text-foreground/80 leading-relaxed">
                      "{selectedService.description}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-background border border-border/60 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Lead Time
                    </span>
                    <p className="font-bold text-foreground text-xs">
                      {selectedService.estimatedDays ? `${selectedService.estimatedDays} Business Days` : "Not Specified"}
                    </p>
                  </div>

                  <div className="p-3 bg-background border border-border/60 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-primary" />
                      Service Type
                    </span>
                    <p className="font-bold text-foreground text-xs">
                      Premium Crafting
                    </p>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setViewModalOpen(false)}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT FORM MODAL */}
      {editModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-md" onClick={() => setEditModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-border/80 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setEditModalOpen(false)} 
              className="absolute right-4 top-4 p-1.5 rounded-full border border-border hover:bg-background/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Service
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Service Name</label>
                <input 
                  required 
                  type="text" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary outline-none text-sm" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Category</label>
                  <select 
                    value={editForm.category} 
                    onChange={e => setEditForm({...editForm, category: e.target.value})} 
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm"
                  >
                    <option>Men</option>
                    <option>Women</option>
                    <option>Kids</option>
                    <option>Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Occasion</label>
                  <select 
                    value={editForm.occasion} 
                    onChange={e => setEditForm({...editForm, occasion: e.target.value})} 
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm"
                  >
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
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Base Price (₹)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={editForm.price} 
                    onChange={e => setEditForm({...editForm, price: e.target.value})} 
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Est. Days</label>
                  <input 
                    type="number" 
                    value={editForm.estimatedDays} 
                    onChange={e => setEditForm({...editForm, estimatedDays: e.target.value})} 
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Description (Optional)</label>
                <textarea 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 min-h-[80px] text-sm" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all mt-2"
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-md" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-background border border-border/80 rounded-3xl p-6 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-foreground mb-1">Delete Service?</h3>
            <p className="text-xs text-muted-foreground/80 mb-6">
              Are you sure you want to delete <strong className="text-foreground">"{selectedService.name}"</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 border border-border hover:bg-background/80 text-foreground font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
