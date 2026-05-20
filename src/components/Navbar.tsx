"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <div className="bg-primary p-1.5 rounded-md text-primary-foreground">
            <Scissors size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">TailorConnect</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/tailors" className="transition-colors hover:text-primary">
            Find Tailors
          </Link>
          <Link href="/services" className="transition-colors hover:text-primary">
            Services
          </Link>
          <Link href="/how-it-works" className="transition-colors hover:text-primary">
            How it Works
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
            Sign up
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
