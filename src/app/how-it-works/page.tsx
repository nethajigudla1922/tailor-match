export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-8">How It Works</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-2xl border-t-4 border-primary">
          <h2 className="text-2xl font-bold mb-4">1. Create a Profile</h2>
          <p className="text-muted-foreground">Sign up and save your digital measurement profile. Never worry about giving your measurements twice.</p>
        </div>
        <div className="glass p-8 rounded-2xl border-t-4 border-primary">
          <h2 className="text-2xl font-bold mb-4">2. Find a Tailor</h2>
          <p className="text-muted-foreground">Browse our curated list of expert tailors. Filter by specialty, location, or ratings.</p>
        </div>
        <div className="glass p-8 rounded-2xl border-t-4 border-primary">
          <h2 className="text-2xl font-bold mb-4">3. Book & Relax</h2>
          <p className="text-muted-foreground">Choose a shop visit or a home visit. The tailor takes care of the rest, ensuring a perfect fit.</p>
        </div>
      </div>
    </div>
  );
}
