"use client";
 
import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, MapPin, Scissors, Search, SlidersHorizontal, ArrowUpDown, ShieldCheck, Truck, Loader2 } from "lucide-react";
 
interface TailorListProps {
  initialTailors: any[];
}
 
// Haversine formula to compute great-circle distance between two GPS coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
 
export function TailorList({ initialTailors }: TailorListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("rating"); // rating, reviews, name, price_low, price_high, distance
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [homeVisitOnly, setHomeVisitOnly] = useState(false);
  
  // Geolocation states for sorting by distance
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
 
  // Get all unique categories/occasions available across services
  const categories = useMemo(() => {
    const list = new Set<string>();
    initialTailors.forEach((t) => {
      t.services.forEach((s: any) => {
        if (s.category) list.add(s.category);
      });
    });
    return ["All", ...Array.from(list)];
  }, [initialTailors]);
 
  // Handle Sort By dropdown selection
  const handleSortChange = (value: string) => {
    setSortBy(value);
    
    if (value === "distance" && !userCoords) {
      setLoadingLocation(true);
      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setLoadingLocation(false);
          },
          (err) => {
            console.error(err);
            alert("Could not access your location. Please verify browser permissions and try again.");
            setSortBy("rating");
            setLoadingLocation(false);
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
        setSortBy("rating");
        setLoadingLocation(false);
      }
    }
  };
 
  // Process filtering and sorting on the fly
  const filteredTailors = useMemo(() => {
    let result = [...initialTailors];
 
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => 
        (t.shopName && t.shopName.toLowerCase().includes(q)) ||
        (t.user?.name && t.user.name.toLowerCase().includes(q)) ||
        (t.address && t.address.toLowerCase().includes(q)) ||
        (t.bio && t.bio.toLowerCase().includes(q))
      );
    }
 
    // 2. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((t) => 
        t.services.some((s: any) => s.category === selectedCategory)
      );
    }
 
    // 3. Verified Status Filter
    if (verifiedOnly) {
      result = result.filter((t) => t.isVerified);
    }
 
    // 4. Home Visit Availability Filter
    if (homeVisitOnly) {
      result = result.filter((t) => t.travelFee !== null && t.travelRadius > 0);
    }
 
    // 5. Sorting Logic
    result.sort((a, b) => {
      const aRating = a.reviews.length > 0 
        ? a.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / a.reviews.length
        : 0;
      const bRating = b.reviews.length > 0 
        ? b.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / b.reviews.length
        : 0;
 
      if (sortBy === "distance" && userCoords) {
        const distA = a.latitude && a.longitude 
          ? calculateDistance(userCoords.lat, userCoords.lng, a.latitude, a.longitude)
          : 99999;
        const distB = b.latitude && b.longitude 
          ? calculateDistance(userCoords.lat, userCoords.lng, b.latitude, b.longitude)
          : 99999;
        return distA - distB; // closest first
      }
      if (sortBy === "rating") {
        return bRating - aRating;
      }
      if (sortBy === "reviews") {
        return b.reviews.length - a.reviews.length;
      }
      if (sortBy === "name") {
        const nameA = a.shopName || a.user?.name || "";
        const nameB = b.shopName || b.user?.name || "";
        return nameA.localeCompare(nameB);
      }
      if (sortBy === "price_low") {
        const priceA = a.services.length > 0 ? Math.min(...a.services.map((s: any) => s.price)) : 9999;
        const priceB = b.services.length > 0 ? Math.min(...b.services.map((s: any) => s.price)) : 9999;
        return priceA - priceB;
      }
      if (sortBy === "price_high") {
        const priceA = a.services.length > 0 ? Math.max(...a.services.map((s: any) => s.price)) : 0;
        const priceB = b.services.length > 0 ? Math.max(...b.services.map((s: any) => s.price)) : 0;
        return priceB - priceA;
      }
      return 0;
    });
 
    return result;
  }, [initialTailors, searchQuery, selectedCategory, sortBy, verifiedOnly, homeVisitOnly, userCoords]);
 
  return (
    <div className="space-y-10 text-left">
      {/* Premium Glassmorphic Filters Panel */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-primary/20 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
          
          {/* Search bar */}
          <div className="lg:col-span-2 relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by shop name, landmark, or category..."
              className="w-full bg-background/50 border border-border pl-12 pr-4 py-3.5 rounded-2xl focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all shadow-inner"
            />
          </div>
 
          {/* Category Dropdown Selector */}
          <div className="relative flex items-center">
            <SlidersHorizontal className="w-4 h-4 absolute left-4 text-muted-foreground pointer-events-none" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-background/50 border border-border pl-10 pr-4 py-3.5 rounded-2xl outline-none focus:ring-1 focus:ring-primary text-sm appearance-none cursor-pointer"
            >
              <option value="All">All Wear Categories</option>
              {categories.filter(c => c !== "All").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
 
          {/* Sort By Dropdown */}
          <div className="relative flex items-center">
            {loadingLocation ? (
              <Loader2 className="w-4 h-4 absolute left-4 text-primary animate-spin pointer-events-none" />
            ) : (
              <ArrowUpDown className="w-4 h-4 absolute left-4 text-muted-foreground pointer-events-none" />
            )}
            <select 
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              disabled={loadingLocation}
              className="w-full bg-background/50 border border-border pl-10 pr-4 py-3.5 rounded-2xl outline-none focus:ring-1 focus:ring-primary text-sm appearance-none cursor-pointer disabled:opacity-55"
            >
              <option value="rating">Sort: Highest Rating ★</option>
              <option value="distance">Sort: Nearest to Me 📍</option>
              <option value="reviews">Sort: Most Reviewed</option>
              <option value="name">Sort: Alphabetical (A-Z)</option>
              <option value="price_low">Sort: Starting Price (Low to High)</option>
              <option value="price_high">Sort: Pricing (High to Low)</option>
            </select>
          </div>
 
        </div>
 
        {/* Toggle Pill Filters */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-border/40">
          <button 
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] ${
              verifiedOnly 
                ? "bg-blue-500/10 border-blue-500/40 text-blue-400" 
                : "bg-background/20 border-border/50 text-muted-foreground hover:bg-background/40"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Verified Stylists Only
          </button>
 
          <button 
            onClick={() => setHomeVisitOnly(!homeVisitOnly)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] ${
              homeVisitOnly 
                ? "bg-primary/10 border-primary/40 text-primary" 
                : "bg-background/20 border-border/50 text-muted-foreground hover:bg-background/40"
            }`}
          >
            <Truck className="w-4 h-4" />
            Offers Home Visit
          </button>
 
          {(searchQuery || selectedCategory !== "All" || verifiedOnly || homeVisitOnly || userCoords) && (
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setVerifiedOnly(false);
                setHomeVisitOnly(false);
                setUserCoords(null);
                setSortBy("rating");
              }}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-2 underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
 
      {/* Listings Grid */}
      {filteredTailors.length === 0 ? (
        <div className="glass p-16 rounded-3xl text-center border border-border/50">
          <p className="text-muted-foreground text-sm">No tailors match your search criteria. Try removing some filters!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTailors.map((tailor) => {
            const avgRating = tailor.reviews.length > 0 
              ? (tailor.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / tailor.reviews.length).toFixed(1)
              : "New";
            const minPrice = tailor.services.length > 0 
              ? Math.min(...tailor.services.map((s: any) => s.price)) 
              : null;
            return (
              <div key={tailor.id} className="glass rounded-3xl overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-350 group flex flex-col relative">
                
                {/* Banner & Avatar section */}
                <div className="h-44 relative overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                  {tailor.profilePicture ? (
                    <img 
                      src={tailor.profilePicture} 
                      alt={tailor.shopName || tailor.user.name || "Tailor"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Scissors className="text-primary w-12 h-12 opacity-50 animate-pulse" />
                  )}
                  
                  {/* Floating badges */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    {tailor.isVerified && (
                      <span className="bg-blue-500 text-white text-[9px] font-black tracking-wider uppercase px-2 py-1 rounded-md flex items-center gap-0.5 shadow-md shadow-blue-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                    {tailor.travelFee !== null && tailor.travelRadius > 0 && (
                      <span className="bg-emerald-500 text-white text-[9px] font-black tracking-wider uppercase px-2 py-1 rounded-md flex items-center gap-0.5 shadow-md shadow-emerald-500/20">
                        <Truck className="w-3.5 h-3.5" />
                        Home Visit
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Main Card Content */}
                <div className="p-6 flex-1 flex flex-col relative z-20 -mt-10">
                  <div className="bg-background border border-border/80 p-4 rounded-2xl mb-4 shadow-xl">
                    <h2 className="text-lg font-bold text-foreground truncate">{tailor.shopName || tailor.user.name}</h2>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5 gap-2">
                      <div className="flex items-center truncate">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
                        <span className="truncate">{tailor.address || "Location not provided"}</span>
                      </div>
                      
                      {/* Uber/Swiggy-style real-time distance badge */}
                      {userCoords && tailor.latitude && tailor.longitude && (
                        <span className="text-[10px] text-primary font-black bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg shrink-0">
                          {calculateDistance(userCoords.lat, userCoords.lng, tailor.latitude, tailor.longitude).toFixed(1)} km away
                        </span>
                      )}
                    </div>
                  </div>
 
                  <p className="text-muted-foreground text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
                    {tailor.bio || "Expert tailor ready to take your measurements and craft the perfect fit."}
                  </p>
 
                  {/* Footer Card Section */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-primary">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="font-bold text-sm">{avgRating}</span>
                        {tailor.reviews.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">({tailor.reviews.length})</span>
                        )}
                      </div>
                      {minPrice !== null && (
                        <p className="text-[10px] text-muted-foreground">
                          Starts at <span className="text-foreground font-black text-xs">₹{minPrice.toFixed(0)}</span>
                        </p>
                      )}
                    </div>
 
                    <Link 
                      href={`/tailors/${tailor.id}`}
                      className="px-4.5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 hover:scale-[1.03] transition-all text-xs"
                    >
                      View Services
                    </Link>
                  </div>
 
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
