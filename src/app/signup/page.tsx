"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Scissors } from "lucide-react";
import { motion } from "framer-motion";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER", // default
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email && !formData.phone) {
      setError("Please fill in either your Email Address or Phone Number.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Success, redirect to login with callbackUrl preserved
      router.push(callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 md:p-14 rounded-3xl w-full max-w-xl border border-primary/20 shadow-2xl shadow-primary/10"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Scissors className="text-primary w-8 h-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center">Create an Account</h1>
        <p className="text-muted-foreground text-center mb-8">Join the premium tailoring platform</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "CUSTOMER" })}
              className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                formData.role === "CUSTOMER" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border/50 bg-background/50 hover:border-primary/50 text-muted-foreground"
              }`}
            >
              I am a Customer
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "TAILOR" })}
              className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                formData.role === "TAILOR" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border/50 bg-background/50 hover:border-primary/50 text-muted-foreground"
              }`}
            >
              I am a Tailor
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address (Optional if Phone filled)</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number (Optional if Email filled)</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                placeholder="9876543210"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold rounded-xl px-4 py-4 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-4 cursor-pointer"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-xs font-semibold">or</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: callbackUrl || "/dashboard" })}
          className="w-full border border-border bg-background/50 hover:bg-background/80 text-foreground font-bold rounded-xl px-4 py-3.5 transition-all flex items-center justify-center space-x-2 text-sm shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.927h6.6c-.29 1.5-1.14 2.77-2.4 3.61v3.01h3.86c2.26-2.09 3.685-5.17 3.685-8.827z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3.01c-1.08.72-2.45 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5.01H1.26v3.12C3.24 21.28 7.37 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.24 14.25A7.12 7.12 0 014.82 12c0-.79.13-1.57.38-2.31V6.57H1.26A11.96 11.96 0 000 12c0 1.92.45 3.74 1.26 5.37l3.98-3.12z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.37 0 3.24 2.72 1.26 6.57l3.98 3.12c.95-2.88 3.61-5.01 6.76-5.01z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link 
            href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"} 
            className="text-primary hover:underline font-medium"
          >
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[80vh]">
        <div className="glass p-10 md:p-14 rounded-3xl w-full max-w-xl border border-primary/20 shadow-2xl text-center">
          <Scissors className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground text-sm font-semibold">Loading Secure Signup...</p>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
