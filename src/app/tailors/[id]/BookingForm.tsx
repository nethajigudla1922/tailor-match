"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar as CalendarIcon, MapPin, Scissors, Upload, Edit, Check, Ruler, AlertTriangle, Navigation } from "lucide-react";
 
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
 
// HTML5 Canvas client-side high-performance image compression
function compressImage(file: File, callback: (compressedBase64: string) => void) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new window.Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 800; // Resize maximum side to 800px
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
      // Compress quality to 70% JPEG
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
      callback(compressedDataUrl);
    };
  };
}
 
export function BookingForm({ tailor, services, fabrics }: { tailor: any, services: any[], fabrics: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Restore pending booking state if requested and exists in localStorage
  useEffect(() => {
    const restore = searchParams.get("restore");
    if (restore === "true") {
      try {
        const saved = localStorage.getItem("tailor_match_pending_booking");
        if (saved) {
          const booking = JSON.parse(saved);
          
          if (booking.selectedService) setSelectedService(booking.selectedService);
          if (booking.selectedFabric) setSelectedFabric(booking.selectedFabric);
          if (booking.fabricMeters) setFabricMeters(booking.fabricMeters);
          if (booking.deliveryType) setDeliveryType(booking.deliveryType);
          if (booking.appointmentDate) setAppointmentDate(booking.appointmentDate);
          if (booking.appointmentTime) setAppointmentTime(booking.appointmentTime);
          if (booking.notes) setNotes(booking.notes);
          if (booking.referenceImage) setReferenceImage(booking.referenceImage);
          if (booking.pickupAddress) setPickupAddress(booking.pickupAddress);
          if (booking.pickupLatitude) setPickupLatitude(booking.pickupLatitude);
          if (booking.pickupLongitude) setPickupLongitude(booking.pickupLongitude);


          setIsReviewMode(true);
          
          // Clear it so it doesn't restore again on reload
          localStorage.removeItem("tailor_match_pending_booking");
          
          // Remove the restore query param from the URL cleanly
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        }
      } catch (err) {
        console.error("Error restoring pending booking:", err);
      }
    }
  }, [searchParams]);
  
  const [selectedService, setSelectedService] = useState("");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [fabricMeters, setFabricMeters] = useState(3);
  const [deliveryType, setDeliveryType] = useState("SHOP_VISIT");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:00 AM");
  const [notes, setNotes] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  // Pickup Location Details State
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupLatitude, setPickupLatitude] = useState("");
  const [pickupLongitude, setPickupLongitude] = useState("");
  const [gpsDetecting, setGpsDetecting] = useState(false);
 

 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);


 
  // Dynamic travel GPS state
  const [distance, setDistance] = useState<number | null>(null);
 
  const [customerSavedAddress, setCustomerSavedAddress] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
 
  // Fetch saved address from customer profile
  useEffect(() => {
    if (session) {
      fetch("/api/customer/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.address) {
            setCustomerSavedAddress(data.address);
          }
        })
        .catch((err) => console.error("Error fetching customer profile:", err));
    }

    const handleBookSimilar = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { title, description, image } = customEvent.detail;
        setNotes(`Ordering portfolio design similarity: "${title}"\n${description ? `Description: ${description}` : ""}`);
        if (image) {
          setReferenceImage(image);
        }
        // Smoothly scroll to the booking form top
        const formElement = document.querySelector("form");
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    window.addEventListener("book-similar", handleBookSimilar);
    return () => {
      window.removeEventListener("book-similar", handleBookSimilar);
    };
  }, [session]);



  // Reverse Geocoding: Coordinate -> Street Address
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`);
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setPickupAddress(data.display_name);
        }
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };
 
  // Forward Geocoding: Address text -> Coordinate
  const geocodeAddress = async (addressStr: string) => {
    if (!addressStr.trim() || addressStr === "My Current GPS Coordinate") return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressStr)}&format=json&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          
          setPickupLatitude(lat.toString());
          setPickupLongitude(lon.toString());
 
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lon], 14);
            markerRef.current.setLatLng([lat, lon]);
          }
        }
      }
    } catch (err) {
      console.error("Forward geocoding failed:", err);
    }
  };
 
  // Get customer location on mount to set initial pickup coordinates automatically
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setGpsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setPickupLatitude(lat.toString());
          setPickupLongitude(lon.toString());
          setGpsDetecting(false);
          await reverseGeocode(lat, lon);
        },
        (err) => {
          console.log("GPS Location permission skipped for travel calculation:", err);
          setGpsDetecting(false);
        }
      );
    }
  }, [tailor]);
 
  // Recalculate distance whenever pickup coordinates change
  useEffect(() => {
    const lat = parseFloat(pickupLatitude);
    const lon = parseFloat(pickupLongitude);
    if (!isNaN(lat) && !isNaN(lon) && tailor.latitude && tailor.longitude) {
      const dist = calculateDistance(lat, lon, tailor.latitude, tailor.longitude);
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, [pickupLatitude, pickupLongitude, tailor]);
 
  const useCurrentLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setGpsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setPickupLatitude(lat.toString());
          setPickupLongitude(lon.toString());
          setGpsDetecting(false);
 
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lon], 15);
            markerRef.current.setLatLng([lat, lon]);
          }
          await reverseGeocode(lat, lon);
        },
        (err) => {
          alert("Could not retrieve your location. Please check location permissions or search for an address.");
          setGpsDetecting(false);
        }
      );
    }
  };
 
  const useSavedAddressAction = async () => {
    if (!customerSavedAddress) return;
    setPickupAddress(customerSavedAddress);
    await geocodeAddress(customerSavedAddress);
  };
 
  // Initialize Leaflet map picker dynamically
  useEffect(() => {
    if (typeof window === "undefined" || deliveryType !== "HOME_VISIT" || isReviewMode) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }
 
    const initMap = () => {
      const L = (window as any).L;
      if (!L || mapInstanceRef.current) return;
 
      const container = document.getElementById("customer-pickup-map");
      if (!container) return;
 
      const startLat = parseFloat(pickupLatitude) || tailor.latitude || 12.9716;
      const startLon = parseFloat(pickupLongitude) || tailor.longitude || 77.5946;
 
      const map = L.map('customer-pickup-map', {
        zoomControl: false
      }).setView([startLat, startLon], 14);
 
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '© Google Maps'
      }).addTo(map);
 
      // Pulsing premium sky-blue map pointer pin matching theme
      const googlePinIcon = L.divIcon({
        className: 'custom-google-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-sky-400 opacity-40"></span>
            <div class="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
 
      const marker = L.marker([startLat, startLon], {
        draggable: true,
        icon: googlePinIcon
      }).addTo(map);
 
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        setPickupLatitude(pos.lat.toString());
        setPickupLongitude(pos.lng.toString());
        await reverseGeocode(pos.lat, pos.lng);
      });
 
      map.on('click', async (e: any) => {
        marker.setLatLng(e.latlng);
        setPickupLatitude(e.latlng.lat.toString());
        setPickupLongitude(e.latlng.lng.toString());
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
      });
 
      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapLoaded(true);
    };
 
    if ((window as any).L) {
      const timer = setTimeout(initMap, 100);
      return () => clearTimeout(timer);
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
 
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        setTimeout(initMap, 100);
      };
      document.head.appendChild(script);
    }
  }, [deliveryType, isReviewMode]);
 
 
  // Dynamic pricing calculation
  const serviceObj = services.find(s => s.id === selectedService);
  const fabricObj = fabrics.find(f => f.id === selectedFabric);
  
  const servicePrice = serviceObj ? serviceObj.price : 0;
  const fabricPrice = fabricObj ? fabricObj.pricePerMeter * fabricMeters : 0;
  
  // Dynamic Dynamic travel fee: Base tailor travel fee + ₹15 per GPS km
  const travelFee = deliveryType === "HOME_VISIT" 
    ? (tailor.travelFee || 0) + (distance ? Math.round(distance * 15) : 0) 
    : 0;
  
  const totalPrice = servicePrice + fabricPrice + travelFee;
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setReferenceImage(compressedBase64);
      });
    }
  };
 

 
  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (session && (session.user as any).role !== "CUSTOMER") {
      setError("Only customers can book appointments.");
      return;
    }
    if (!selectedService) {
      setError("Please select a service.");
      return;
    }
    if (!appointmentDate) {
      setError("Please select a date.");
      return;
    }
    if (deliveryType === "HOME_VISIT") {
      if (!pickupAddress.trim()) {
        setError("Please enter a pickup address for the Home Visit.");
        return;
      }
      const lat = parseFloat(pickupLatitude);
      const lon = parseFloat(pickupLongitude);
      if (isNaN(lat) || isNaN(lon)) {
        setError("Please provide valid latitude and longitude coordinates for your pickup location.");
        return;
      }
      if (distance !== null) {
        const maxRadius = tailor.travelRadius || 10;
        if (distance > maxRadius) {
          setError(`Pickup location is too far. Your location is ${distance.toFixed(1)} km away, but this tailor only covers a radius of ${maxRadius} km.`);
          return;
        }
      }
    }
    setError("");
    setIsReviewMode(true);
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      const pendingBooking = {
        selectedService,
        selectedFabric,
        fabricMeters,
        deliveryType,
        appointmentDate,
        appointmentTime,
        notes,
        referenceImage,
        pickupAddress,
        pickupLatitude,
        pickupLongitude,
      };
      try {
        localStorage.setItem("tailor_match_pending_booking", JSON.stringify(pendingBooking));
      } catch (err) {
        console.error("Error saving pending booking:", err);
      }
      router.push(`/login?callbackUrl=${encodeURIComponent(`/tailors/${tailor.id}?restore=true`)}`);
      return;
    }

    if ((session.user as any).role !== "CUSTOMER") {
      setError("Only customers can book appointments.");
      return;
    }

    setLoading(true);
    setError("");
 
    // Determine measurements payload
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tailorId: tailor.id,
          serviceId: selectedService,
          fabricId: selectedFabric || undefined,
          deliveryType,
          appointmentDate,
          appointmentTime,
          notes,
          referenceImage,
          totalPrice,
          pickupAddress: deliveryType === "HOME_VISIT" ? pickupAddress : null,
          pickupLatitude: deliveryType === "HOME_VISIT" ? parseFloat(pickupLatitude) : null,
          pickupLongitude: deliveryType === "HOME_VISIT" ? parseFloat(pickupLongitude) : null,
        }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }
 
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/customer`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 
  if (success) {
    return (
      <div className="glass p-8 rounded-3xl border border-primary/20 text-center">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">Booking Requested!</h3>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }
 
  return (
    <form onSubmit={isReviewMode ? handleSubmit : handleReview} className="glass p-8 rounded-3xl border border-border/50 text-left">
      <h2 className="text-2xl font-bold mb-6">
        {isReviewMode ? "Review Your Booking" : "Book an Appointment"}
      </h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}
 
      {isReviewMode ? (
        // REVIEW MODE UI
        <div className="space-y-6">
          <div className="bg-background/40 p-5 rounded-2xl border border-border/40 space-y-4">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-sm text-muted-foreground">Selected Service</span>
              <span className="font-semibold text-foreground">{serviceObj?.name}</span>
            </div>
 
            {fabricObj && (
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-sm text-muted-foreground">Fabric & Sourcing</span>
                <span className="font-semibold text-foreground">{fabricObj.name} ({fabricMeters}m)</span>
              </div>
            )}
 
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-sm text-muted-foreground">Appointment Schedule</span>
              <span className="font-semibold text-foreground">{appointmentDate} at {appointmentTime}</span>
            </div>
 
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-sm text-muted-foreground">Delivery Method</span>
              <span className="font-semibold text-foreground">
                {deliveryType === "HOME_VISIT" ? "Home Visit (At Doorstep)" : "Shop Studio Visit"}
              </span>
            </div>

            {deliveryType === "HOME_VISIT" && (
              <>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-sm text-muted-foreground">Pickup Address</span>
                  <span className="font-semibold text-foreground">{pickupAddress}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-sm text-muted-foreground">GPS Location</span>
                  <span className="font-semibold text-foreground">{parseFloat(pickupLatitude).toFixed(4)}, {parseFloat(pickupLongitude).toFixed(4)}</span>
                </div>
                {distance !== null && (
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-sm text-muted-foreground">Distance to Tailor</span>
                    <span className="font-semibold text-primary">{distance.toFixed(1)} km</span>
                  </div>
                )}
              </>
            )}
 
            {notes && (
              <div className="border-b border-border/50 pb-2 space-y-1">
                <span className="text-sm text-muted-foreground block">Customer Notes</span>
                <p className="text-sm text-foreground bg-background/20 p-2 rounded-lg border border-border/50 italic">
                  "{notes}"
                </p>
              </div>
            )}
 
            {referenceImage && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground block">Design Reference Photo</span>
                <img src={referenceImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-border" />
              </div>
            )}
          </div>
 
          <div className="p-4 bg-primary/10 rounded-xl flex justify-between items-center border border-primary/20">
            <span className="font-bold">Estimated Total Price</span>
            <span className="text-xl font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
          </div>
 
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setIsReviewMode(false)}
              className="flex-1 flex items-center justify-center gap-2 border border-border bg-background/50 hover:bg-background/80 text-foreground font-semibold rounded-xl py-4 transition-all cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Edit Details
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-xl py-4 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {loading ? "Confirming..." : "Confirm & Book"}
            </button>
          </div>
        </div>
      ) : (
        // EDIT MODE UI
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Service</label>
            <select 
              required
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="" disabled>Choose a service...</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} - ₹{svc.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
 
          {fabrics.length > 0 && (
            <div className="p-4 border border-border rounded-xl bg-background/30">
              <label className="block text-sm font-medium mb-2 text-primary">Need Fabric?</label>
              <select 
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary mb-3"
              >
                <option value="">I have my own fabric</option>
                {fabrics.map((fab) => (
                  <option key={fab.id} value={fab.id}>
                    {fab.name} ({fab.material}) - ₹{fab.pricePerMeter.toFixed(2)}/m
                  </option>
                ))}
              </select>
              {selectedFabric && (
                <div>
                  <label className="block text-xs font-medium mb-1">Estimated Meters Needed</label>
                  <input 
                    type="number" min="1" max="10" 
                    value={fabricMeters} 
                    onChange={(e) => setFabricMeters(parseInt(e.target.value))} 
                    className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 outline-none" 
                  />
                </div>
              )}
            </div>
          )}
 
          {/* Sizing & Measurement Notice */}
          <div className="p-5 border border-primary/20 rounded-2xl bg-primary/5 space-y-3 shadow-sm text-left">
            <label className="block text-sm font-extrabold text-primary flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-primary animate-pulse" />
              Professional Fitting & Sizing
            </label>
            <p className="text-xs text-foreground/80 leading-relaxed">
              No need to take measurements yourself! The tailor will professionally record all necessary sizing parameters during your **{deliveryType === "HOME_VISIT" ? "Home Visit" : "Shop Studio Visit"}**.
            </p>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 bg-background/50 p-2.5 rounded-xl border border-border/40 font-medium">
              <span>💡 Tip: Feel free to mention any specific fit requests or details in the notes section below!</span>
            </div>
          </div>
 
          <div>
            <label className="block text-sm font-medium mb-2">Delivery Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryType("SHOP_VISIT")}
                className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                  deliveryType === "SHOP_VISIT" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-border/50 bg-background/50 text-muted-foreground"
                }`}
              >
                Shop Visit
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("HOME_VISIT")}
                className={`py-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center ${
                  deliveryType === "HOME_VISIT" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-border/50 bg-background/50 text-muted-foreground"
                }`}
              >
                <span>Home Visit (+₹{travelFee.toFixed(0)})</span>
                {distance && (
                  <span className="text-[9px] opacity-75 font-normal">
                    📍 {distance.toFixed(1)} km away
                  </span>
                )}
              </button>
            </div>
          </div>

          {deliveryType === "HOME_VISIT" && (
            <div className="p-5 border border-border/80 rounded-2xl bg-background/30 space-y-4 shadow-sm">
              <label className="block text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/50 pb-2">
                <MapPin className="w-4 h-4 text-primary" />
                Select Pickup Location
              </label>

              <div className="space-y-4">
                {/* Search Address Field */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pickup Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      onBlur={() => geocodeAddress(pickupAddress)}
                      placeholder="Search landmark, street, or area"
                      className="w-full bg-background/50 border border-border rounded-xl pl-3 pr-10 py-2.5 outline-none focus:ring-1 focus:ring-primary text-sm shadow-inner"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      <MapPin className="w-4 h-4 text-muted-foreground/60" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions for Swiggy/Zepto Feel */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {customerSavedAddress && (
                    <button
                      type="button"
                      onClick={useSavedAddressAction}
                      className="py-2.5 px-3 border border-border/60 bg-background/50 hover:bg-background/80 hover:border-primary/30 text-foreground font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                      Saved Home Address
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={gpsDetecting}
                    className={`py-2.5 px-3 border border-border/60 bg-background/50 hover:bg-background/80 hover:border-primary/30 text-foreground font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${gpsDetecting ? 'opacity-70' : ''}`}
                  >
                    <Navigation className={`w-3.5 h-3.5 text-primary ${gpsDetecting ? 'animate-spin' : ''}`} />
                    {gpsDetecting ? "GPS Locating..." : "Use Current GPS"}
                  </button>
                </div>

                {/* Visual Map Picker */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Choose on Map</label>
                  <p className="text-[11px] text-muted-foreground/80 italic">Drag the sky-blue pulsing marker to pinpoint your doorstep</p>
                  <div className="relative w-full rounded-2xl overflow-hidden border border-border/60 bg-background/20 shadow-md">
                    <div 
                      id="customer-pickup-map" 
                      className="w-full h-56 z-0" 
                      style={{ minHeight: "224px" }}
                    />
                  </div>
                </div>

                {/* Distance Badge & Out of Service Area Alert */}
                {distance !== null && (
                  <div className="space-y-2 pt-1">
                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-inner ${
                      distance > (tailor.travelRadius || 10) 
                        ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Distance to Tailor: {distance.toFixed(1)} km</span>
                      </div>
                      <span>Max covered: {tailor.travelRadius || 10} km</span>
                    </div>

                    {distance > (tailor.travelRadius || 10) && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl p-3.5 text-xs space-y-1 animate-pulse">
                        <p className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          Out of Service Area
                        </p>
                        <p>This tailor only covers a radius of {tailor.travelRadius || 10} km. Please select a closer pickup point.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
 
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input 
                type="date" 
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <select 
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-sm"
              >
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>
 
          <div>
            <label className="block text-sm font-medium mb-2">Reference Photo (Optional)</label>
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 bg-background/20 transition-colors">
              <div className="flex flex-col items-center">
                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">
                  {referenceImage ? "Image Compressed & Ready!" : "Click to upload design idea"}
                </span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
 
          <div>
            <label className="block text-sm font-medium mb-2">Notes for Tailor (Optional)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 min-h-[80px] outline-none focus:ring-1 focus:ring-primary text-sm"
              placeholder="Any specific requests or details?"
            />
          </div>
 
          <button 
            type="submit" 
            disabled={loading || services.length === 0}
            className="w-full bg-primary text-primary-foreground font-bold rounded-xl px-4 py-4 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            Review Booking Details
          </button>
        </div>
      )}
    </form>
  );
}
