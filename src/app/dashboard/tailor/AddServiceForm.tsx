"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Scissors, Heart, Shirt, ShoppingBag, Eye, Star, ChevronDown, Check } from "lucide-react";

interface PresetItem {
  name: string;
  category: "Men" | "Women" | "Kids" | "Unisex";
  occasion: "Office Wear" | "Party Wear" | "Bridal" | "Casual" | "Alteration";
  price: number;
  description: string;
  estimatedDays: number;
}

// Complete presets structured by Major Category and Subcategory
const SERVICE_PRESETS: Record<string, Record<string, PresetItem[]>> = {
  "Men's Tailoring": {
    "Shirts & Tops": [
      { name: "Formal Shirt Stitching", category: "Men", occasion: "Office Wear", price: 499, description: "Premium formal shirt stitching with precise cuff and collar finishes.", estimatedDays: 5 },
      { name: "Casual Shirt Stitching", category: "Men", occasion: "Casual", price: 449, description: "Relaxed casual shirt tailoring with custom comfort fit.", estimatedDays: 5 },
      { name: "Kurta (Simple)", category: "Men", occasion: "Casual", price: 599, description: "Classic simple ethnic kurta stitched with precision.", estimatedDays: 5 },
      { name: "Kurta (Designer)", category: "Men", occasion: "Party Wear", price: 999, description: "Designer ethnic kurta featuring custom neck and placket styling.", estimatedDays: 7 },
      { name: "Pathani Suit Top", category: "Men", occasion: "Party Wear", price: 899, description: "Traditional Pathani top with shoulder flaps and chest pockets.", estimatedDays: 7 },
      { name: "Short Kurta", category: "Men", occasion: "Casual", price: 499, description: "Modern short kurta style top, comfortable everyday fit.", estimatedDays: 5 },
      { name: "Waistcoat (Nehru Jacket)", category: "Men", occasion: "Party Wear", price: 1199, description: "Nehru style waistcoat with premium inner lining and pocket details.", estimatedDays: 6 }
    ],
    "Bottom Wear": [
      { name: "Formal Pant", category: "Men", occasion: "Office Wear", price: 599, description: "Formal trousers with perfect drape and crisp ironing.", estimatedDays: 5 },
      { name: "Casual Pant / Chinos", category: "Men", occasion: "Casual", price: 549, description: "Premium casual trousers or chinos stitched for ultimate comfort.", estimatedDays: 5 },
      { name: "Trouser (Slim Fit)", category: "Men", occasion: "Office Wear", price: 599, description: "Slim-fit trousers tailored for a sharp, modern silhouette.", estimatedDays: 5 },
      { name: "Pajama (Simple)", category: "Men", occasion: "Casual", price: 299, description: "Standard comfortable pajama bottom wear.", estimatedDays: 3 },
      { name: "Dhoti / Lungi", category: "Men", occasion: "Casual", price: 349, description: "Traditional bottom wear tailored to specifications.", estimatedDays: 3 }
    ],
    "Ethnic Wear": [
      { name: "Sherwani", category: "Men", occasion: "Party Wear", price: 3499, description: "Bespoke Sherwani with detailed ethnic craftsmanship and lining.", estimatedDays: 10 },
      { name: "Indo-Western Outfit", category: "Men", occasion: "Party Wear", price: 2799, description: "Fusion Indo-Western attire designed for festivals and wedding celebrations.", estimatedDays: 8 },
      { name: "Kurta-Pajama Set", category: "Men", occasion: "Casual", price: 899, description: "Complete ethnic set including custom stitched Kurta and matching Pajama.", estimatedDays: 6 },
      { name: "Jodhpuri Suit", category: "Men", occasion: "Party Wear", price: 3999, description: "Premium Jodhpuri closed-neck suit with exquisite shoulder pads and structure.", estimatedDays: 10 }
    ],
    "Suits & Blazers": [
      { name: "Blazer", category: "Men", occasion: "Office Wear", price: 2499, description: "Tailored blazer with inner canvas lining and premium chest pocket structure.", estimatedDays: 7 },
      { name: "Two-Piece Suit", category: "Men", occasion: "Office Wear", price: 4499, description: "Bespoke formal 2-piece suit (Coat + Trousers) with rich interlinings.", estimatedDays: 10 },
      { name: "Three-Piece Suit", category: "Men", occasion: "Party Wear", price: 5499, description: "Exquisite 3-piece suit including custom Coat, matching Trousers, and Waistcoat.", estimatedDays: 12 },
      { name: "Tuxedo", category: "Men", occasion: "Party Wear", price: 5999, description: "Premium tuxedo with satin lapels, tailored to sharp parameters.", estimatedDays: 12 }
    ],
    "Alteration": [
      { name: "Pant Length", category: "Men", occasion: "Alteration", price: 119, description: "Shorten or lengthen formal/casual pant hems.", estimatedDays: 2 },
      { name: "Pant Tapering", category: "Men", occasion: "Alteration", price: 149, description: "Narrow the legs of trousers for a customized slim fit.", estimatedDays: 2 },
      { name: "Waist Tight/Loosen", category: "Men", occasion: "Alteration", price: 149, description: "Adjust trouser waistbands up or down.", estimatedDays: 2 },
      { name: "Shirt Tightening", category: "Men", occasion: "Alteration", price: 149, description: "Take in shirt sides for a modern contour.", estimatedDays: 2 },
      { name: "Sleeve Shortening", category: "Men", occasion: "Alteration", price: 149, description: "Shorten shirt sleeves and adjust cuffs.", estimatedDays: 2 },
      { name: "Kurta Alteration", category: "Men", occasion: "Alteration", price: 199, description: "Fit ethnic kurta torso and sleeves.", estimatedDays: 2 },
      { name: "Zip Change", category: "Men", occasion: "Alteration", price: 99, description: "Replace damaged trouser or jacket zippers.", estimatedDays: 2 },
      { name: "Blazer Alteration (Basic)", category: "Men", occasion: "Alteration", price: 499, description: "Adjust sleeve length or side seams on blazers.", estimatedDays: 3 },
      { name: "Suit Alteration (Advanced)", category: "Men", occasion: "Alteration", price: 899, description: "Structural fit adjustments for custom formal suits.", estimatedDays: 4 }
    ]
  },
  "Ladies' Tailoring": {
    "Blouse & Saree": [
      { name: "Simple Blouse Stitching", category: "Women", occasion: "Casual", price: 499, description: "Simple blouse with round or square neck, perfect fit.", estimatedDays: 4 },
      { name: "Printed / Designer Blouse", category: "Women", occasion: "Party Wear", price: 799, description: "Designer blouse with custom neck patterns and back hooks.", estimatedDays: 5 },
      { name: "Heavy Embroidery Blouse", category: "Women", occasion: "Party Wear", price: 1199, description: "Heavy embroidery layout matching and stitching (work extra).", estimatedDays: 7 },
      { name: "Padded Blouse", category: "Women", occasion: "Party Wear", price: 899, description: "Custom padded saree blouse with perfect cups insertion and fit.", estimatedDays: 6 },
      { name: "Bridal Blouse", category: "Women", occasion: "Bridal", price: 1999, description: "High-end wedding/bridal blouse styling and drapes tailoring.", estimatedDays: 9 },
      { name: "Saree Fall & Pico", category: "Women", occasion: "Casual", price: 149, description: "Standard fall stitching and pico edging for sarees.", estimatedDays: 2 },
      { name: "Saree Roll Press", category: "Women", occasion: "Casual", price: 199, description: "Premium steam roll pressing to renew saree texture.", estimatedDays: 2 }
    ],
    "Kurti, Tops & Ethnic": [
      { name: "Straight Kurti Stitching", category: "Women", occasion: "Casual", price: 499, description: "Standard daily wear straight kurti stitching.", estimatedDays: 4 },
      { name: "Anarkali Kurti", category: "Women", occasion: "Party Wear", price: 999, description: "Flared umbrella/kalidar Anarkali gown stitching.", estimatedDays: 6 },
      { name: "Designer Tops", category: "Women", occasion: "Party Wear", price: 599, description: "Trendy custom tops featuring modern sleeve and neck patterns.", estimatedDays: 5 },
      { name: "Long Kurti / One-Piece", category: "Women", occasion: "Casual", price: 699, description: "Long designer kurti / one-piece dress tailored perfectly.", estimatedDays: 5 },
      { name: "Palazzo", category: "Women", occasion: "Casual", price: 349, description: "Flared wide-legged palazzo trousers.", estimatedDays: 3 },
      { name: "Skirt / Lehenga (Basic)", category: "Women", occasion: "Casual", price: 999, description: "Simple structured lehenga skirt or long skirt.", estimatedDays: 6 },
      { name: "Lehenga (Heavy)", category: "Women", occasion: "Party Wear", price: 2999, description: "Heavy ethnic lehenga stitching with double-can-can lining.", estimatedDays: 10 }
    ],
    "Western Wear": [
      { name: "Formal Shirt (Women)", category: "Women", occasion: "Office Wear", price: 499, description: "Crisp formal shirt customized for women's corporate styles.", estimatedDays: 5 },
      { name: "Pants / Trousers", category: "Women", occasion: "Office Wear", price: 549, description: "Perfect fit formal trousers or cigarette pants.", estimatedDays: 5 },
      { name: "Jumpsuit Stitching", category: "Women", occasion: "Party Wear", price: 1199, description: "Trendy custom stitched western jumpsuit.", estimatedDays: 6 },
      { name: "Dress (Simple)", category: "Women", occasion: "Casual", price: 799, description: "Casual everyday dress stitched to measurements.", estimatedDays: 5 },
      { name: "Dress (Designer)", category: "Women", occasion: "Party Wear", price: 1499, description: "Premium party-wear dress with customized styling.", estimatedDays: 7 },
      { name: "Gown (Simple)", category: "Women", occasion: "Party Wear", price: 1799, description: "Elegantly tailored floor length custom gown.", estimatedDays: 7 },
      { name: "Bridal Gown", category: "Women", occasion: "Bridal", price: 5999, description: "Couture wedding gown stitching with intricate layered panels.", estimatedDays: 12 }
    ],
    "Alteration": [
      { name: "Kurti Alteration", category: "Women", occasion: "Alteration", price: 129, description: "Torso fitting and side slit alignment for kurtis.", estimatedDays: 2 },
      { name: "Blouse Alteration", category: "Women", occasion: "Alteration", price: 149, description: "Sleeve adjustments, padding tweaking, or shoulder fit correction.", estimatedDays: 2 },
      { name: "Dress Alteration", category: "Women", occasion: "Alteration", price: 199, description: "Bust and side seams adjustments for dresses.", estimatedDays: 2 },
      { name: "Pant/Trouser Tapering", category: "Women", occasion: "Alteration", price: 149, description: "Narrow legs and adjust hems of trousers.", estimatedDays: 2 },
      { name: "Zip Replacement", category: "Women", occasion: "Alteration", price: 119, description: "Install premium replacements for failed garment zippers.", estimatedDays: 2 },
      { name: "Saree Pico & Fall Fix", category: "Women", occasion: "Alteration", price: 129, description: "Restitch loose saree falls or border pico edging.", estimatedDays: 2 },
      { name: "Gown Alteration (Basic)", category: "Women", occasion: "Alteration", price: 349, description: "Sleeve and side seam adjustments for gowns.", estimatedDays: 3 },
      { name: "Bridal Outfit Alteration", category: "Women", occasion: "Alteration", price: 999, description: "Fitting repairs for heavily decorated bridal/wedding wear.", estimatedDays: 5 }
    ]
  },
  "Kids' Tailoring": {
    "School Uniforms": [
      { name: "School Shirt", category: "Kids", occasion: "Casual", price: 299, description: "Official neat stitching for school uniform shirts.", estimatedDays: 4 },
      { name: "School Pant", category: "Kids", occasion: "Casual", price: 349, description: "Elastic waistband uniform shorts or trousers.", estimatedDays: 4 },
      { name: "School Skirt", category: "Kids", occasion: "Casual", price: 349, description: "Pleated school uniform skirt.", estimatedDays: 4 },
      { name: "School Frock", category: "Kids", occasion: "Casual", price: 399, description: "Standard uniform frocks for young children.", estimatedDays: 4 },
      { name: "School Shorts", category: "Kids", occasion: "Casual", price: 249, description: "Uniform elastic or buttoned shorts.", estimatedDays: 4 },
      { name: "Sportswear / PT Uniform", category: "Kids", occasion: "Casual", price: 299, description: "Comfortable athletic uniforms or tracks for PE classes.", estimatedDays: 4 }
    ],
    "Daily Wear": [
      { name: "Kids Shirt", category: "Kids", occasion: "Casual", price: 299, description: "Everyday shirt stitching for kids.", estimatedDays: 4 },
      { name: "Kids Shorts", category: "Kids", occasion: "Casual", price: 229, description: "Elastic cotton shorts for daily play.", estimatedDays: 3 },
      { name: "Kids Pajama", category: "Kids", occasion: "Casual", price: 199, description: "Cozy sleepwear pajama bottoms.", estimatedDays: 3 },
      { name: "Kids Kurta", category: "Kids", occasion: "Casual", price: 399, description: "Traditional simple ethnic kurtas for kids.", estimatedDays: 4 },
      { name: "Kids Leggings", category: "Kids", occasion: "Casual", price: 149, description: "Soft stretch kids leggings.", estimatedDays: 3 },
      { name: "Kids Tops", category: "Kids", occasion: "Casual", price: 249, description: "Casual tops or t-shirt style stitching.", estimatedDays: 4 }
    ],
    "Party Wear & Custom": [
      { name: "Party Frock", category: "Kids", occasion: "Party Wear", price: 599, description: "Pretty tiered party frocks with matching bows.", estimatedDays: 5 },
      { name: "Designer Frock", category: "Kids", occasion: "Party Wear", price: 899, description: "Exquisite net and tulle layered designer frocks.", estimatedDays: 6 },
      { name: "Gown (Kids)", category: "Kids", occasion: "Party Wear", price: 1199, description: "Princess style floor-length custom kid's gowns.", estimatedDays: 6 },
      { name: "Kids Sherwani", category: "Kids", occasion: "Party Wear", price: 1499, description: "Bespoke miniature Sherwanis with matching bottoms.", estimatedDays: 7 },
      { name: "Kids Indo-Western", category: "Kids", occasion: "Party Wear", price: 1199, description: "Festive custom stitched Indo-Western outfit for kids.", estimatedDays: 6 },
      { name: "Kids Lehenga Choli", category: "Kids", occasion: "Party Wear", price: 1199, description: "Stitch colorful Lehenga Choli set for young girls.", estimatedDays: 6 },
      { name: "Kids Kurta-Pajama Set", category: "Kids", occasion: "Casual", price: 599, description: "Ethnic complete set matching comfortable kids fits.", estimatedDays: 5 }
    ],
    "Alteration": [
      { name: "Length Adjustment", category: "Kids", occasion: "Alteration", price: 99, description: "Adjust frock, skirt, or pants lengths.", estimatedDays: 2 },
      { name: "Side Tight/Loose", category: "Kids", occasion: "Alteration", price: 99, description: "Take in or let out side seams for growing kids.", estimatedDays: 2 },
      { name: "Waist Adjustment", category: "Kids", occasion: "Alteration", price: 99, description: "Elastic repairs or waistband adjustments for kid's wear.", estimatedDays: 2 },
      { name: "Sleeve Shortening", category: "Kids", occasion: "Alteration", price: 99, description: "Hem sleeves for kids' shirts or school blazers.", estimatedDays: 2 },
      { name: "Zip Replacement", category: "Kids", occasion: "Alteration", price: 99, description: "Install sturdy childproof replacement zippers.", estimatedDays: 2 },
      { name: "School Uniform Fix", category: "Kids", occasion: "Alteration", price: 119, description: "Uniform pleats repair or pockets alignment correction.", estimatedDays: 2 },
      { name: "Frock Fitting", category: "Kids", occasion: "Alteration", price: 129, description: "Chest and waist adjustment for children's frocks.", estimatedDays: 2 }
    ]
  }
};

