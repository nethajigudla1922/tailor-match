export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-8">Our Services</h1>
      <div className="glass p-12 rounded-2xl">
        <p className="text-muted-foreground mb-6">We offer a wide variety of specialized tailoring services, including:</p>
        <ul className="list-disc pl-6 space-y-4 text-foreground/80">
          <li><strong>Office Wear:</strong> Custom suits, blazers, and crisp dress shirts.</li>
          <li><strong>Bridal & Party Wear:</strong> Exquisite wedding gowns, bridesmaids dresses, and custom party outfits.</li>
          <li><strong>Alterations:</strong> Hemming, resizing, and precision adjustments to perfect your existing wardrobe.</li>
          <li><strong>Kids & Everyday:</strong> Comfortable daily wear and specialized clothing for children.</li>
        </ul>
        <p className="mt-8 text-primary font-medium">Head over to the 'Find a Tailor' page to book a specialist!</p>
      </div>
    </div>
  );
}
