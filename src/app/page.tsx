"use client";
 
import { motion } from "framer-motion";
import { Scissors, Ruler, Clock, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
 
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
} as const;
 
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};
 
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-300/10 rounded-full blur-[128px]" />
        </div>
 
        <div className="container px-4 mx-auto relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-primary/5 border border-primary/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
              <Star className="text-primary w-4 h-4 fill-primary" />
              <span className="text-sm font-bold tracking-wide">Premium Custom Tailoring</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-foreground">
              Your Perfect Fit, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">
                Crafted to Perfection.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Connect with top-tier tailors for bespoke clothing, precise alterations, and premium fabric sourcing. Book a home visit or visit their studio.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tailors" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/25 flex items-center justify-center space-x-2">
                <Scissors size={20} />
                <span>Find a Tailor</span>
              </Link>
              <Link href="/how-it-works" className="w-full sm:w-auto px-8 py-4 glass text-foreground font-semibold rounded-full hover:bg-primary/5 transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2">
                <Ruler size={20} />
                <span>How it Works</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
 
      {/* Services Section */}
      <section className="py-24 bg-primary/5 border-y border-border/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Tailored for Every Occasion</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">From sharp office wear to dazzling party outfits, our specialized tailors cover all your clothing needs for men, women, and children.</p>
          </div>
 
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { title: "Office Wear", desc: "Crisp shirts, perfectly fitted suits, and professional attire.", icon: Clock },
              { title: "Party & Bridal", desc: "Exquisite designs and intricate detailing for your special day.", icon: Star },
              { title: "Everyday & Alterations", desc: "Comfortable daily wear and precise alterations for a perfect fit.", icon: Scissors },
            ].map((service, index) => (
              <motion.div key={index} variants={fadeUp} className="glass p-8 rounded-3xl hover:border-primary/50 transition-colors group text-left">
                <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <service.icon className="text-primary" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm font-medium">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
 
      {/* Features Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden glass border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10" />
                <Image src="/premium_tailoring.png" alt="Premium Tailoring" fill className="object-cover" />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-8 text-left"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-foreground">Your Digital <br/><span className="text-primary">Measurement Profile</span></h2>
              <p className="text-base text-muted-foreground font-medium">Save your exact body measurements once and share them with any tailor on our platform. Perfect fit guaranteed, every single time.</p>
              
              <ul className="space-y-4">
                {[
                  "Home visit or studio appointments",
                  "Provide your own fabric or buy from tailors",
                  "Transparent pricing and reviews",
                  "Real-time order tracking"
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-1.5 rounded-full">
                      <Star className="text-primary w-4 h-4 fill-primary" />
                    </div>
                    <span className="font-bold text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/signup" className="inline-block px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/95 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                Create Free Profile
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
