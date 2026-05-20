import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Star, Scissors, Clock, Navigation } from "lucide-react";
import { BookingForm } from "./BookingForm";
import { PortfolioGrid } from "./PortfolioGrid";
 
export default async function TailorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const tailor = await prisma.tailorProfile.findUnique({
    where: { id: id },
    include: {
      user: true,
      services: true,
      fabrics: true,
      reviews: {
        include: { author: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });
 
  if (!tailor) {
    notFound();
  }
 
  // Fallback services if the tailor hasn't added any yet (for MVP demonstration)
  const displayServices = tailor.services.length > 0 ? tailor.services : [
    { id: "mock-1", name: "Custom Men's Suit", price: 150.00 },
    { id: "mock-2", name: "Dress Alteration", price: 35.00 },
    { id: "mock-3", name: "Bridal Fitting", price: 200.00 }
  ];
 
  // Calculate average rating
  const avgRating = tailor.reviews.length > 0 
    ? (tailor.reviews.reduce((acc, r) => acc + r.rating, 0) / tailor.reviews.length).toFixed(1)
    : "New";
 
  return (
    <div className="container mx-auto px-4 py-24">
      {/* Header Profile */}
      <div className="glass p-8 md:p-12 rounded-3xl border border-primary/20 mb-12 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-background shrink-0 shadow-xl overflow-hidden relative">
            {tailor.profilePicture ? (
              <img 
                src={tailor.profilePicture} 
                alt={tailor.shopName || tailor.user.name || "Tailor"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Scissors className="w-12 h-12 text-primary opacity-80" />
            )}
          </div>
          
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{tailor.shopName || tailor.user.name}</h1>
              {tailor.isVerified && (
                <div className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                  Verified
                </div>
              )}
              <div className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-md font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-primary" />
                {avgRating} {tailor.reviews.length > 0 && `(${tailor.reviews.length} reviews)`}
              </div>
            </div>
            
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              {tailor.address || "Location not provided"}
            </div>
            
            <p className="text-lg text-foreground/80 max-w-2xl">
              {tailor.bio || "An expert tailor dedicated to providing the perfect fit. Specializes in custom clothing and precise alterations for all occasions."}
            </p>
          </div>
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
        {/* Left Column: Services, Availability & Reviews */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Star className="w-6 h-6 text-primary mr-2" />
              Specialized Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayServices.map((svc: any) => (
                <div key={svc.id} className="p-6 rounded-2xl bg-background/50 border border-border hover:border-primary/50 transition-colors">
                  <h3 className="font-bold text-lg">{svc.name}</h3>
                  <p className="text-primary font-medium mt-2">From ₹{svc.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>
 
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Clock className="w-6 h-6 text-primary mr-2" />
              Availability
            </h2>
            <div className="glass p-6 rounded-2xl bg-background/30">
              <p className="text-foreground/80 text-lg">
                {tailor.operatingHours || "Please contact the tailor for their available timings and open days."}
              </p>
            </div>
          </section>
 
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <MapPin className="w-6 h-6 text-primary mr-2" />
              Workshop Location
            </h2>
            <div className="glass p-6 rounded-2xl bg-background/30 space-y-4">
              <div className="w-full h-64 rounded-xl overflow-hidden border border-border/50 relative shadow-inner">
                <iframe 
                  title="Google Map" 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(tailor.address || tailor.shopName || "India")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-none"
                  loading="lazy"
                />
              </div>
              {tailor.latitude && tailor.longitude && (
                <div className="flex justify-end items-center text-xs text-muted-foreground bg-background/25 px-4 py-2.5 rounded-xl">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${tailor.latitude},${tailor.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5 text-primary" />
                    Get Directions ➔
                  </a>
                </div>
              )}
            </div>
          </section>
 
          {/* Design Collection Portfolio Grid */}
          <section className="border-t border-border/40 pt-8">
            <PortfolioGrid tailorProfileId={tailor.id} />
          </section>

          {/* Authentic Customer Reviews Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Star className="w-6 h-6 text-primary mr-2 fill-primary" />
              Customer Reviews ({tailor.reviews.length})
            </h2>
            
            {tailor.reviews.length === 0 ? (
              <div className="glass p-8 rounded-2xl bg-background/20 text-center">
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first to order and leave feedback!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tailor.reviews.map((rev) => (
                  <div key={rev.id} className="glass p-5 rounded-2xl border border-border/50 bg-background/30 relative">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{rev.author.name}</h4>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex gap-0.5 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-yellow-400" : "text-muted-foreground/30"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-foreground/80 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    )}
                    {(rev as any).image && (
                      <div className="mt-3 relative w-32 h-32 md:w-36 md:h-36 rounded-xl overflow-hidden border border-border shadow-md bg-zinc-800 hover:scale-105 transition-transform duration-300">
                        <img 
                          src={(rev as any).image} 
                          alt="Review Fitting Photo" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
 
        {/* Right Column: Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingForm tailor={tailor} services={displayServices} fabrics={tailor.fabrics || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
