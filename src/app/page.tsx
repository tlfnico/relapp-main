import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/modules/auth/utils/jwt";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (sessionToken) {
    const session = await verifyJWT(sessionToken);
    if (session) {
      redirect("/dashboard");
    }
  }

  redirect("/login");
}

