export default function GuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-8">Tailor Guidelines</h1>
      <div className="glass p-12 rounded-2xl">
        <p className="text-muted-foreground mb-4">To maintain the premium quality of TailorConnect, all tailors must adhere to the following guidelines:</p>
        <ul className="list-disc pl-6 space-y-2 text-foreground/80">
          <li>Maintain a rating of 4.0 stars or higher.</li>
          <li>Respond to booking requests within 24 hours.</li>
          <li>Ensure accurate and transparent pricing for all services.</li>
          <li>Provide high-quality fabric if the "fabric included" option is selected.</li>
        </ul>
      </div>
    </div>
  );
}
