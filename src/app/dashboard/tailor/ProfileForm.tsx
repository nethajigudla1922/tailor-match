"use client";
 
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, MapPin, Navigation, Image, Search } from "lucide-react";
 
export function ProfileForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    shopName: initialData?.shopName || "",
    address: initialData?.address || "",
    operatingHours: initialData?.operatingHours || "",
    travelRadius: initialData?.travelRadius?.toString() || "10",
    travelFee: initialData?.travelFee?.toString() || "0",
    profilePicture: initialData?.profilePicture || "",
    latitude: initialData?.latitude?.toString() || "12.9716", // Default Bangalore
    longitude: initialData?.longitude?.toString() || "77.5946",
  });
 
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
 
  // Load Leaflet and Render ACTUAL Google Maps Tiles dynamically (No API Key Required!)
  useEffect(() => {
    if (typeof window === 'undefined') return;
 
    const initMap = () => {
      const L = (window as any).L;
      if (!L || mapInstanceRef.current) return;
 
      const startLat = parseFloat(formData.latitude) || 12.9716;
      const startLon = parseFloat(formData.longitude) || 77.5946;
 
      // Initialize map container
      const map = L.map('google-map-picker', {
        zoomControl: false // Hide Leaflet controls for clean Swiggy/Uber look
      }).setView([startLat, startLon], 14);
 
      // Render REAL Google Maps standard roadmap tiles without requiring any API keys!
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '© Google Maps'
      }).addTo(map);
 
      // Premium custom pulsing red Google pin SVG icon
      const googlePinIcon = L.divIcon({
        className: 'custom-google-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-40"></span>
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
 
      // Add custom marker
      const marker = L.marker([startLat, startLon], { 
        draggable: true, 
        icon: googlePinIcon 
      }).addTo(map);
 
      // Marker drag events
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        await reverseGeocode(pos.lat, pos.lng);
      });
 
      // Map click events
      map.on('click', async (e: any) => {
        marker.setLatLng(e.latlng);
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
      });
 
      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapLoaded(true);
    };
 
    if ((window as any).L) {
      initMap();
    } else {
      // Inject Leaflet resources
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
 
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        initMap();
      };
      document.head.appendChild(script);
    }
  }, [formData.latitude, formData.longitude]);
 
  // Reverse Geocoding: Coordinate -> Street Address
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`);
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setFormData(prev => ({
            ...prev,
            address: data.display_name,
            latitude: lat.toString(),
            longitude: lon.toString()
          }));
        }
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };
 
  // Forward Geocoding: Address text -> Coordinate
  const geocodeAddress = async (addressStr: string) => {
    if (!addressStr.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressStr)}&format=json&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          
          setFormData(prev => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lon.toString()
          }));
 
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lon], 15);
            markerRef.current.setLatLng([lat, lon]);
          }
        }
      }
    } catch (err) {
      console.error("Forward geocoding failed:", err);
    }
  };
 
  // Geolocation detector (Swiggy / Uber style auto location select)
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setFormData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lon.toString(),
        }));
 
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lon], 16);
          markerRef.current.setLatLng([lat, lon]);
        }
 
        await reverseGeocode(lat, lon);
        setDetecting(false);
      },
      (error) => {
        console.error(error);
        alert("Failed to capture location automatically. Please search or pick manually.");
        setDetecting(false);
      }
    );
  };
 
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
        setFormData(prev => ({ ...prev, profilePicture: compressedBase64 }));
      });
    }
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
 
    try {
      const res = await fetch("/api/tailor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to update profile");
      
      setSuccess(true);
      router.refresh();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {success && (
        <div className="bg-green-500/10 text-green-500 p-3 rounded-lg border border-green-500/50 text-sm font-medium">
          Profile updated successfully!
        </div>
      )}
 
      {/* Profile Picture Uploader */}
      <div>
        <label className="block text-sm font-medium mb-3">Profile Picture</label>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0 relative group shadow-lg">
            {formData.profilePicture ? (
              <img 
                src={formData.profilePicture} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Image className="w-8 h-8 text-muted-foreground opacity-50" />
            )}
          </div>
 
          <div className="space-y-1.5">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all active:scale-[0.98]">
              <Upload className="w-3.5 h-3.5" />
              Upload Photo
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
            <p className="text-[10px] text-muted-foreground">
              JPG, PNG or WEBP. Max size 2MB.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Shop Name / Brand</label>
        <input 
          required
          type="text" 
          value={formData.shopName}
          onChange={e => setFormData({...formData, shopName: e.target.value})}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary outline-none" 
          placeholder="e.g. Master Tailors" 
        />
      </div>
 
      {/* Uber/Swiggy Location Search & Picker with Dynamic Google Maps styled tiles */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium">Workshop Location</label>
          <button 
            type="button"
            onClick={detectLocation}
            disabled={detecting}
            className="flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-all active:scale-[0.98]"
          >
            <Navigation className="w-3.5 h-3.5" />
            {detecting ? "Locating..." : "Use Current Location"}
          </button>
        </div>
 
        {/* Address Search Bar / Input */}
        <div className="relative flex items-center">
          <input 
            required
            type="text" 
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            onBlur={() => geocodeAddress(formData.address)}
            className="w-full bg-background/50 border border-border rounded-xl pl-4 pr-10 py-3 focus:ring-1 focus:ring-primary outline-none text-sm" 
            placeholder="Search address or type manually..." 
          />
          <button 
            type="button"
            onClick={() => geocodeAddress(formData.address)}
            className="absolute right-3 text-muted-foreground hover:text-primary transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
 
        {/* Interactive Dynamic Map Picker Container */}
        <div className="space-y-1.5">
          <div className="w-full h-64 md:h-72 rounded-2xl overflow-hidden border border-border/50 relative shadow-inner">
            <div id="google-map-picker" className="w-full h-full z-0 animate-fadeIn" />
            
            {/* Pulsing center helper tooltip */}
            <div className="absolute bottom-4 left-4 z-10 glass border border-primary/20 px-3 py-1.5 rounded-xl text-[10px] font-medium text-foreground pointer-events-none shadow-md">
              📍 Click map or drag pin to adjust location manually
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground italic pl-1">
            We automatically capture your coordinates in the background to show customers your real location.
          </p>
        </div>
      </div>
 
      <div>
        <label className="block text-sm font-medium mb-2">Operating Hours & Availability</label>
        <input 
          required
          type="text" 
          value={formData.operatingHours}
          onChange={e => setFormData({...formData, operatingHours: e.target.value})}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary outline-none" 
          placeholder="e.g. Mon-Fri: 9AM - 6PM, Sat: 10AM - 2PM" 
        />
      </div>
 
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Travel Radius (km)</label>
          <input 
            type="number" 
            value={formData.travelRadius}
            onChange={e => setFormData({...formData, travelRadius: e.target.value})}
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Travel Fee (₹)</label>
          <input 
            type="number" 
            step="0.01"
            value={formData.travelFee}
            onChange={e => setFormData({...formData, travelFee: e.target.value})}
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary outline-none" 
            placeholder="e.g. 15.00" 
          />
        </div>
      </div>
 
      <button 
        type="submit" 
        disabled={loading}
        className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
}
