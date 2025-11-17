import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export default async function Home() {
  const token = (await cookies()).get("token")?.value;

  try {
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET!);
      return redirect("/dashboard");
    }
  } catch {}

  return redirect("/login");
}
