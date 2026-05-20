"use client";

import { useState, useEffect } from "react";
import { Sparkles, Eye, Scissors, Loader2 } from "lucide-react";

export function PortfolioGrid({ tailorProfileId }: { tailorProfileId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`/api/tailor/portfolio?tailorProfileId=${tailorProfileId}`);
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
    fetchPortfolio();
  }, [tailorProfileId]);

  const handleBookSimilar = (item: any) => {
    setSelectedItem(null);
    const event = new CustomEvent("book-similar", {
      detail: {
        title: item.title,
        description: item.description,
        image: item.image
      }
    });
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
        <span className="text-xs text-muted-foreground">Opening design vaults...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl bg-background/25 text-center border border-dashed border-border/80">
        <Sparkles className="w-8 h-8 text-primary/30 mx-auto mb-2" />
        <p className="text-muted-foreground text-xs">No design collection uploaded by this tailor yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Sparkles className="text-primary w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Design Collection & Portfolio</h2>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Browse signature outfits tailored in our boutique</p>
        </div>
      </div>

      {/* Masonry Columns Feed */}
      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)}
            className="break-inside-avoid relative rounded-2xl overflow-hidden border border-border/60 bg-background/40 group shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left">
              <span className="text-white text-xs font-black tracking-wide leading-tight">{item.title}</span>
              {item.serviceCategory && (
                <span className="text-sky-300 text-[9px] font-black uppercase tracking-wider mt-0.5">{item.serviceCategory} Style</span>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-white/90 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  View Details
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Glassmorphic Lightbox Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-white/90 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col md:flex-row gap-6 cursor-default text-left overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Design High-Res Display */}
            <div className="flex-1 aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden border border-border shadow-inner bg-black flex items-center justify-center">
              <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-contain" />
            </div>

            {/* Design Information & Quick Book Column */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-border/40 pb-2">
                  <div>
                    <h3 className="text-xl font-bold text-foreground leading-tight">{selectedItem.title}</h3>
                    {selectedItem.serviceCategory && (
                      <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider inline-block mt-1">
                        {selectedItem.serviceCategory} Category
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  >
                    Close
                  </button>
                </div>

                {selectedItem.description ? (
                  <p className="text-xs text-muted-foreground leading-relaxed italic bg-background/50 p-3 rounded-xl border border-border/40">
                    "{selectedItem.description}"
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic">No description provided for this collection piece.</p>
                )}
              </div>

              {/* Book Similar outfit Action Button */}
              <button
                type="button"
                onClick={() => handleBookSimilar(selectedItem)}
                className="w-full py-3.5 bg-primary text-primary-foreground font-black text-xs rounded-xl shadow-md hover:bg-primary/95 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Scissors className="w-4 h-4 text-primary-foreground" />
                Book Similar Custom Outfit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
