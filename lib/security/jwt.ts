import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// App-level JWT for stateless REST API auth (separate from NextAuth session).
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-insecure-secret");

export async function signToken(payload: JWTPayload, expiresIn = "15m"): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("nervana")
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken<T = JWTPayload>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { issuer: "nervana" });
    return payload as T;
  } catch {
    return null;
  }
}
