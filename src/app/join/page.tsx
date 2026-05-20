import Link from "next/link";

export default function JoinPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-8">Join as a Tailor</h1>
      <div className="glass p-12 rounded-2xl text-center">
        <p className="text-muted-foreground mb-6">Expand your reach and manage your tailoring business efficiently.</p>
        <Link href="/signup" className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xl">
          Register Your Shop Now
        </Link>
      </div>
    </div>
  );
}
