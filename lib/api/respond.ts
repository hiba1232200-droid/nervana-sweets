import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { ZodError, type ZodSchema } from "zod";

export interface SessionUser { id: string; email?: string | null; role?: string; permissions?: string[]; }

export function ok<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json({ ok: true, data }, typeof init === "number" ? { status: init } : init);
}

export function err(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export async function currentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser) ?? null;
}

export function hasPermission(user: SessionUser | null, permission: string): boolean {
  if (!user) return false;
  const perms = user.permissions ?? [];
  return perms.includes("*") || perms.includes(permission);
}

/** Parse & validate a JSON body against a zod schema. Throws a 400 response on failure. */
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw err("Invalid JSON body", 400);
  }
  try {
    return schema.parse(raw);
  } catch (e) {
    if (e instanceof ZodError) throw err("Validation failed", 422, { issues: e.flatten() });
    throw err("Validation failed", 422);
  }
}

/** Wrap a handler so thrown NextResponses (from parseBody/guards) become the response. */
export function route(handler: (req: Request, ctx: any) => Promise<Response>) {
  return async (req: Request, ctx: any): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof NextResponse) return e;
      if (e instanceof Response) return e;
      console.error("[api] unhandled error", e);
      // Instant admin alert on system errors (best-effort).
      import("@/lib/telegram/bot").then((m) => m.notifyError(new URL(req.url).pathname, e)).catch(() => {});
      return err("Internal server error", 500);
    }
  };
}
