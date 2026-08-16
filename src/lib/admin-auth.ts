import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "truf-secret-key");

export async function setAdminSession(email: string, role: string = "admin") {
  const token = await new jose.SignJWT({ email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
  
  const c = await cookies();
  c.set("admin_session", token, { httpOnly: true, path: "/" });
}

export async function getAdminSession() {
  const c = await cookies();
  const token = c.get("admin_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const c = await cookies();
  c.delete("admin_session");
}
