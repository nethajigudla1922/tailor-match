import { prisma } from "@/lib/prisma";
import { TailorList } from "./TailorList";
 
export const dynamic = 'force-dynamic';
 
export default async function TailorsPage() {
  // Fetch tailors from the database with all necessary relations
  const tailors = await prisma.tailorProfile.findMany({
    include: {
      user: true,
      services: true,
      reviews: true,
    }
  });
 
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find a Stylist & Tailor</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse our curated list of expert local tailors. Filter by category, verify credentials, and sort by ratings or starting prices.
        </p>
      </div>
 
      <TailorList initialTailors={tailors} />
    </div>
  );
}
