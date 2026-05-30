"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Scissors, Calendar, MapPin, Search, CheckCircle, 
  XCircle, Clock, DollarSign, ShieldCheck, Mail, ShieldAlert,
  Edit2, Trash2, Eye, X, Sparkles, Check
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  category: string;
  occasion: string | null;
  price: number;
  description: string | null;
  estimatedDays: number | null;
}

interface Payment {
  id: string;
  totalAmount: number;
  platformFee: number;
  status: string;
}

interface Booking {
  id: string;
  status: string;
  serviceId: string | null;
  payment: Payment | null;
}

interface TailorProfile {
  id: string;
  shopName: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  operatingHours: string | null;
  travelRadius: number | null;
  travelFee: number | null;
  isVerified: boolean;
  services: Service[];
  bookings: Booking[];
}

interface TailorUser {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  tailorProfile: TailorProfile | null;
}

interface CustomerBooking {
  id: string;
  status: string;
  payment: {
    id: string;
    totalAmount: number;
    platformFee: number;
    status: string;
  } | null;
}

interface CustomerProfile {
  id: string;
  address: string | null;
  city: string | null;
  measurementsCount: number;
  bookings: CustomerBooking[];
}

interface CustomerUser {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  customerProfile: CustomerProfile | null;
}


interface AdminDashboardClientProps {
  tailors: TailorUser[];
  customers: CustomerUser[];
  stats: {
    totalCustomers: number;
    totalBookings: number;
    totalVolume: number;
    totalRevenue: number;
  };
}

