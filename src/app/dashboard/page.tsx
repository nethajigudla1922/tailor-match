import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role === "TAILOR") {
    redirect("/dashboard/tailor");
  } else {
    redirect("/dashboard/customer");
  }
}
