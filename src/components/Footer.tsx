import Link from "next/link";
import { Scissors } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-12 mt-24">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-md text-primary-foreground">
              <Scissors size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">TailorConnect</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            The premium platform for specialized tailoring services. Perfect fit, every time.
          </p>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">Platform</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/tailors" className="hover:text-primary transition-colors">Find a Tailor</Link></li>
            <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Tailors</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/join" className="hover:text-primary transition-colors">Join as a Tailor</Link></li>
            <li><Link href="/guidelines" className="hover:text-primary transition-colors">Tailor Guidelines</Link></li>
            <li><Link href="/dashboard" className="hover:text-primary transition-colors">Tailor Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TailorConnect. All rights reserved.</p>
      </div>
    </footer>
  );
}