export function AddServiceForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preset Selection state
  const [selectedMainCat, setSelectedMainCat] = useState<string>("Men's Tailoring");
  const [selectedSubCat, setSelectedSubCat] = useState<string>("Shirts & Tops");
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "Men",
    occasion: "Office Wear",
    price: "",
    description: "",
    estimatedDays: ""
  });

  const handleApplyPreset = (preset: PresetItem, idx: number) => {
    setActivePresetIndex(idx);
    setFormData({
      name: preset.name,
      category: preset.category,
      occasion: preset.occasion,
      price: preset.price.toString(),
      description: preset.description,
      estimatedDays: preset.estimatedDays.toString()
    });
  };

  const handleMainCatChange = (cat: string) => {
    setSelectedMainCat(cat);
    const subcats = Object.keys(SERVICE_PRESETS[cat]);
    setSelectedSubCat(subcats[0]);
    setActivePresetIndex(null);
  };

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
      setActivePresetIndex(null);
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
        className="w-full mt-4 py-4 border border-dashed border-primary/50 rounded-xl text-primary font-medium hover:bg-primary/10 transition-all active:scale-[0.99] cursor-pointer"
      >
        + Add New Service
      </button>
    );
  }

  const subCategories = Object.keys(SERVICE_PRESETS[selectedMainCat] || {});
  const presetsToDisplay = SERVICE_PRESETS[selectedMainCat]?.[selectedSubCat] || [];

  return (
    <div className="mt-6 p-6 border border-border rounded-3xl bg-background/50 space-y-6 text-left relative">
      <div className="flex justify-between items-center border-b border-border/40 pb-3">
        <h3 className="font-extrabold text-lg text-foreground flex items-center gap-1.5">
          <Scissors className="w-4 h-4 text-primary animate-pulse" />
          Add New Service
        </h3>
        <button 
          onClick={() => setIsOpen(false)} 
          className="text-muted-foreground hover:text-foreground border border-border hover:bg-background/80 p-1.5 rounded-full transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Bespoke Interactive Preset Manager */}
      <div className="space-y-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
        <span className="text-[11px] font-black text-primary uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          Quick Customizing Presets
        </span>
        
        {/* Main Categories Row */}
        <div className="flex gap-2 flex-wrap">
          {Object.keys(SERVICE_PRESETS).map((mainCat) => (
            <button
              key={mainCat}
              type="button"
              onClick={() => handleMainCatChange(mainCat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedMainCat === mainCat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background border border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {mainCat}
            </button>
          ))}
        </div>

        {/* Subcategories Row */}
        <div className="flex gap-1.5 flex-wrap border-t border-border/30 pt-2.5">
          {subCategories.map((subCat) => (
            <button
              key={subCat}
              type="button"
              onClick={() => { setSelectedSubCat(subCat); setActivePresetIndex(null); }}
              className={`px-2 py-1 text-[10px] font-bold border rounded-lg transition-all cursor-pointer ${
                selectedSubCat === subCat
                  ? "bg-primary/20 border-primary/30 text-primary"
                  : "bg-background/80 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {subCat}
            </button>
          ))}
        </div>

        {/* Preset Items Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-border/30 pt-2.5 max-h-48 overflow-y-auto pr-1">
          {presetsToDisplay.map((preset, idx) => {
            const isActive = activePresetIndex === idx;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset, idx)}
                className={`p-2.5 text-left border rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between h-[64px] ${
                  isActive
                    ? "bg-primary/10 border-primary text-primary font-black shadow-sm"
                    : "bg-background border-border/80 hover:border-primary/45 text-foreground"
                }`}
              >
                <span className="text-[10.5px] line-clamp-1 font-bold leading-tight">{preset.name}</span>
                <span className="text-[9px] font-black text-primary flex items-center justify-between w-full">
                  <span>₹{preset.price}</span>
                  {isActive && <Check className="w-3 h-3 text-primary animate-scaleIn" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Service Name</label>
          <input 
            required 
            type="text" 
            value={formData.name} 
            onChange={e => { setFormData({...formData, name: e.target.value}); setActivePresetIndex(null); }} 
            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-primary outline-none text-sm text-foreground shadow-inner" 
            placeholder="e.g. Custom Men's Suit" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Category</label>
            <select 
              value={formData.category} 
              onChange={e => { setFormData({...formData, category: e.target.value}); setActivePresetIndex(null); }} 
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
            >
              <option>Men</option>
              <option>Women</option>
              <option>Kids</option>
              <option>Unisex</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Occasion</label>
            <select 
              value={formData.occasion} 
              onChange={e => { setFormData({...formData, occasion: e.target.value}); setActivePresetIndex(null); }} 
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
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
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Base Price (₹)</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              value={formData.price} 
              onChange={e => { setFormData({...formData, price: e.target.value}); setActivePresetIndex(null); }} 
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none shadow-inner" 
              placeholder="e.g. 500" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Est. Days to Complete</label>
            <input 
              type="number" 
              value={formData.estimatedDays} 
              onChange={e => { setFormData({...formData, estimatedDays: e.target.value}); setActivePresetIndex(null); }} 
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none shadow-inner" 
              placeholder="e.g. 5" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Description (Optional)</label>
          <textarea 
            value={formData.description} 
            onChange={e => { setFormData({...formData, description: e.target.value}); setActivePresetIndex(null); }} 
            className="w-full bg-background border border-border rounded-xl px-3.5 py-2 min-h-[85px] text-sm text-foreground focus:ring-1 focus:ring-primary outline-none shadow-inner" 
            placeholder="Specific details about what this tailoring service includes..." 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-primary text-primary-foreground font-black py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-primary/10 cursor-pointer"
        >
          {loading ? "Saving..." : "Save Custom Service"}
        </button>
      </form>
    </div>
  );
}
