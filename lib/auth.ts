import crypto from "crypto";
import { cookies } from "next/headers";
const token = () =>
  "ok." + crypto.createHmac("sha256", process.env.AUTH_SECRET!).update("admin").digest("hex");
export async function login(pw: string) {
  if (pw !== process.env.ADMIN_PASSWORD) return false;
  (await cookies()).set("admin", token(), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return true;
}
export async function logout() { (await cookies()).delete("admin"); }
export async function isAdmin() { return (await cookies()).get("admin")?.value === token(); }