export function AdminDashboardClient({ tailors, customers, stats }: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"tailors" | "customers">("tailors");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tailor Selection & deletion state
  const [selectedTailorId, setSelectedTailorId] = useState<string | null>(
    tailors.length > 0 ? tailors[0].id : null
  );
  const [togglingVerify, setTogglingVerify] = useState<string | null>(null);
  const [deleteTailorModalOpen, setDeleteTailorModalOpen] = useState(false);
  const [deletingTailor, setDeletingTailor] = useState(false);

  // Customer Selection & deletion state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    customers.length > 0 ? customers[0].id : null
  );
  const [deleteCustomerModalOpen, setDeleteCustomerModalOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(false);

  // Modals state for managing services
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

  // Filter tailors based on search
  const filteredTailors = tailors.filter(t => {
    const name = t.name?.toLowerCase() || "";
    const email = t.email?.toLowerCase() || "";
    const shopName = t.tailorProfile?.shopName?.toLowerCase() || "";
    const city = t.tailorProfile?.city?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || shopName.includes(query) || city.includes(query);
  });

  // Filter customers based on search
  const filteredCustomers = customers.filter(c => {
    const name = c.name?.toLowerCase() || "";
    const email = c.email?.toLowerCase() || "";
    const city = c.customerProfile?.city?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || city.includes(query);
  });


  const selectedTailor = tailors.find(t => t.id === selectedTailorId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Calculate tailor specific metrics
  const getTailorMetrics = (tailor: TailorUser) => {
    const profile = tailor.tailorProfile;
    if (!profile) return { totalServices: 0, totalBookingsCount: 0, earnings: 0 };
    
    const servicesCount = profile.services.length;
    const bookingsCount = profile.bookings.length;
    const earnings = profile.bookings.reduce((sum, b) => {
      if (b.payment && (b.payment.status === "RELEASED" || b.payment.status === "ESCROW")) {
        return sum + b.payment.totalAmount;
      }
      return sum;
    }, 0);

    return {
      totalServices: servicesCount,
      totalBookingsCount: bookingsCount,
      earnings
    };
  };

  // Calculate customer specific metrics
  const getCustomerMetrics = (customer: CustomerUser) => {
    const profile = customer.customerProfile;
    if (!profile) return { totalBookingsCount: 0, measurementsCount: 0, volume: 0 };
    
    const bookingsCount = profile.bookings.length;
    const volume = profile.bookings.reduce((sum, b) => {
      if (b.payment && (b.payment.status === "RELEASED" || b.payment.status === "ESCROW")) {
        return sum + b.payment.totalAmount;
      }
      return sum;
    }, 0);

    return {
      totalBookingsCount: bookingsCount,
      measurementsCount: profile.measurementsCount,
      volume
    };
  };

  // Toggle tailor verification status
  const handleToggleVerification = async (tailorId: string, profileId: string) => {
    setTogglingVerify(profileId);
    try {
      const res = await fetch(`/api/admin/verify/${profileId}`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Failed to verify tailor");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error updating tailor verification status.");
    } finally {
      setTogglingVerify(null);
    }
  };

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

  // Execute Tailor Deletion
  const handleDeleteTailorConfirm = async () => {
    if (!selectedTailorId) return;
    setDeletingTailor(true);
    try {
      const res = await fetch(`/api/admin/tailors/${selectedTailorId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete tailor account");
      }

      setDeleteTailorModalOpen(false);
      const remainingTailors = tailors.filter(t => t.id !== selectedTailorId);
      setSelectedTailorId(remainingTailors.length > 0 ? remainingTailors[0].id : null);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error deleting tailor account.");
    } finally {
      setDeletingTailor(false);
    }
  };

  // Execute Customer Deletion
  const handleDeleteCustomerConfirm = async () => {
    if (!selectedCustomerId) return;
    setDeletingCustomer(true);
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomerId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete customer account");
      }

      setDeleteCustomerModalOpen(false);
      const remainingCustomers = customers.filter(c => c.id !== selectedCustomerId);
      setSelectedCustomerId(remainingCustomers.length > 0 ? remainingCustomers[0].id : null);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error deleting customer account.");
    } finally {
      setDeletingCustomer(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Visual Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Customers</span>
            <span className="text-2xl font-black text-foreground">{stats.totalCustomers}</span>
          </div>
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Tailor Accounts</span>
            <span className="text-2xl font-black text-foreground">{tailors.length}</span>
          </div>
          <div className="bg-sky-500/10 p-3 rounded-xl text-sky-500">
            <Scissors className="w-5 h-5" />
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Bookings</span>
            <span className="text-2xl font-black text-foreground">{stats.totalBookings}</span>
          </div>
          <div className="bg-yellow-500/10 p-3 rounded-xl text-yellow-500">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Platform Volume</span>
            <span className="text-2xl font-black text-emerald-500">₹{stats.totalVolume.toFixed(0)}</span>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Directory Tab Switcher */}
      <div className="flex gap-2 bg-background/50 p-1.5 rounded-2xl border border-border/80 max-w-sm">
        <button
          onClick={() => { setActiveTab("tailors"); setSearchQuery(""); }}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "tailors"
              ? "bg-primary text-primary-foreground shadow-md"
              : "hover:bg-background/80 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scissors className="w-4 h-4" />
          Tailor Profiles
        </button>
        <button
          onClick={() => { setActiveTab("customers"); setSearchQuery(""); }}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "customers"
              ? "bg-primary text-primary-foreground shadow-md"
              : "hover:bg-background/80 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Customer Accounts
        </button>
      </div>

      {/* Two-Column Monitor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Registered Accounts Directory */}
        <div className="lg:col-span-1 glass p-6 rounded-3xl border border-border/60 flex flex-col h-[650px] overflow-hidden">
          {activeTab === "tailors" ? (
            <>
              <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
                <h2 className="font-extrabold text-lg text-foreground flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-primary" />
                  Tailor Directory
                </h2>
                <span className="text-[10px] font-black tracking-widest uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                  {filteredTailors.length} Listed
                </span>
              </div>

              {/* Search Box */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, shop, or city..."
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-primary shadow-inner"
                />
              </div>

              {/* List Wrapper */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
                {filteredTailors.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-xs space-y-1">
                    <p className="font-bold">No tailors found</p>
                    <p>Try refining your search filters.</p>
                  </div>
                ) : (
                  filteredTailors.map((tailor) => {
                    const profile = tailor.tailorProfile;
                    const metrics = getTailorMetrics(tailor);
                    const isSelected = selectedTailorId === tailor.id;
                    
                    return (
                      <div
                        key={tailor.id}
                        onClick={() => setSelectedTailorId(tailor.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30 bg-background/50 hover:bg-background"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-black text-sm text-foreground truncate max-w-[140px]">
                              {tailor.name || "Unnamed Tailor"}
                            </h3>
                            {profile?.isVerified ? (
                              <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded-full uppercase">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-[9px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.2 rounded-full uppercase">
                                <ShieldAlert className="w-2.5 h-2.5" />
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mb-2">
                            <Mail className="w-3 h-3 text-muted-foreground/60" />
                            {tailor.email}
                          </p>
                          {profile?.shopName && (
                            <p className="text-xs font-bold text-primary truncate mb-1">
                              🏪 {profile.shopName}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-2.5 text-[10px] text-muted-foreground font-semibold">
                          <span>{metrics.totalServices} Services</span>
                          <span className="text-foreground">📍 {profile?.city || "Not set"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
                <h2 className="font-extrabold text-lg text-foreground flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  Customer Directory
                </h2>
                <span className="text-[10px] font-black tracking-widest uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                  {filteredCustomers.length} Listed
                </span>
              </div>

              {/* Search Box */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or city..."
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-primary shadow-inner"
                />
              </div>

              {/* List Wrapper */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-xs space-y-1">
                    <p className="font-bold">No customers found</p>
                    <p>Try refining your search filters.</p>
                  </div>
                ) : (
                  filteredCustomers.map((cust) => {
                    const profile = cust.customerProfile;
                    const metrics = getCustomerMetrics(cust);
                    const isSelected = selectedCustomerId === cust.id;
                    
                    return (
                      <div
                        key={cust.id}
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30 bg-background/50 hover:bg-background"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-black text-sm text-foreground truncate max-w-[140px]">
                              {cust.name || "Unnamed Customer"}
                            </h3>
                            <span className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.2 rounded-full uppercase">
                              Buyer
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mb-2">
                            <Mail className="w-3 h-3 text-muted-foreground/60" />
                            {cust.email}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-2.5 text-[10px] text-muted-foreground font-semibold">
                          <span>{metrics.totalBookingsCount} Bookings</span>
                          <span className="text-foreground">📍 {profile?.city || "Not set"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: Comprehensive Monitoring Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "tailors" ? (
            selectedTailor ? (
              <div className="glass p-6 rounded-3xl border border-border/60 min-h-[650px] flex flex-col">
                
                {/* Header Profile Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-foreground">
                        {selectedTailor.name || "Unnamed Tailor"}
                      </h2>
                      {selectedTailor.tailorProfile?.isVerified && (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedTailor.email}
                    </p>
                  </div>

                  {/* Secure Administrative Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {selectedTailor.tailorProfile && (
                      <button
                        type="button"
                        disabled={togglingVerify === selectedTailor.tailorProfile.id}
                        onClick={() => handleToggleVerification(selectedTailor.id, selectedTailor.tailorProfile!.id)}
                        className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                          selectedTailor.tailorProfile.isVerified
                            ? "border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500"
                            : "border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 hover:scale-[1.02]"
                        }`}
                      >
                        {selectedTailor.tailorProfile.isVerified ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>Revoke Verification</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Verify Tailor Account</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteTailorModalOpen(true)}
                      className="py-2 px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>

                {/* Grid Statistics widgets specific to selected tailor */}
                {(() => {
                  const metrics = getTailorMetrics(selectedTailor);
                  const profile = selectedTailor.tailorProfile;
                  return (
                    <div className="space-y-6 flex-1">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-background border border-border/80 rounded-2xl shadow-inner space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase block">Tailor Services</span>
                          <span className="text-lg font-black text-primary block">{metrics.totalServices} Listed</span>
                        </div>
                        <div className="p-4 bg-background border border-border/80 rounded-2xl shadow-inner space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase block">Active Appointments</span>
                          <span className="text-lg font-black text-foreground block">{metrics.totalBookingsCount} Booked</span>
                        </div>
                        <div className="p-4 bg-background border border-border/80 rounded-2xl shadow-inner space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase block">Volume Secured</span>
                          <span className="text-lg font-black text-emerald-500 block">₹{metrics.earnings.toFixed(0)}</span>
                        </div>
                      </div>

                      {/* Shop Business Specs */}
                      <div className="p-5 border border-border/80 rounded-2xl bg-background/30 space-y-4 shadow-sm">
                        <h4 className="font-extrabold text-sm border-b border-border/40 pb-2 flex items-center gap-1.5">
                          🏪 Business Profile Details
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                          <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wide block">Shop Name</span>
                            <span className="text-foreground font-black text-sm">{profile?.shopName || "Not listed"}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wide block">Operating Hours</span>
                            <span className="text-foreground">{profile?.operatingHours || "Not specified"}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wide block">Address & Location</span>
                            <span className="text-foreground flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {profile?.address ? `${profile.address}, ${profile.city}` : "Not listed"}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wide block">Service Bounds</span>
                            <span className="text-foreground">
                              Covers {profile?.travelRadius || 10} km (Fee: ₹{profile?.travelFee?.toFixed(0) || 0})
                            </span>
                          </div>
                        </div>

                        {profile?.bio && (
                          <div className="pt-2 border-t border-border/30">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wide block mb-1">Tailor Biography</span>
                            <p className="p-3 bg-background border border-border/50 rounded-xl italic text-xs leading-relaxed text-muted-foreground">
                              "{profile.bio}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Services Cards Directory specifically for the admin monitor */}
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-sm border-b border-border/40 pb-2 flex items-center gap-1.5">
                          <Scissors className="w-4 h-4 text-primary animate-pulse" />
                          Offered Tailoring Services ({profile?.services.length || 0})
                        </h4>

                        {profile?.services.length === 0 ? (
                          <div className="p-8 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground italic">
                            This tailor has not registered any services yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                            {profile?.services.map((svc) => (
                              <div key={svc.id} className="p-3.5 bg-background border border-border rounded-xl space-y-1.5 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start gap-1">
                                    <h5 className="font-extrabold text-xs text-foreground truncate max-w-[140px]">{svc.name}</h5>
                                    <span className="font-black text-xs text-primary">₹{svc.price.toFixed(0)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                                    <span>{svc.category} • {svc.occasion || "Casual"}</span>
                                    {svc.estimatedDays && (
                                      <span className="flex items-center gap-0.5 text-primary">
                                        <Clock className="w-3 h-3" />
                                        {svc.estimatedDays} days
                                      </span>
                                    )}
                                  </div>
                                  {svc.description && (
                                    <p className="text-[10px] text-muted-foreground/80 line-clamp-1 italic pt-1 border-t border-border/30 mt-1.5">
                                      "{svc.description}"
                                    </p>
                                  )}
                                </div>

                                {/* Premium Administrative Action Buttons */}
                                <div className="flex items-center gap-2 pt-2 border-t border-border/30 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => handleView(svc)}
                                    className="flex-1 flex items-center justify-center gap-1 py-1 px-2 border border-border bg-background hover:bg-background/80 text-foreground font-semibold rounded-lg text-[9px] transition-all shadow-sm cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye className="w-3 h-3 text-muted-foreground" />
                                    <span>View</span>
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => handleEditInit(svc)}
                                    className="flex-1 flex items-center justify-center gap-1 py-1 px-2 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold rounded-lg text-[9px] transition-all shadow-sm cursor-pointer"
                                    title="Edit Service"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteInit(svc)}
                                    className="flex-none p-1 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-500 rounded-lg transition-all shadow-sm cursor-pointer"
                                    title="Delete Service"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="glass p-6 rounded-3xl border border-border/60 min-h-[650px] flex flex-col items-center justify-center text-center">
                <Scissors className="w-16 h-16 text-muted/30 mb-4 animate-bounce" />
                <h3 className="font-bold text-foreground">Select a tailor profile</h3>
                <p className="text-xs text-muted-foreground">Select any tailor from the directory to review their comprehensive metrics and service list.</p>
              </div>
            )
          ) : (
            selectedCustomer ? (
              <div className="glass p-6 rounded-3xl border border-border/60 min-h-[650px] flex flex-col">
                
                {/* Header Profile Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-foreground">
                        {selectedCustomer.name || "Unnamed Customer"}
                      </h2>
                      <span className="flex items-center gap-0.5 text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Customer Profile
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedCustomer.email}
                    </p>
                  </div>

                  {/* Secure Administrative Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeleteCustomerModalOpen(true)}
                      className="py-2 px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Customer Account</span>
                    </button>
                  </div>
                </div>

                {/* Grid Statistics widgets specific to selected customer */}
                {(() => {
                  const metrics = getCustomerMetrics(selectedCustomer);
                  const profile = selectedCustomer.customerProfile;
                  return (
                    <div className="space-y-6 flex-1">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-background border border-border/80 rounded-2xl shadow-inner space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase block">Measurements Saved</span>
                          <span className="text-lg font-black text-primary block">{metrics.measurementsCount} Profiles</span>
                        </div>
                        <div className="p-4 bg-background border border-border/80 rounded-2xl shadow-inner space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase block">Total Bookings</span>
                          <span className="text-lg font-black text-foreground block">{metrics.totalBookingsCount} placed</span>
                        </div>
                        <div className="p-4 bg-background border border-border/80 rounded-2xl shadow-inner space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase block">Total Value Paid</span>
                          <span className="text-lg font-black text-emerald-500 block">₹{metrics.volume.toFixed(0)}</span>
                        </div>
                      </div>

                      {/* Customer Details Specs */}
                      <div className="p-5 border border-border/80 rounded-2xl bg-background/30 space-y-4 shadow-sm">
                        <h4 className="font-extrabold text-sm border-b border-border/40 pb-2 flex items-center gap-1.5">
                          👤 Customer Details
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                          <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wide block">Address</span>
                            <span className="text-foreground">{profile?.address || "Not set"}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wide block">City</span>
                            <span className="text-foreground flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {profile?.city || "Not set"}
                            </span>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wide block">Account Created</span>
                            <span className="text-foreground">
                              {new Date(selectedCustomer.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Booking List specifically for the admin monitor */}
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-sm border-b border-border/40 pb-2 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary" />
                          Booking History ({profile?.bookings.length || 0})
                        </h4>

                        {profile?.bookings.length === 0 ? (
                          <div className="p-8 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground italic">
                            This customer has not placed any bookings yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                            {profile?.bookings.map((booking) => (
                              <div key={booking.id} className="p-3.5 bg-background border border-border rounded-xl space-y-1.5 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between text-xs">
                                <div>
                                  <div className="flex justify-between items-start gap-1">
                                    <span className="font-extrabold text-muted-foreground truncate block">ID: {booking.id.substring(0, 8)}...</span>
                                    {booking.payment && (
                                      <span className="font-black text-emerald-500">₹{booking.payment.totalAmount.toFixed(0)}</span>
                                    )}
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] font-semibold mt-1">
                                    <span className={`px-2 py-0.5 rounded-full uppercase ${
                                      booking.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                                      booking.status === "COMPLETED" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                      "bg-primary/10 text-primary border border-primary/20"
                                    }`}>
                                      {booking.status}
                                    </span>
                                    {booking.payment && (
                                      <span className="text-muted-foreground text-[9px]">
                                        Pay: {booking.payment.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="glass p-6 rounded-3xl border border-border/60 min-h-[650px] flex flex-col items-center justify-center text-center">
                <Users className="w-16 h-16 text-muted/30 mb-4 animate-bounce" />
                <h3 className="font-bold text-foreground">Select a customer profile</h3>
                <p className="text-xs text-muted-foreground">Select any customer from the directory to review their account details and booking list.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* VIEW MODAL (Glassmorphic) */}
      {viewModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-md" onClick={() => setViewModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-border/80 rounded-3xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setViewModalOpen(false)} 
              className="absolute right-4 top-4 p-1.5 rounded-full border border-border hover:bg-background/80 transition-colors cursor-pointer text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-5 text-left">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Service Details</h3>
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
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT FORM MODAL */}
      {editModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-md" onClick={() => setEditModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-border/80 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setEditModalOpen(false)} 
              className="absolute right-4 top-4 p-1.5 rounded-full border border-border hover:bg-background/80 transition-colors cursor-pointer text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground text-left">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Service
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Service Name</label>
                <input 
                  required 
                  type="text" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary outline-none text-sm text-foreground" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Category</label>
                  <select 
                    value={editForm.category} 
                    onChange={e => setEditForm({...editForm, category: e.target.value})} 
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
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
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
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
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Est. Days</label>
                  <input 
                    type="number" 
                    value={editForm.estimatedDays} 
                    onChange={e => setEditForm({...editForm, estimatedDays: e.target.value})} 
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Description (Optional)</label>
                <textarea 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 min-h-[80px] text-sm text-foreground" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all mt-2 cursor-pointer"
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
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

      {/* DELETE TAILOR ACCOUNT CONFIRMATION MODAL */}
      {deleteTailorModalOpen && selectedTailor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-md" onClick={() => setDeleteTailorModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-border/80 rounded-3xl p-6 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-black text-rose-500 mb-1">Delete Tailor Account?</h3>
            <p className="text-xs text-muted-foreground/80 mb-4">
              Are you sure you want to permanently delete the tailor account for <strong className="text-foreground">"{selectedTailor.name || "Unnamed Tailor"}"</strong>?
            </p>

            <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-left text-xs font-medium space-y-2 mb-6 text-rose-600/90 leading-relaxed">
              <p className="font-bold flex items-center gap-1">
                ⚠️ WARNING: This is a highly destructive admin action!
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Permanently deletes the tailor's profile, bio, and business address.</li>
                <li>Deletes all {selectedTailor.tailorProfile?.services.length || 0} registered tailoring services and portfolio items.</li>
                <li>Cleans up and cascades all active/completed bookings and payments.</li>
                <li>Cannot be undone or recovered under any circumstances.</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTailorModalOpen(false)}
                className="flex-1 py-3 border border-border hover:bg-background/80 text-foreground font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingTailor}
                onClick={handleDeleteTailorConfirm}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deletingTailor ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CUSTOMER ACCOUNT CONFIRMATION MODAL */}
      {deleteCustomerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-md" onClick={() => setDeleteCustomerModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-border/80 rounded-3xl p-6 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-black text-rose-500 mb-1">Delete Customer Account?</h3>
            <p className="text-xs text-muted-foreground/80 mb-4">
              Are you sure you want to permanently delete the customer account for <strong className="text-foreground">"{selectedCustomer.name || "Unnamed Customer"}"</strong>?
            </p>

            <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-left text-xs font-medium space-y-2 mb-6 text-rose-600/90 leading-relaxed">
              <p className="font-bold flex items-center gap-1">
                ⚠️ WARNING: This is a highly destructive admin action!
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Permanently deletes the customer's profile, saved dimensions, and address.</li>
                <li>Deletes all {selectedCustomer.customerProfile?.bookings.length || 0} registered booking orders and history.</li>
                <li>Deletes all reviews and fitting feedback authored by this customer.</li>
                <li>Cannot be undone or recovered under any circumstances.</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteCustomerModalOpen(false)}
                className="flex-1 py-3 border border-border hover:bg-background/80 text-foreground font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingCustomer}
                onClick={handleDeleteCustomerConfirm}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deletingCustomer ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
